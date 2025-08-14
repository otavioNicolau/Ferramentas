import { NextRequest, NextResponse } from 'next/server'
import { getSitemapStats } from '../../sitemap.xml/route'

// Função para obter a URL base do request
function getSiteUrl(request: NextRequest): string {
  // Tentar obter da variável de ambiente primeiro
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (envUrl && envUrl !== 'http://localhost:3000') {
    return envUrl
  }
  
  // Se não houver ou for localhost, usar a URL do request
  const url = new URL(request.url)
  return `${url.protocol}//${url.host}`
}

export async function GET(request: NextRequest) {
  try {
    const siteUrl = getSiteUrl(request)
    const stats = getSitemapStats(siteUrl)
    
    return NextResponse.json(stats, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
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