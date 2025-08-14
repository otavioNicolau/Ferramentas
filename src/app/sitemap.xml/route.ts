import { NextRequest, NextResponse } from 'next/server'

// Lista de idiomas suportados
const supportedLanguages = [
  'pt-BR', 'en', 'es', 'zh', 'hi', 'ar', 'bn', 'ru', 'ja', 'de', 'fr', 'it', 'ko', 'tr', 'pl', 'nl', 'sv', 'uk', 'vi', 'th'
];

// Mapeamento de subdomínios para códigos de idioma
const subdomainToLanguage: Record<string, string> = {
  'br': 'pt-BR',
  'ko': 'ko',
  'en': 'en',
  'es': 'es',
  'zh': 'zh',
  'hi': 'hi',
  'ar': 'ar',
  'bn': 'bn',
  'ru': 'ru',
  'ja': 'ja',
  'de': 'de',
  'fr': 'fr',
  'it': 'it',
  'tr': 'tr',
  'pl': 'pl',
  'nl': 'nl',
  'sv': 'sv',
  'uk': 'uk',
  'vi': 'vi',
  'th': 'th'
};

// Função para detectar idioma baseado no subdomínio
function detectLanguageFromRequest(request: NextRequest): string {
  // Primeiro tenta obter do header X-Forwarded-Host ou Host (para proxies)
  const hostHeader = request.headers.get('x-forwarded-host') || request.headers.get('host')
  let hostname = hostHeader || request.nextUrl.hostname
  
  // Remove a porta se presente
  hostname = hostname.split(':')[0];
  
  // Extrai o subdomínio
  const parts = hostname.split('.');
  
  // Se não há subdomínio (apenas muiltools.com ou localhost), usa pt-BR
  if (parts.length <= 2) {
    return 'pt-BR';
  }
  
  // Pega o primeiro subdomínio
  const subdomain = parts[0];
  
  // Retorna o idioma correspondente ou pt-BR como padrão
  return subdomainToLanguage[subdomain] || 'pt-BR';
}

// Função para obter a URL base do request
function getSiteUrl(request: NextRequest): string {
  const url = new URL(request.url)
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || url.host
  const protocol = request.headers.get('x-forwarded-proto') || url.protocol.replace(':', '')
  return `${protocol}://${host}`
}

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
      '/contact',
      '/status-dependencies'
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
  const siteUrl = getSiteUrl(request)
  const detectedLanguage = detectLanguageFromRequest(request)
  
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
        url: `${siteUrl}${route}`,
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
  
  // Gerar XML do sitemap com informações específicas do domínio/idioma
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Sitemap dinâmico para ${siteUrl} -->
<!-- Idioma detectado: ${detectedLanguage} -->
<!-- Gerado em: ${new Date().toISOString()} -->
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
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'X-Sitemap-Language': detectedLanguage,
      'X-Sitemap-Domain': siteUrl
    }
  })
}

// Função para obter estatísticas do sitemap (usada pela API)
export function getSitemapStats(siteUrl = 'http://localhost:3000', language = 'pt-BR') {
  const detectedLanguage = language
  
  // Coletar todas as URLs
  const allUrls: Array<{
    url: string
    priority: number
    changefreq: string
    category: string
  }> = []
  
  Object.entries(sitemapConfig).forEach(([categoryName, config]) => {
    config.routes.forEach(route => {
      allUrls.push({
        url: `${siteUrl}${route}`,
        priority: config.priority,
        changefreq: config.changeFreq,
        category: categoryName
      })
    })
  })
  
  // Calcular estatísticas
  const totalRoutes = allUrls.length
  const categoriesCount = Object.keys(sitemapConfig).length
  
  // Distribuição de prioridades
  const priorityDistribution: Record<string, number> = {}
  allUrls.forEach(url => {
    const priority = url.priority.toString()
    priorityDistribution[priority] = (priorityDistribution[priority] || 0) + 1
  })
  
  // Informações sobre idiomas disponíveis
  const availableLanguages = supportedLanguages.length
  
  return {
    totalRoutes,
    categoriesCount,
    priorityDistribution,
    siteUrl,
    detectedLanguage,
    availableLanguages,
    supportedLanguages,
    lastGenerated: new Date().toISOString()
  }
}