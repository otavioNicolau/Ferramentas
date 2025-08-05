import { NextRequest, NextResponse } from 'next/server';
import ytdl from 'ytdl-core';
import { Readable } from 'stream';

export async function POST(request: NextRequest) {
  try {
    // Obter parâmetros da requisição
    const { url, itag, isAudio } = await request.json();
    
    if (!url || !itag) {
      return NextResponse.json(
        { message: 'URL e itag são obrigatórios' },
        { status: 400 }
      );
    }
    
    // Verificar se a URL é válida
    if (!ytdl.validateURL(url)) {
      return NextResponse.json(
        { message: 'URL do YouTube inválida' },
        { status: 400 }
      );
    }
    
    // Configurar opções de download
    const options: ytdl.downloadOptions = {
      quality: itag.toString(),
      filter: isAudio ? 'audioonly' : undefined,
    };
    
    // Obter informações do vídeo para o nome do arquivo
    const info = await ytdl.getInfo(url);
    const videoTitle = info.videoDetails.title.replace(/[^\w\s]/gi, '');
    
    // Iniciar o download
    const stream = ytdl(url, options);
    
    // Converter stream para buffer
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);
    
    // Configurar cabeçalhos da resposta
    const headers = new Headers();
    headers.set('Content-Type', isAudio ? 'audio/mpeg' : 'video/mp4');
    headers.set('Content-Disposition', `attachment; filename="${videoTitle}${isAudio ? '.mp3' : '.mp4'}"`);
    
    // Retornar o arquivo como resposta
    return new NextResponse(buffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Erro ao baixar vídeo:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}

// Configurar tamanho máximo do corpo da requisição
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
    responseLimit: '50mb',
  },
};