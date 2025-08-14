#!/usr/bin/env node

/**
 * Script de diagnóstico para problemas de instalação em VPS
 * Identifica problemas comuns e sugere soluções
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

console.log('🔍 Diagnóstico VPS - Problemas de Instalação\n');
console.log('=' .repeat(50));

// Função para executar comandos com segurança
function safeExec(command, description) {
    try {
        const result = execSync(command, { encoding: 'utf8', timeout: 10000 });
        console.log(`✅ ${description}: ${result.trim()}`);
        return result.trim();
    } catch (error) {
        console.log(`❌ ${description}: ${error.message}`);
        return null;
    }
}

// Função para verificar arquivo
function checkFile(filePath, description) {
    try {
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            console.log(`✅ ${description}: Existe (${(stats.size / 1024).toFixed(2)} KB)`);
            return true;
        } else {
            console.log(`❌ ${description}: Não encontrado`);
            return false;
        }
    } catch (error) {
        console.log(`❌ ${description}: Erro - ${error.message}`);
        return false;
    }
}

// 1. Informações do Sistema
console.log('\n📊 INFORMAÇÕES DO SISTEMA');
console.log('-'.repeat(30));
console.log(`Sistema Operacional: ${os.type()} ${os.release()}`);
console.log(`Arquitetura: ${os.arch()}`);
console.log(`CPUs: ${os.cpus().length}`);
console.log(`Memória Total: ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`);
console.log(`Memória Livre: ${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`);
console.log(`Uptime: ${(os.uptime() / 3600).toFixed(2)} horas`);

// 2. Verificar Node.js e npm
console.log('\n🟢 NODE.JS E NPM');
console.log('-'.repeat(30));
const nodeVersion = safeExec('node --version', 'Node.js');
const npmVersion = safeExec('npm --version', 'npm');
const npxVersion = safeExec('npx --version', 'npx');

// Verificar versões mínimas
if (nodeVersion) {
    const majorVersion = parseInt(nodeVersion.replace('v', '').split('.')[0]);
    if (majorVersion < 18) {
        console.log(`⚠️  Aviso: Node.js ${nodeVersion} pode ser muito antigo. Recomendado: v18+`);
    }
}

// 3. Verificar conectividade
console.log('\n🌐 CONECTIVIDADE');
console.log('-'.repeat(30));
safeExec('ping -c 1 registry.npmjs.org', 'Ping para registry.npmjs.org');
safeExec('curl -I https://registry.npmjs.org/', 'HTTPS para registry');

// 4. Configurações do npm
console.log('\n⚙️  CONFIGURAÇÕES NPM');
console.log('-'.repeat(30));
safeExec('npm config get registry', 'Registry');
safeExec('npm config get timeout', 'Timeout');
safeExec('npm config get proxy', 'Proxy');
safeExec('npm config get https-proxy', 'HTTPS Proxy');
safeExec('npm config get cache', 'Cache Directory');

// 5. Verificar arquivos do projeto
console.log('\n📁 ARQUIVOS DO PROJETO');
console.log('-'.repeat(30));
checkFile('package.json', 'package.json');
checkFile('package-lock.json', 'package-lock.json');
checkFile('node_modules', 'node_modules');
checkFile('.npmrc', '.npmrc');
checkFile('next.config.ts', 'next.config.ts');
checkFile('tsconfig.json', 'tsconfig.json');
checkFile('tailwind.config.ts', 'tailwind.config.ts');

// 6. Analisar package.json
console.log('\n📦 ANÁLISE PACKAGE.JSON');
console.log('-'.repeat(30));
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    const prodDeps = Object.keys(packageJson.dependencies || {});
    const devDeps = Object.keys(packageJson.devDependencies || {});
    
    console.log(`✅ Dependências de produção: ${prodDeps.length}`);
    console.log(`✅ Dependências de desenvolvimento: ${devDeps.length}`);
    
    // Verificar dependências problemáticas
    const problematicDeps = [
        '@types/fluent-ffmpeg',
        'fluent-ffmpeg',
        'canvas',
        'sharp',
        'node-gyp'
    ];
    
    const foundProblematic = [...prodDeps, ...devDeps].filter(dep => 
        problematicDeps.some(prob => dep.includes(prob))
    );
    
    if (foundProblematic.length > 0) {
        console.log(`⚠️  Dependências que podem causar problemas: ${foundProblematic.join(', ')}`);
    }
    
} catch (error) {
    console.log(`❌ Erro ao ler package.json: ${error.message}`);
}

// 7. Verificar espaço em disco
console.log('\n💾 ESPAÇO EM DISCO');
console.log('-'.repeat(30));
try {
    if (process.platform === 'win32') {
        safeExec('dir /-c', 'Espaço disponível');
    } else {
        safeExec('df -h .', 'Espaço disponível');
    }
} catch (error) {
    console.log(`❌ Erro ao verificar espaço: ${error.message}`);
}

// 8. Verificar permissões
console.log('\n🔐 PERMISSÕES');
console.log('-'.repeat(30));
try {
    fs.accessSync('.', fs.constants.R_OK | fs.constants.W_OK);
    console.log('✅ Permissões de leitura/escrita: OK');
} catch (error) {
    console.log(`❌ Problemas de permissão: ${error.message}`);
}

// 9. Testar instalação simples
console.log('\n🧪 TESTE DE INSTALAÇÃO');
console.log('-'.repeat(30));
console.log('Testando instalação de pacote simples...');
safeExec('npm install --dry-run lodash', 'Teste dry-run');

// 10. Sugestões de solução
console.log('\n💡 SUGESTÕES DE SOLUÇÃO');
console.log('-'.repeat(30));

const suggestions = [];

// Verificar se precisa de configuração npm
if (!fs.existsSync('.npmrc')) {
    suggestions.push('Copiar configuração otimizada: cp .npmrc-vps .npmrc');
}

// Verificar se node_modules existe e está corrompido
if (fs.existsSync('node_modules')) {
    suggestions.push('Limpar instalação: rm -rf node_modules package-lock.json');
}

// Verificar memória baixa
const freeMemGB = os.freemem() / 1024 / 1024 / 1024;
if (freeMemGB < 1) {
    suggestions.push('Memória baixa - considere adicionar swap ou aumentar RAM');
}

// Verificar versão do Node
if (nodeVersion && parseInt(nodeVersion.replace('v', '').split('.')[0]) < 18) {
    suggestions.push('Atualizar Node.js para versão 18 ou superior');
}

suggestions.push('Executar script automatizado: ./install-vps.sh (Linux) ou install-vps.ps1 (Windows)');
suggestions.push('Instalar dependências separadamente: npm install --only=production && npm install --only=development');
suggestions.push('Usar flags de compatibilidade: npm install --legacy-peer-deps --no-audit --no-fund');

suggestions.forEach((suggestion, index) => {
    console.log(`${index + 1}. ${suggestion}`);
});

console.log('\n🎯 COMANDOS RÁPIDOS');
console.log('-'.repeat(30));
console.log('# Solução completa:');
console.log('npm cache clean --force && rm -rf node_modules package-lock.json && npm install --legacy-peer-deps');
console.log('\n# Apenas produção:');
console.log('npm install --only=production --no-audit --no-fund');
console.log('\n# Forçar instalação:');
console.log('npm install --force --legacy-peer-deps');

console.log('\n' + '='.repeat(50));
console.log('✅ Diagnóstico concluído!');
console.log('📖 Para mais detalhes, consulte: VPS_INSTALL_GUIDE.md');