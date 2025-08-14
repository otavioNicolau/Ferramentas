import { NextRequest, NextResponse } from 'next/server'
import { getSitemapStats } from '../../sitemap.xml/route'

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

export async function GET(request: NextRequest) {
  try {
    const siteUrl = getSiteUrl(request)
    const detectedLanguage = detectLanguageFromRequest(request)
    const stats = getSitemapStats(siteUrl, detectedLanguage)
    
    return NextResponse.json(stats, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        'X-Sitemap-Language': detectedLanguage,
        'X-Sitemap-Domain': siteUrl
      }
    })
  } catch (error) {
    console.error('Erro ao gerar estatísticas do sitemap:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}