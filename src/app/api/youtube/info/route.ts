import { NextRequest, NextResponse } from 'next/server';
import ytdl from 'ytdl-core';

export async function POST(request: NextRequest) {
  try {
    // Obter a URL do vídeo do corpo da requisição
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { message: 'URL do vídeo é obrigatória' },
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
    
    // Obter informações do vídeo
    const info = await ytdl.getInfo(url);
    
    // Extrair dados relevantes
    const videoDetails = {
      title: info.videoDetails.title,
      author: info.videoDetails.author.name,
      lengthSeconds: parseInt(info.videoDetails.lengthSeconds),
      thumbnailUrl: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url,
      formats: info.formats.map(format => ({
        itag: format.itag,
        qualityLabel: format.qualityLabel,
        container: format.container,
        quality: format.quality,
        hasVideo: format.hasVideo,
        hasAudio: format.hasAudio,
        contentLength: format.contentLength,
        type: format.mimeType
      }))
    };
    
    return NextResponse.json(videoDetails);
  } catch (error) {
    console.error('Erro ao obter informações do vídeo:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}