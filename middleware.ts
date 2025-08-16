import { NextRequest, NextResponse } from 'next/server';

const SUBDOMAIN_TO_LANG = {
  br: 'pt-BR',
  pt: 'pt-BR', // aceitar 'pt' também
  en: 'en',
  es: 'es',
  ko: 'ko',
  zh: 'zh',
  hi: 'hi',
  ar: 'ar',
  bn: 'bn',
  ru: 'ru',
  ja: 'ja',
  de: 'de',
  fr: 'fr',
  it: 'it',
  tr: 'tr',
  pl: 'pl',
  nl: 'nl',
  sv: 'sv',
  uk: 'uk',
  vi: 'vi',
  th: 'th'
} as const;

const DEFAULT_LANG = 'pt-BR';

type Lang = typeof SUBDOMAIN_TO_LANG[keyof typeof SUBDOMAIN_TO_LANG];

function resolveLangFromHost(host: string): Lang {
  // Extrair subdomínio do host
  const parts = host.split('.');
  
  // Se não há subdomínio (ex: muiltools.com), usar DEFAULT_LANG
  if (parts.length <= 2) {
    return DEFAULT_LANG;
  }
  
  const subdomain = parts[0];
  
  // Mapear subdomínio para idioma
  const lang = SUBDOMAIN_TO_LANG[subdomain as keyof typeof SUBDOMAIN_TO_LANG];
  
  return lang || DEFAULT_LANG;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Ignorar assets estáticos e rotas de API
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') || // arquivos estáticos (favicon.ico, robots.txt, etc.)
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/robots') ||
    pathname.startsWith('/sitemap')
  ) {
    return NextResponse.next();
  }
  
  // Obter host (priorizar x-forwarded-host para produção com proxy/CDN)
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
  
  // Resolver idioma baseado no host
  const lang = resolveLangFromHost(host);
  
  // Criar response
  const response = NextResponse.next();
  
  // Adicionar header x-lang
  response.headers.set('x-lang', lang);
  
  // Setar cookie lang (HttpOnly=false para acesso no cliente)
  response.cookies.set('lang', lang, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365, // 1 ano
  });
  
  return response;
}

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