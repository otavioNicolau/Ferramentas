import { NextRequest, NextResponse } from 'next/server';
import ytdl from '@distube/ytdl-core';
import { generateMockDataForUrl } from './mock';

export async function POST(request: NextRequest) {
  try {
    // Verificar se há conteúdo no corpo da requisição
    const contentLength = request.headers.get('content-length');
    if (!contentLength || contentLength === '0') {
      return NextResponse.json(
        { error: 'Corpo da requisição vazio' },
        { status: 400 }
      );
    }

    // Obter a URL do vídeo do corpo da requisição
    let requestBody;
    try {
      requestBody = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Formato JSON inválido' },
        { status: 400 }
      );
    }

    const { url } = requestBody;
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL do vídeo é obrigatória' },
        { status: 400 }
      );
    }

    // Limpar e normalizar a URL
    const cleanUrl = url.trim();
    
    // Verificar se a URL é válida do YouTube
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|m\.youtube\.com)\/.+/;
    if (!youtubeRegex.test(cleanUrl)) {
      return NextResponse.json(
        { error: 'URL inválida. Por favor, use uma URL válida do YouTube.' },
        { status: 400 }
      );
    }
    
    // Verificar se a URL é válida usando ytdl-core
    if (!ytdl.validateURL(cleanUrl)) {
      return NextResponse.json(
        { error: 'Não foi possível extrair o ID do vídeo. Verifique a URL' },
        { status: 400 }
      );
    }

    // Configurar opções do ytdl para evitar problemas
    const options = {
      requestOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      }
    };

    try {
      // Tentar obter informações do vídeo
      const info = await ytdl.getInfo(cleanUrl, options);
      
      // Verificar se o vídeo está disponível
      if (!info.videoDetails) {
        throw new Error('Video details not available');
      }

      // Processar formatos e adicionar informações de tamanho estimado
      const processedFormats = info.formats
        .filter(format => format.hasVideo || format.hasAudio)
        .map(format => {
          const contentLength = parseInt(format.contentLength || '0');
          const sizeInMB = contentLength > 0 ? (contentLength / (1024 * 1024)).toFixed(1) + ' MB' : 'Tamanho desconhecido';
          
          return {
            itag: format.itag,
            qualityLabel: format.qualityLabel || (format.hasVideo ? `${format.height}p` : 'Audio'),
            container: format.container || 'mp4',
            quality: format.quality,
            hasVideo: format.hasVideo,
            hasAudio: format.hasAudio,
            sizeInMB,
            contentLength: format.contentLength,
            type: format.mimeType
          };
        })
        .sort((a, b) => {
          // Ordenar por qualidade (vídeos primeiro, depois áudio)
          if (a.hasVideo && !b.hasVideo) return -1;
          if (!a.hasVideo && b.hasVideo) return 1;
          // Para vídeos, ordenar por qualidade
          if (a.hasVideo && b.hasVideo) {
            const aQuality = parseInt(a.qualityLabel?.replace('p', '') || '0');
            const bQuality = parseInt(b.qualityLabel?.replace('p', '') || '0');
            return bQuality - aQuality;
          }
          
          return 0;
        });
      
      // Extrair dados relevantes
      const videoDetails = {
        title: info.videoDetails.title,
        author: info.videoDetails.author.name,
        videoId: info.videoDetails.videoId,
        lengthSeconds: parseInt(info.videoDetails.lengthSeconds),
        thumbnailUrl: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1]?.url || 
                     info.videoDetails.thumbnails[0]?.url,
        formats: processedFormats
      };
      
      return NextResponse.json(videoDetails);
      
    } catch (ytdlError) {
      console.log('YTDL Error, using mock data:', ytdlError);
      
      // Se falhar, usar dados mock para demonstração
      const mockData = generateMockDataForUrl(cleanUrl);
      
      return NextResponse.json({
        ...mockData,
        _isMockData: true,
        _message: "⚠️ Dados de demonstração - A API do YouTube está temporariamente indisponível"
      });
    }
  } catch (error) {
    console.error('Erro ao obter informações do vídeo:', error);
    
    // Fornecer mensagens de erro mais específicas
    if (error instanceof Error) {
      if (error.message.includes('Video unavailable')) {
        return NextResponse.json(
          { error: 'Vídeo não disponível. Pode estar privado, excluído ou com restrições geográficas.' },
          { status: 404 }
        );
      }
      if (error.message.includes('age')) {
        return NextResponse.json(
          { error: 'Vídeo com restrição de idade. Não é possível acessar este conteúdo.' },
          { status: 403 }
        );
      }
      if (error.message.includes('private')) {
        return NextResponse.json(
          { error: 'Vídeo privado. Apenas o proprietário pode acessar este conteúdo.' },
          { status: 403 }
        );
      }
      if (error.message.includes('region')) {
        return NextResponse.json(
          { error: 'Vídeo com restrições geográficas na sua região.' },
          { status: 403 }
        );
      }
      if (error.message.includes('Could not extract functions') || error.message.includes('functions')) {
        return NextResponse.json(
          { error: 'Serviço temporariamente indisponível. O YouTube pode ter mudado suas APIs. Tente novamente em alguns minutos.' },
          { status: 503 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor. Tente novamente em alguns minutos.' },
      { status: 500 }
    );
  }
}