import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL é obrigatória' }, { status: 400 });
    }
    
    // Importar a biblioteca do TikTok
    const { Downloader } = await import('@tobyg74/tiktok-api-dl');
    
    // Testar diferentes versões da API
    const versions = ['v1', 'v2', 'v3'] as const;
    const results: any = {};
    
    for (const version of versions) {
      try {
        console.log(`Testando versão ${version}...`);
        const result = await Downloader(url, { version });
        results[version] = {
          status: result.status,
          message: result.message,
          hasResult: !!result.result,
          resultKeys: result.result ? Object.keys(result.result) : [],
          sampleData: result.result ? {
            type: result.result.type,
            hasAuthor: !!result.result.author,
            hasStats: !!(result.result as any).stats,
            hasStatistics: !!(result.result as any).statistics,
            authorKeys: result.result.author ? Object.keys(result.result.author) : [],
            allKeys: Object.keys(result.result)
          } : null
        };
      } catch (error) {
        results[version] = {
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        };
      }
    }
    
    return NextResponse.json({
      url,
      results,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
