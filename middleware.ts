import { NextRequest, NextResponse } from 'next/server';

// Lista de idiomas suportados
const supportedLanguages = [
  'pt-BR', 'en', 'es', 'zh', 'hi', 'ar', 'bn', 'ru', 'ja', 'de', 'fr', 'it', 'ko', 'tr', 'pl', 'nl', 'sv', 'uk', 'vi', 'th'
];

// Mapeamento de subdomínios para códigos de idioma
const subdomainToLanguage: Record<string, string> = {
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

export function middleware(request: NextRequest) {
  const hostname = request.nextUrl.hostname;
  const pathname = request.nextUrl.pathname;
  
  // Extrai o subdomínio
  const parts = hostname.split('.');
  
  // Se não há subdomínio (apenas muiltools.com), continua normalmente (será pt-BR)
  if (parts.length <= 2) {
    return NextResponse.next();
  }
  
  // Pega o primeiro subdomínio
  const subdomain = parts[0];
  
  // Verifica se o subdomínio corresponde a um idioma suportado
  if (subdomainToLanguage[subdomain]) {
    // Adiciona um header personalizado com o idioma detectado
    const response = NextResponse.next();
    response.headers.set('x-detected-language', subdomainToLanguage[subdomain]);
    return response;
  }
  
  // Se o subdomínio não é reconhecido, continua normalmente
  return NextResponse.next();
}

// Configuração do matcher para aplicar o middleware a todas as rotas
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};