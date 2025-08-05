import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Importar a biblioteca do TikTok para teste
    const { Downloader } = await import('@tobyg74/tiktok-api-dl');
    
    return NextResponse.json({
      status: 'success',
      message: 'API do TikTok carregada com sucesso',
      apiType: typeof Downloader,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({
        status: 'error',
        message: 'URL é obrigatória'
      }, { status: 400 });
    }
    
    // Importar a biblioteca do TikTok
    const { Downloader } = await import('@tobyg74/tiktok-api-dl');
    
    // Testar com a URL fornecida
    const result = await Downloader(url, { version: 'v3' });
    
    return NextResponse.json({
      status: 'success',
      apiStatus: result.status,
      message: result.message || 'Teste concluído',
      hasResult: !!result.result,
      resultKeys: result.result ? Object.keys(result.result) : [],
      hasMusic: !!(result.result?.music),
      hasVideoHD: !!(result.result?.videoHD),
      hasVideoSD: !!(result.result?.videoSD),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
