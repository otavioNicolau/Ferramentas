import { NextRequest, NextResponse } from 'next/server';
import ytdl from '@distube/ytdl-core';
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

    try {
      // Configurar opções de download
      const options: ytdl.downloadOptions = {
        quality: itag.toString(),
        filter: isAudio ? 'audioonly' : undefined,
        requestOptions: {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        }
      };
      
      // Obter informações do vídeo para o nome do arquivo
      const info = await ytdl.getInfo(url, options);
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
      
    } catch (ytdlError) {
      console.log('YTDL Download Error:', ytdlError);
      
      // Como fallback, retornar uma mensagem explicativa para o usuário
      return NextResponse.json(
        { 
          message: 'Download temporariamente indisponível. A API do YouTube está com problemas técnicos. Esta é uma funcionalidade de demonstração que requer configuração adicional no servidor.' 
        },
        { status: 503 }
      );
    }
    
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