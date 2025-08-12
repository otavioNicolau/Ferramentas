import { NextRequest, NextResponse } from 'next/server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

// Configuração de prioridades e frequências para SEO otimizado
const sitemapConfig = {
  // Páginas principais - máxima prioridade
  mainPages: {
    priority: 1.0,
    changeFreq: 'daily' as const,
    routes: ['/']
  },
  
  // Páginas importantes - alta prioridade
  importantPages: {
    priority: 0.9,
    changeFreq: 'weekly' as const,
    routes: ['/tools']
  },
  
  // Ferramentas PDF populares - alta prioridade SEO
  popularPdfTools: {
    priority: 0.9,
    changeFreq: 'weekly' as const,
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
    changeFreq: 'weekly' as const,
    routes: [
      '/baixar-youtube',
      '/baixar-tiktok',
      '/video-para-mp3'
    ]
  },
  
  // Páginas institucionais
  institutionalPages: {
    priority: 0.8,
    changeFreq: 'monthly' as const,
    routes: ['/about', '/sitemap']
  },
  
  // Ferramentas QR Code e Segurança
  securityTools: {
    priority: 0.8,
    changeFreq: 'monthly' as const,
    routes: [
      '/gerar-qrcode',
      '/ler-qrcode',
      '/gerador-senha'
    ]
  },
  
  // Outras ferramentas PDF
  otherPdfTools: {
    priority: 0.7,
    changeFreq: 'monthly' as const,
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
    changeFreq: 'monthly' as const,
    routes: [
      '/hash-generator',
      '/conversor-base64'
    ]
  },
  
  // Ferramentas web e utilitários
  webUtilities: {
    priority: 0.7,
    changeFreq: 'monthly' as const,
    routes: [
      '/encurtador-url',
      '/teste-velocidade',
      '/speech-to-text',
      '/contact'
    ]
  },
  
  // Utilitários gerais
  generalUtilities: {
    priority: 0.6,
    changeFreq: 'monthly' as const,
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
    changeFreq: 'monthly' as const,
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
    changeFreq: 'monthly' as const,
    routes: [
      '/lorem-ipsum',
      '/extract-assets',
      '/remove-assets'
    ]
  },
  
  // Páginas legais
  legalPages: {
    priority: 0.3,
    changeFreq: 'yearly' as const,
    routes: [
      '/privacy-policy',
      '/terms-of-use'
    ]
  },
  
  // Páginas de teste
  testPages: {
    priority: 0.2,
    changeFreq: 'monthly' as const,
    routes: [
      '/test-tiktok'
    ]
  }
}

export async function GET(request: NextRequest) {
  const currentDate = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
  
  // Coletar todas as URLs e ordenar por prioridade
  const allUrls: Array<{
    url: string
    priority: number
    changefreq: string
    category: string
  }> = []
  
  Object.entries(sitemapConfig).forEach(([categoryName, config]) => {
    config.routes.forEach(route => {
      allUrls.push({
        url: `${SITE_URL}${route}`,
        priority: config.priority,
        changefreq: config.changeFreq,
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
  
  // Gerar XML do sitemap
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

`
  
  allUrls.forEach(urlData => {
    xml += `  <url>
`
    xml += `    <loc>${urlData.url}</loc>
`
    xml += `    <lastmod>${currentDate}</lastmod>
`
    xml += `    <changefreq>${urlData.changefreq}</changefreq>
`
    xml += `    <priority>${urlData.priority}</priority>
`
    xml += `  </url>
`
  })
  
  xml += `</urlset>`
  
  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  })
}

// Função auxiliar para obter estatísticas do sitemap
export function getSitemapStats() {
  const totalRoutes = Object.values(sitemapConfig).reduce(
    (total, config) => total + config.routes.length,
    0
  )
  
  const categoriesCount = Object.keys(sitemapConfig).length
  
  const priorityDistribution = Object.values(sitemapConfig).reduce(
    (acc, config) => {
      const priority = config.priority.toString()
      acc[priority] = (acc[priority] || 0) + config.routes.length
      return acc
    },
    {} as Record<string, number>
  )
  
  return {
    totalRoutes,
    categoriesCount,
    priorityDistribution,
    siteUrl: SITE_URL
  }
}