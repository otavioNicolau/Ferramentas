import { NextRequest, NextResponse } from 'next/server'

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
  // Primeiro tenta obter do header Host (para testes e proxies)
  const hostHeader = request.headers.get('host');
  let hostname = hostHeader || request.nextUrl.hostname;
  
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
  // Sempre usar a URL do request para garantir URL dinâmica
  const url = new URL(request.url)
  const dynamicUrl = `${url.protocol}//${url.host}`
  
  // Só usar variável de ambiente se não for localhost e estiver definida
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (envUrl && envUrl.trim() !== '' && !envUrl.includes('localhost')) {
    return envUrl
  }
  
  return dynamicUrl
}

export async function GET(request: NextRequest) {
  const siteUrl = getSiteUrl(request)
  const detectedLanguage = detectLanguageFromRequest(request)
  const hostUrl = siteUrl.replace(/^https?:\/\//, '')
  
  const robotsContent = `# Robots.txt otimizado para SEO - MUILTOOLS
# Gerado dinamicamente em ${new Date().toISOString()}
# Domínio: ${siteUrl}
# Idioma detectado: ${detectedLanguage}

# Configuração padrão para todos os bots
User-agent: *
Allow: /

# Bloquear diretórios administrativos e técnicos
Disallow: /api/
Disallow: /_next/
Disallow: /admin/
Disallow: /private/
Disallow: /.well-known/

# Permitir acesso específico a recursos importantes
Allow: /api/sitemap-stats
Allow: /_next/static/

# Permitir todas as ferramentas principais
Allow: /compactar-*
Allow: /compress-*
Allow: /dividir-*
Allow: /split-*
Allow: /juntar-*
Allow: /merge-*
Allow: /pdf-*
Allow: /word-*
Allow: /excel-*
Allow: /imagem-*
Allow: /jpg-*
Allow: /baixar-*
Allow: /video-*
Allow: /gerar-*
Allow: /ler-*
Allow: /gerador-*
Allow: /conversor-*
Allow: /contador-*
Allow: /encurtador-*
Allow: /teste-*
Allow: /speech-*
Allow: /hash-*
Allow: /calculadora
Allow: /cronometro
Allow: /bloco-notas
Allow: /lorem-ipsum
Allow: /about
Allow: /contact
Allow: /sitemap
Allow: /tools
Allow: /rotate-*
Allow: /sort-*
Allow: /crop-*
Allow: /resize-*
Allow: /optimize-*
Allow: /protect-*
Allow: /unlock-*
Allow: /assinar-*
Allow: /edit-*
Allow: /repair-*
Allow: /searchable-*
Allow: /validate-*

# Configurações avançadas para SEO
# Crawl-delay para evitar sobrecarga do servidor
Crawl-delay: 1

# Referência ao sitemap XML (essencial para SEO)
Sitemap: ${siteUrl}/sitemap.xml

# Host preferido (importante para SEO)
Host: ${hostUrl}

# Configurações específicas para bots populares
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 1

User-agent: Slurp
Allow: /
Crawl-delay: 2

User-agent: DuckDuckBot
Allow: /
Crawl-delay: 1

User-agent: Baiduspider
Allow: /
Crawl-delay: 2

User-agent: YandexBot
Allow: /
Crawl-delay: 2

# Bloquear bots maliciosos e scrapers
User-agent: AhrefsBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: DotBot
Disallow: /

User-agent: SemrushBot
Disallow: /

User-agent: MegaIndex
Disallow: /

# Configurações para redes sociais
User-agent: facebookexternalhit
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: LinkedInBot
Allow: /

User-agent: WhatsApp
Allow: /

# Configuração final
# Este arquivo é gerado dinamicamente e se adapta automaticamente
# à URL do servidor onde está hospedado
`

  return new NextResponse(robotsContent, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'X-Robots-Language': detectedLanguage,
      'X-Robots-Domain': siteUrl
    }
  })
}