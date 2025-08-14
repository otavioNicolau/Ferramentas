import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

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
    
    // Verificar se estamos em ambiente de desenvolvimento ou produção
    const isProduction = process.env.NODE_ENV === 'production' || process.env.NETLIFY;
    const isDevelopment = !isProduction;
    
    let installedPackages: NpmListOutput = {};
    
    // Em desenvolvimento, tentar verificar pacotes realmente instalados
    if (isDevelopment) {
      try {
        const { execSync } = require('child_process');
        const npmListOutput = execSync('npm list --json --depth=0', { 
          encoding: 'utf8',
          cwd: process.cwd(),
          timeout: 10000 // 10 segundos timeout
        });
        installedPackages = JSON.parse(npmListOutput);
      } catch (error) {
        console.warn('Não foi possível executar npm list:', error);
        // Fallback: assumir que nada está instalado
        installedPackages = { dependencies: {} };
      }
    }
    
    // Processar dependências principais
    if (packageJson.dependencies) {
      for (const [name, version] of Object.entries(packageJson.dependencies)) {
        let installed = false;
        let installedVersion: string | undefined = undefined;
        let status: 'installed' | 'outdated' | 'missing' = 'missing';
        
        if (isProduction) {
          // Em produção, assumimos que as dependências estão instaladas
          installed = true;
          installedVersion = version.replace(/[^\d\.]/g, '');
          status = 'installed';
        } else if (isDevelopment && installedPackages.dependencies?.[name]) {
          // Em desenvolvimento, verificar se realmente está instalado
          installed = true;
          installedVersion = installedPackages.dependencies[name].version;
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
        let installed = false;
        let installedVersion: string | undefined = undefined;
        let status: 'installed' | 'outdated' | 'missing' = 'missing';
        
        if (isProduction) {
          // Em produção, devDependencies geralmente não estão instaladas
          installed = false;
          installedVersion = undefined;
          status = 'missing';
        } else if (isDevelopment && installedPackages.dependencies?.[name]) {
          // Em desenvolvimento, verificar se realmente está instalado
          installed = true;
          installedVersion = installedPackages.dependencies[name].version;
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
  // Funcionalidades de instalação/atualização não disponíveis em produção (Netlify)
  const isProduction = process.env.NODE_ENV === 'production' || process.env.NETLIFY;
  
  if (isProduction) {
    return NextResponse.json(
      {
        success: false,
        error: 'Funcionalidades de instalação/atualização não disponíveis em produção',
        message: 'Esta funcionalidade está disponível apenas em ambiente de desenvolvimento'
      },
      { status: 403 }
    );
  }
  
  return NextResponse.json(
    {
      success: false,
      error: 'Funcionalidade não implementada para ambiente de desenvolvimento local',
      message: 'Use npm install ou npm update diretamente no terminal'
    },
    { status: 501 }
  );
}