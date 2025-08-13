import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { writeFileSync, unlinkSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

interface VideoData {
  id?: string;
  videoHD?: string;
  videoSD?: string;
  music?: string;
  [key: string]: unknown;
}

// Função para converter vídeo para áudio usando FFmpeg
async function convertVideoToAudio(videoBuffer: Buffer): Promise<Buffer> {
  const tempDir = tmpdir();
  const inputPath = join(tempDir, `tiktok_input_${Date.now()}.mp4`);
  const outputPath = join(tempDir, `tiktok_output_${Date.now()}.mp3`);
  
  try {
    // Salvar o buffer de vídeo em arquivo temporário
    writeFileSync(inputPath, videoBuffer);
    
    // Converter usando FFmpeg
    await new Promise<void>((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', [
        '-i', inputPath,           // Input file
        '-vn',                     // Disable video
        '-acodec', 'libmp3lame',   // Use MP3 encoder
        '-ab', '192k',             // Audio bitrate
        '-ar', '44100',            // Sample rate
        '-y',                      // Overwrite output file
        outputPath
      ]);
      
      let errorOutput = '';
      
      ffmpeg.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          console.error('FFmpeg error:', errorOutput);
          reject(new Error(`FFmpeg failed with code ${code}`));
        }
      });
      
      ffmpeg.on('error', (error) => {
        console.error('FFmpeg spawn error:', error);
        reject(error);
      });
    });
    
    // Ler o arquivo de áudio convertido
    if (!existsSync(outputPath)) {
      throw new Error('Arquivo de áudio não foi criado');
    }
    
    const audioBuffer = readFileSync(outputPath);
    return audioBuffer;
    
  } finally {
    // Limpar arquivos temporários
    try {
      if (existsSync(inputPath)) unlinkSync(inputPath);
      if (existsSync(outputPath)) unlinkSync(outputPath);
    } catch (cleanupError) {
      console.warn('Erro ao limpar arquivos temporários:', cleanupError);
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Obter parâmetros da requisição
    const { url, type } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { message: 'URL do vídeo é obrigatória' },
        { status: 400 }
      );
    }
    
    if (!type || (type !== 'video' && type !== 'audio')) {
      return NextResponse.json(
        { message: 'Tipo de download inválido. Use "video" ou "audio"' },
        { status: 400 }
      );
    }
    
    // Verificar se a URL é válida
    if (!isValidTikTokUrl(url)) {
      return NextResponse.json(
        { message: 'URL do TikTok inválida' },
        { status: 400 }
      );
    }
    
    // Importar dinamicamente a biblioteca do TikTok
    const { Downloader } = await import('@tobyg74/tiktok-api-dl');
    
    // Buscar informações do vídeo primeiro
    const infoResult = await Downloader(url, { version: 'v3' });
    
    if (!infoResult || infoResult.status === 'error') {
      throw new Error(infoResult?.message || 'Erro ao obter informações do vídeo');
    }
    
    const videoData = infoResult.result;
    
    if (!videoData) {
      throw new Error('Dados do vídeo não encontrados');
    }
    
    // Determinar a URL de download baseada no tipo
    let downloadUrl = '';
    let fileName = '';
    let contentType = '';
    
    if (type === 'video') {
      downloadUrl = videoData.videoHD || videoData.videoSD || '';
      fileName = `tiktok-video-${videoData.id || Date.now()}.mp4`;
      contentType = 'video/mp4';
    } else {
      // Para áudio, sempre baixar o vídeo e converter
      downloadUrl = videoData.videoSD || videoData.videoHD || '';
      
      // Log para debug
      console.log('Debug áudio:', {
        hasMusic: !!videoData.music,
        musicValue: videoData.music,
        hasVideoHD: !!videoData.videoHD,
        hasVideoSD: !!videoData.videoSD,
        availableKeys: Object.keys(videoData),
        willConvert: true
      });
      
      console.log('Áudio será convertido do vídeo usando FFmpeg');
      
      fileName = `tiktok-audio-${videoData.id || Date.now()}.mp3`;
      contentType = 'audio/mpeg';
    }
    
    if (!downloadUrl) {
      console.log('Erro: Nenhuma URL de download encontrada para tipo:', type);
      throw new Error(`URL de download para ${type === 'video' ? 'vídeo' : 'áudio'} não encontrada`);
    }
    
    console.log(`Iniciando download de ${type}:`, downloadUrl.substring(0, 50) + '...');
    
    // Fazer o download do arquivo com timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('Download cancelado por timeout');
      controller.abort();
    }, type === 'audio' ? 60000 : 30000); // 60 segundos para áudio (conversão), 30 para vídeo
    
    try {
      const response = await fetch(downloadUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        }
      });
      
      clearTimeout(timeoutId);
      
      console.log(`Download response status: ${response.status}`);
      console.log(`Content-Type: ${response.headers.get('content-type')}`);
      console.log(`Content-Length: ${response.headers.get('content-length')}`);
      
      if (!response.ok) {
        throw new Error(`Erro ao baixar arquivo: ${response.status} ${response.statusText}`);
      }
      
      // Verificar tamanho do arquivo
      const contentLength = response.headers.get('content-length');
      const fileSizeMB = contentLength ? parseInt(contentLength) / (1024 * 1024) : 0;
      
      // Limite aumentado para 100MB, com mensagem mais informativa
      if (contentLength && parseInt(contentLength) > 100 * 1024 * 1024) { // 100MB
        throw new Error(`Arquivo muito grande para download (${fileSizeMB.toFixed(1)}MB). Limite máximo: 100MB. Tente um vídeo menor.`);
      }
      
      // Log do tamanho do arquivo para debug
      if (fileSizeMB > 0) {
        console.log(`Tamanho do arquivo: ${fileSizeMB.toFixed(1)}MB`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      let finalBuffer = Buffer.from(arrayBuffer);
      
      console.log(`Download concluído. Tamanho do arquivo original: ${finalBuffer.length} bytes`);
      
      // Se for áudio, converter o vídeo para MP3
      if (type === 'audio') {
        console.log('Iniciando conversão para MP3...');
        try {
          const convertedBuffer = await convertVideoToAudio(finalBuffer);
          finalBuffer = Buffer.from(convertedBuffer);
          console.log(`Conversão concluída. Tamanho do arquivo MP3: ${finalBuffer.length} bytes`);
        } catch (conversionError) {
          console.error('Erro na conversão:', conversionError);
          throw new Error('Erro ao converter vídeo para áudio. Tente novamente.');
        }
      }
      
      // Configurar cabeçalhos da resposta
      const headers = new Headers();
      headers.set('Content-Type', contentType);
      headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
      headers.set('Content-Length', finalBuffer.length.toString());
      headers.set('Cache-Control', 'no-cache');
      
      // Retornar o arquivo como resposta
      return new NextResponse(finalBuffer, {
        status: 200,
        headers,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        throw new Error('Download cancelado por timeout');
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('Erro ao baixar vídeo do TikTok:', error);
    
    // Retornar um erro mais específico baseado no tipo de erro
    if (error instanceof Error) {
      if (error.message.includes('Network')) {
        return NextResponse.json(
          { message: 'Erro de rede. Verifique sua conexão ou tente novamente mais tarde.' },
          { status: 503 }
        );
      }
      if (error.message.includes('find download link')) {
        return NextResponse.json(
          { message: 'Vídeo não encontrado ou não está disponível para download.' },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Função para validar URL do TikTok
function isValidTikTokUrl(url: string): boolean {
  const tiktokRegex = /^(https?:\/\/)?(www\.|vm\.|m\.)?tiktok\.com\/.+/i;
  return tiktokRegex.test(url);
}

// Configurar tamanho máximo do corpo da requisição
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
    responseLimit: '100mb',
  },
};