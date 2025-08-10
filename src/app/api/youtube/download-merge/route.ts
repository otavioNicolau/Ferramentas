import { NextRequest, NextResponse } from 'next/server';
import ytdl from '@distube/ytdl-core';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { Readable } from 'stream';

export async function POST(request: NextRequest) {
  try {
    const { url, videoItag, audioItag } = await request.json();
    
    if (!url || !videoItag || !audioItag) {
      return NextResponse.json(
        { message: 'URL, videoItag e audioItag são obrigatórios' },
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
    const videoTitle = info.videoDetails.title.replace(/[^\w\s-]/gi, '').substring(0, 50);
    
    // Criar diretório temporário único
    const tempDir = path.join(os.tmpdir(), `youtube-merge-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });
    
    const videoPath = path.join(tempDir, 'video.mp4');
    const audioPath = path.join(tempDir, 'audio.m4a');
    const outputPath = path.join(tempDir, `${videoTitle}.mp4`);
    
    try {
      // Download do vídeo
      const videoStream = ytdl(url, {
        quality: videoItag.toString(),
        filter: format => format.hasVideo && !format.hasAudio
      });
      
      // Download do áudio
      const audioStream = ytdl(url, {
        quality: audioItag.toString(),
        filter: format => format.hasAudio && !format.hasVideo
      });
      
      // Salvar streams em arquivos temporários
      await Promise.all([
        saveStreamToFile(videoStream, videoPath),
        saveStreamToFile(audioStream, audioPath)
      ]);
      
      // Verificar se FFmpeg está disponível
      const ffmpegAvailable = await checkFFmpegAvailable();
      if (!ffmpegAvailable) {
        // Fallback: retornar apenas o vídeo de qualidade média com áudio
        const fallbackStream = ytdl(url, {
          filter: format => format.hasVideo && format.hasAudio && format.qualityLabel === '720p'
        });
        
        return new NextResponse(fallbackStream as ReadableStream, {
          headers: {
            'Content-Type': 'video/mp4',
            'Content-Disposition': `attachment; filename="${videoTitle}.mp4"`
          }
        });
      }
      
      // Usar FFmpeg para unir vídeo e áudio
      await mergeVideoAudio(videoPath, audioPath, outputPath);
      
      // Ler o arquivo final
      const mergedBuffer = await fs.readFile(outputPath);
      
      // Limpar arquivos temporários
      await cleanup(tempDir);
      
      return new NextResponse(mergedBuffer, {
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Disposition': `attachment; filename="${videoTitle}.mp4"`
        }
      });
      
    } catch (downloadError) {
      await cleanup(tempDir);
      throw downloadError;
    }
    
  } catch (error) {
    console.error('Erro ao fazer merge de vídeo:', error);
    
    return NextResponse.json(
      { 
        message: 'Merge de vídeo indisponível. FFmpeg não encontrado no servidor. Use downloads separados de vídeo e áudio.' 
      },
      { status: 503 }
    );
  }
}

// Função para salvar stream em arquivo
async function saveStreamToFile(stream: Readable, filepath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    
    stream.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });
    
    stream.on('end', async () => {
      try {
        const buffer = Buffer.concat(chunks);
        await fs.writeFile(filepath, buffer);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
    
    stream.on('error', reject);
  });
}

// Função para verificar se FFmpeg está disponível
async function checkFFmpegAvailable(): Promise<boolean> {
  return new Promise((resolve) => {
    const ffmpeg = spawn('ffmpeg', ['-version']);
    
    ffmpeg.on('close', (code) => {
      resolve(code === 0);
    });
    
    ffmpeg.on('error', () => {
      resolve(false);
    });
  });
}

// Função para unir vídeo e áudio com FFmpeg
async function mergeVideoAudio(videoPath: string, audioPath: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', [
      '-i', videoPath,
      '-i', audioPath,
      '-c:v', 'copy',
      '-c:a', 'aac',
      '-strict', 'experimental',
      '-y', // sobrescrever arquivo de saída
      outputPath
    ]);
    
    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`FFmpeg falhou com código ${code}`));
      }
    });
    
    ffmpeg.on('error', reject);
  });
}

// Função para limpar arquivos temporários
async function cleanup(dir: string): Promise<void> {
  try {
    await fs.rm(dir, { recursive: true, force: true });
  } catch (error) {
    console.warn('Falha ao limpar arquivos temporários:', error);
  }
}
