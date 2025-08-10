// Script para atualizar todas as páginas com o sistema de tradução
const fs = require('fs');
const path = require('path');

// Lista de páginas para atualizar
const pagesToUpdate = [
  'bloco-notas/page.tsx',
  'cronometro/page.tsx', 
  'conversor-moeda/page.tsx',
  'conversor-unidades/page.tsx',
  'encurtador-url/page.tsx',
  'extrair-texto-ocr/page.tsx',
  'ler-qrcode/page.tsx',
  'teste-velocidade/page.tsx'
];

// Função para atualizar uma página
function updatePage(pagePath) {
  const fullPath = path.join(__dirname, 'src', 'app', pagePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`Arquivo não encontrado: ${fullPath}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Adicionar import se não existir
  if (!content.includes('getTranslations')) {
    content = content.replace(
      /import.*from '@\/lib\/utils';/,
      `import { copyToClipboard } from '@/lib/utils';
import { getTranslations } from '@/config/language';`
    );
    
    // Adicionar const t = getTranslations(); na função
    content = content.replace(
      /export default function \w+\(\) \{/,
      (match) => `${match}
  const t = getTranslations();`
    );
  }
  
  // Salvar arquivo atualizado
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Atualizado: ${pagePath}`);
}

// Executar atualizações
console.log('Iniciando atualização das páginas...');
pagesToUpdate.forEach(updatePage);
console.log('Atualização concluída!');