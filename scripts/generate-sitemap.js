#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// Configuração do sitemap com técnicas avançadas de SEO - NICOLLAUTOOLS
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const currentDate = new Date().toISOString().split('T')[0]

// Estrutura hierárquica para SEO otimizado
const sitemapStructure = {
  // Páginas principais - máxima prioridade
  mainPages: {
    priority: 1.0,
    changefreq: 'daily',
    routes: ['/']
  },
  
  // Páginas importantes - alta prioridade
  importantPages: {
    priority: 0.9,
    changefreq: 'weekly',
    routes: ['/tools']
  },
  
  // Ferramentas PDF populares - alta prioridade SEO
  popularPdfTools: {
    priority: 0.9,
    changefreq: 'weekly',
    routes: [
      '/compactar-pdf',
      '/compress-pdf',
      '/dividir-pdf',
      '/split-pdf',
      '/juntar-pdf',
      '/merge-pdf',
      '/pdf-to-word',
      '/word-to-pdf',
      '/pdf-to-excel',
      '/excel-to-pdf',
      '/pdf-para-imagem',
      '/pdf-to-jpg',
      '/imagem-para-pdf',
      '/jpg-to-pdf'
    ]
  },
  
  // Ferramentas multimídia populares
  popularMediaTools: {
    priority: 0.8,
    changefreq: 'weekly',
    routes: [
      '/baixar-youtube',
      '/baixar-tiktok',
      '/video-para-mp3'
    ]
  },
  
  // Páginas institucionais
  institutionalPages: {
    priority: 0.8,
    changefreq: 'monthly',
    routes: ['/about', '/sitemap']
  },
  
  // Ferramentas QR Code e Segurança
  securityTools: {
    priority: 0.8,
    changefreq: 'monthly',
    routes: [
      '/gerar-qrcode',
      '/ler-qrcode',
      '/gerador-senha'
    ]
  },
  
  // Outras ferramentas PDF
  otherPdfTools: {
    priority: 0.7,
    changefreq: 'monthly',
    routes: [
      '/juntar-pdfs',
      '/rotate-pages',
      '/sort-pages',
      '/crop-pdf',
      '/resize-pdf',
      '/optimize-pdf',
      '/protect-pdf',
      '/unlock-pdf',
      '/assinar-pdf',
      '/edit-pdf',
      '/pdf-creator',
      '/pdf-to-ppt',
      '/ppt-to-pdf',
      '/pdf-to-text'
    ]
  },
  
  // Ferramentas de segurança secundárias
  secondarySecurityTools: {
    priority: 0.7,
    changefreq: 'monthly',
    routes: [
      '/hash-generator',
      '/conversor-base64'
    ]
  },
  
  // Ferramentas web e utilitários
  webUtilities: {
    priority: 0.7,
    changefreq: 'monthly',
    routes: [
      '/encurtador-url',
      '/teste-velocidade',
      '/speech-to-text',
      '/status-dependencies',
      '/contact'
    ]
  },
  
  // Utilitários gerais
  generalUtilities: {
    priority: 0.6,
    changefreq: 'monthly',
    routes: [
      '/calculadora',
      '/cronometro',
      '/bloco-notas',
      '/contador-caracteres',
      '/conversor-moeda',
      '/conversor-unidades',
      '/gerador-cores',
      '/compare-pdf',
      '/extrair-texto-ocr'
    ]
  },
  
  // Ferramentas PDF avançadas
  advancedPdfTools: {
    priority: 0.6,
    changefreq: 'monthly',
    routes: [
      '/repair-pdf',
      '/searchable-pdf',
      '/validate-pdfa',
      '/pdf-to-speech',
      '/pdf-to-pdfa',
      '/djvu-to-pdf',
      '/epub-to-pdf'
    ]
  },
  
  // Ferramentas menos utilizadas
  lessUsedTools: {
    priority: 0.5,
    changefreq: 'monthly',
    routes: [
      '/lorem-ipsum',
      '/extract-assets',
      '/remove-assets'
    ]
  },
  
  // Páginas legais
  legalPages: {
    priority: 0.3,
    changefreq: 'yearly',
    routes: [
      '/privacy-policy',
      '/terms-of-use'
    ]
  },
  
  // Páginas de teste
  testPages: {
    priority: 0.2,
    changefreq: 'monthly',
    routes: [
      '/test-tiktok'
    ]
  }
}

// Função para gerar XML do sitemap
function generateSitemapXML() {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

`

  // Coletar todas as URLs e ordenar por prioridade
  const allUrls = []
  
  Object.entries(sitemapStructure).forEach(([categoryName, config]) => {
    config.routes.forEach(route => {
      allUrls.push({
        url: `${SITE_URL}${route}`,
        priority: config.priority,
        changefreq: config.changefreq,
        category: categoryName
      })
    })
  })
  
  // Ordenar por prioridade (maior primeiro) e depois alfabeticamente
  allUrls.sort((a, b) => {
    if (b.priority !== a.priority) {
      return b.priority - a.priority
    }
    return a.url.localeCompare(b.url)
  })
  
  // Agrupar por categoria para comentários organizados
  const categorizedUrls = {}
  allUrls.forEach(urlData => {
    if (!categorizedUrls[urlData.category]) {
      categorizedUrls[urlData.category] = []
    }
    categorizedUrls[urlData.category].push(urlData)
  })
  
  // Mapear nomes de categorias para comentários legíveis
  const categoryComments = {
    mainPages: 'PÁGINAS PRINCIPAIS - Máxima Prioridade',
    importantPages: 'PÁGINAS IMPORTANTES - Alta Prioridade',
    popularPdfTools: 'FERRAMENTAS PDF POPULARES - Alta Prioridade SEO',
    popularMediaTools: 'FERRAMENTAS MULTIMÍDIA POPULARES',
    institutionalPages: 'PÁGINAS INSTITUCIONAIS',
    securityTools: 'FERRAMENTAS QR CODE E SEGURANÇA',
    otherPdfTools: 'OUTRAS FERRAMENTAS PDF',
    secondarySecurityTools: 'FERRAMENTAS DE SEGURANÇA SECUNDÁRIAS',
    webUtilities: 'FERRAMENTAS WEB E UTILITÁRIOS',
    generalUtilities: 'UTILITÁRIOS GERAIS',
    advancedPdfTools: 'FERRAMENTAS PDF AVANÇADAS',
    lessUsedTools: 'FERRAMENTAS MENOS UTILIZADAS',
    legalPages: 'PÁGINAS LEGAIS E INSTITUCIONAIS',
    testPages: 'PÁGINAS DE TESTE - Baixa Prioridade'
  }
  
  // Gerar XML por categoria
  Object.entries(categorizedUrls).forEach(([category, urls]) => {
    xml += `  <!-- ${categoryComments[category] || category.toUpperCase()} -->\n`
    
    urls.forEach(urlData => {
      xml += `  <url>\n`
      xml += `    <loc>${urlData.url}</loc>\n`
      xml += `    <lastmod>${currentDate}</lastmod>\n`
      xml += `    <changefreq>${urlData.changefreq}</changefreq>\n`
      xml += `    <priority>${urlData.priority}</priority>\n`
      xml += `  </url>\n`
    })
    
    xml += `\n`
  })
  
  xml += `</urlset>`
  
  return xml
}

// Função para gerar estatísticas do sitemap
function generateStats() {
  const totalRoutes = Object.values(sitemapStructure).reduce(
    (total, config) => total + config.routes.length,
    0
  )
  
  const categoriesCount = Object.keys(sitemapStructure).length
  
  const priorityDistribution = Object.values(sitemapStructure).reduce(
    (acc, config) => {
      const priority = config.priority.toString()
      acc[priority] = (acc[priority] || 0) + config.routes.length
      return acc
    },
    {}
  )
  
  return {
    totalRoutes,
    categoriesCount,
    priorityDistribution,
    siteUrl: SITE_URL,
    generatedAt: new Date().toISOString()
  }
}

// Função principal
function main() {
  try {
    console.log('🚀 Gerando sitemap.xml otimizado para SEO...')
    console.log(`📍 Site URL: ${SITE_URL}`)
    
    // Gerar XML do sitemap
    const sitemapXML = generateSitemapXML()
    
    // Salvar arquivo
    const outputPath = path.join(__dirname, '..', 'public', 'sitemap.xml')
    fs.writeFileSync(outputPath, sitemapXML, 'utf8')
    
    // Gerar estatísticas
    const stats = generateStats()
    
    console.log('✅ Sitemap gerado com sucesso!')
    console.log(`📊 Estatísticas:`)
    console.log(`   • Total de rotas: ${stats.totalRoutes}`)
    console.log(`   • Categorias: ${stats.categoriesCount}`)
    console.log(`   • Distribuição de prioridades:`, stats.priorityDistribution)
    console.log(`   • Arquivo salvo em: ${outputPath}`)
    
    // Salvar estatísticas em JSON
    const statsPath = path.join(__dirname, '..', 'public', 'sitemap-stats.json')
    fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2), 'utf8')
    console.log(`📈 Estatísticas salvas em: ${statsPath}`)
    
  } catch (error) {
    console.error('❌ Erro ao gerar sitemap:', error)
    process.exit(1)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main()
}

module.exports = {
  generateSitemapXML,
  generateStats,
  sitemapStructure
}