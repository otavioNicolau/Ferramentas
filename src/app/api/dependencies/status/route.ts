import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface DependencyStatus {
  name: string;
  version: string;
  installed: boolean;
  installedVersion?: string;
  status: 'installed' | 'outdated' | 'missing';
  type: 'dependency' | 'devDependency';
}

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

interface NpmListOutput {
  dependencies?: Record<string, {
    version: string;
    resolved?: string;
    overridden?: boolean;
  }>;
}

function compareVersions(expected: string, installed: string): 'installed' | 'outdated' {
  // Remove caracteres especiais como ^, ~, etc.
  const cleanExpected = expected.replace(/[^\d\.]/g, '');
  const cleanInstalled = installed.replace(/[^\d\.]/g, '');
  
  const expectedParts = cleanExpected.split('.').map(Number);
  const installedParts = cleanInstalled.split('.').map(Number);
  
  // Compara versão major, minor, patch
  for (let i = 0; i < Math.max(expectedParts.length, installedParts.length); i++) {
    const exp = expectedParts[i] || 0;
    const inst = installedParts[i] || 0;
    
    if (inst > exp) return 'installed'; // Versão mais nova
    if (inst < exp) return 'outdated';  // Versão mais antiga
  }
  
  return 'installed'; // Versões iguais
}

export async function GET(request: NextRequest) {
  try {
    // Ler package.json
    const packageJsonPath = join(process.cwd(), 'package.json');
    const packageJsonContent = readFileSync(packageJsonPath, 'utf-8');
    const packageJson: PackageJson = JSON.parse(packageJsonContent);
    
    const dependencies: DependencyStatus[] = [];
    
    // Obter lista de pacotes instalados
    let installedPackages: NpmListOutput = {};
    try {
      const { stdout } = await execAsync('npm list --json --depth=0', {
        cwd: process.cwd(),
        timeout: 30000 // 30 segundos timeout
      });
      installedPackages = JSON.parse(stdout);
    } catch (error) {
      console.warn('Erro ao executar npm list:', error);
      // Continua sem a informação de pacotes instalados
    }
    
    // Processar dependências principais
    if (packageJson.dependencies) {
      for (const [name, version] of Object.entries(packageJson.dependencies)) {
        const installedInfo = installedPackages.dependencies?.[name];
        const installed = !!installedInfo;
        const installedVersion = installedInfo?.version;
        
        let status: 'installed' | 'outdated' | 'missing' = 'missing';
        if (installed && installedVersion) {
          status = compareVersions(version, installedVersion);
        }
        
        dependencies.push({
          name,
          version,
          installed,
          installedVersion,
          status,
          type: 'dependency'
        });
      }
    }
    
    // Processar devDependencies
    if (packageJson.devDependencies) {
      for (const [name, version] of Object.entries(packageJson.devDependencies)) {
        const installedInfo = installedPackages.dependencies?.[name];
        const installed = !!installedInfo;
        const installedVersion = installedInfo?.version;
        
        let status: 'installed' | 'outdated' | 'missing' = 'missing';
        if (installed && installedVersion) {
          status = compareVersions(version, installedVersion);
        }
        
        dependencies.push({
          name,
          version,
          installed,
          installedVersion,
          status,
          type: 'devDependency'
        });
      }
    }
    
    // Ordenar por nome
    dependencies.sort((a, b) => a.name.localeCompare(b.name));
    
    // Calcular estatísticas
    const stats = {
      total: dependencies.length,
      installed: dependencies.filter(d => d.status === 'installed').length,
      outdated: dependencies.filter(d => d.status === 'outdated').length,
      missing: dependencies.filter(d => d.status === 'missing').length,
      dependencies: dependencies.filter(d => d.type === 'dependency').length,
      devDependencies: dependencies.filter(d => d.type === 'devDependency').length
    };
    
    return NextResponse.json({
      success: true,
      dependencies,
      stats,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Erro ao verificar dependências:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor ao verificar dependências',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, packages } = body;
    
    if (action === 'install' && packages && Array.isArray(packages)) {
      // Instalar pacotes específicos
      const packageList = packages.join(' ');
      
      try {
        const { stdout, stderr } = await execAsync(`npm install ${packageList}`, {
          cwd: process.cwd(),
          timeout: 120000 // 2 minutos timeout
        });
        
        return NextResponse.json({
          success: true,
          message: `Pacotes instalados com sucesso: ${packageList}`,
          output: stdout,
          errors: stderr
        });
        
      } catch (installError) {
        return NextResponse.json(
          {
            success: false,
            error: 'Erro ao instalar pacotes',
            details: installError instanceof Error ? installError.message : 'Erro desconhecido'
          },
          { status: 500 }
        );
      }
    }
    
    if (action === 'update') {
      // Atualizar todas as dependências
      try {
        const { stdout, stderr } = await execAsync('npm update', {
          cwd: process.cwd(),
          timeout: 300000 // 5 minutos timeout
        });
        
        return NextResponse.json({
          success: true,
          message: 'Dependências atualizadas com sucesso',
          output: stdout,
          errors: stderr
        });
        
      } catch (updateError) {
        return NextResponse.json(
          {
            success: false,
            error: 'Erro ao atualizar dependências',
            details: updateError instanceof Error ? updateError.message : 'Erro desconhecido'
          },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Ação não suportada',
        supportedActions: ['install', 'update']
      },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('Erro ao processar requisição POST:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}