import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';

export async function GET() {
  try {
    // Testar se FFmpeg está acessível
    const ffmpeg = spawn('ffmpeg', ['-version']);
    
    let output = '';
    ffmpeg.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    await new Promise<void>((resolve, reject) => {
      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`FFmpeg exit code: ${code}`));
        }
      });
      
      ffmpeg.on('error', reject);
    });
    
    return NextResponse.json({
      status: 'success',
      message: 'FFmpeg está funcionando',
      version: output.split('\n')[0],
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
