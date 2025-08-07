import { NextRequest, NextResponse } from 'next/server';
import ytdl from '@distube/ytdl-core';
import ffmpegPath from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

// Verificar se o FFmpeg está disponível
function getFFmpegPath() {
  console.log('FFmpeg path from import:', ffmpegPath);
  
  if (ffmpegPath && fs.existsSync(ffmpegPath)) {
    console.log('Using FFmpeg from import:', ffmpegPath);
    return ffmpegPath;
  }
  
  // Tentar caminhos alternativos
  const possiblePaths = [
    path.join(process.cwd(), 'node_modules', 'ffmpeg-static', 'ffmpeg.exe'),
    path.join(__dirname, '..', '..', '..', '..', 'node_modules', 'ffmpeg-static', 'ffmpeg.exe'),
    'ffmpeg',
    'ffmpeg.exe',
  ];
  
  console.log('Trying alternative paths:', possiblePaths);
  
  for (const testPath of possiblePaths) {
    try {
      console.log('Testing path:', testPath);
      if (fs.existsSync(testPath)) {
        console.log('Found FFmpeg at:', testPath);
        return testPath;
      }
    } catch (e) {
      console.log('Error testing path:', testPath, e);
    }
  }
  
  console.log('FFmpeg not found in any path');
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { url, videoItag, audioItag } = await req.json();
    
    // Validar parâmetros
    if (!url || !videoItag || !audioItag) {
      return NextResponse.json(
        { error: 'URL, videoItag e audioItag são obrigatórios' },
        { status: 400 }
      );
    }
    
    // Verificar se a URL é válida
    if (!ytdl.validateURL(url)) {
      return NextResponse.json(
        { error: 'URL do YouTube inválida' },
        { status: 400 }
      );
    }
    
    const tempDir = path.join(os.tmpdir(), `yt-merge-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });

    const videoPath = path.join(tempDir, 'video.mp4');
    const audioPath = path.join(tempDir, 'audio.m4a');
    const outputPath = path.join(tempDir, 'output.mp4');

    try {
      // Configurar opções do ytdl
      const options = {
        requestOptions: {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        }
      };
      
      // Obter informações do vídeo para o nome do arquivo
      const info = await ytdl.getInfo(url, options);
      const videoTitle = info.videoDetails.title.replace(/[^\w\s]/gi, '');
      
      // Baixar vídeo e áudio
      console.log('Starting downloads...');
      console.log('Video itag:', videoItag, 'Audio itag:', audioItag);
      
      await Promise.all([
        new Promise<void>((res, rej) => {
          console.log('Starting video download...');
          ytdl(url, { quality: videoItag, ...options })
            .pipe(fs.createWriteStream(videoPath))
            .on('finish', () => {
              console.log('Video download finished');
              res();
            })
            .on('error', (err) => {
              console.log('Video download error:', err);
              rej(err);
            });
        }),
        new Promise<void>((res, rej) => {
          console.log('Starting audio download...');
          ytdl(url, { quality: audioItag, ...options })
            .pipe(fs.createWriteStream(audioPath))
            .on('finish', () => {
              console.log('Audio download finished');
              res();
            })
            .on('error', (err) => {
              console.log('Audio download error:', err);
              rej(err);
            });
        }),
      ]);
      
      // Verificar se os arquivos foram criados
      const videoExists = await fs.pathExists(videoPath);
      const audioExists = await fs.pathExists(audioPath);
      console.log('Video file exists:', videoExists);
      console.log('Audio file exists:', audioExists);
      
      if (!videoExists || !audioExists) {
        throw new Error('Falha ao baixar arquivos de vídeo ou áudio');
      }
      
      const videoStats = await fs.stat(videoPath);
      const audioStats = await fs.stat(audioPath);
      console.log('Video file size:', videoStats.size, 'bytes');
      console.log('Audio file size:', audioStats.size, 'bytes');
      
      if (videoStats.size === 0 || audioStats.size === 0) {
        throw new Error('Arquivos de vídeo ou áudio estão vazios');
      }

      // Verificar se o FFmpeg está disponível
      const availableFFmpegPath = getFFmpegPath();
      if (!availableFFmpegPath) {
        throw new Error('FFmpeg não encontrado. Verifique se o ffmpeg-static está instalado corretamente.');
      }

      // Merge com ffmpeg
      await new Promise((res, rej) => {
        const command = ffmpeg()
          .setFfmpegPath(availableFFmpegPath)
          .input(videoPath)
          .input(audioPath)
          .outputOptions(['-c:v', 'libx264', '-c:a', 'aac'])
          .save(outputPath)
          .on('start', (commandLine) => {
            console.log('FFmpeg command:', commandLine);
          })
          .on('progress', (progress) => {
            console.log('FFmpeg progress:', progress.percent + '% done');
          })
          .on('stderr', (stderrLine) => {
            console.log('FFmpeg stderr:', stderrLine);
          })
          .on('end', () => {
            console.log('FFmpeg finished successfully');
            res(undefined);
          })
          .on('error', (err, stdout, stderr) => {
            console.log('FFmpeg error:', err.message);
            console.log('FFmpeg stdout:', stdout);
            console.log('FFmpeg stderr:', stderr);
            rej(err);
          });
      });

      const mergedBuffer = await fs.readFile(outputPath);
      await fs.remove(tempDir);

      return new NextResponse(mergedBuffer, {
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Disposition': `attachment; filename="${videoTitle}.mp4"`,
        },
      });
    } catch (ytdlError) {
      await fs.remove(tempDir);
      console.log('YTDL Merge Error:', ytdlError);
      
      return NextResponse.json(
        { 
          error: 'Download temporariamente indisponível. A API do YouTube está com problemas técnicos.' 
        },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Erro ao processar merge:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
