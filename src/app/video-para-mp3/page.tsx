'use client';

import { useState, useRef, useEffect } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Upload, Music, Download, AlertCircle, CheckCircle, Loader2, X, Settings, FileVideo } from 'lucide-react';
import { saveAs } from 'file-saver';
import { getTranslations } from '@/config/language';
import type { FFmpeg } from '@ffmpeg/ffmpeg';

export default function VideoParaMp3Page() {
  const t = getTranslations();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audioQuality, setAudioQuality] = useState('128');
  const [sampleRate, setSampleRate] = useState('44100');
  const [outputFile, setOutputFile] = useState<{ url: string; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [ffmpegLoading, setFfmpegLoading] = useState(false);
  const [, setLogMessages] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);

  // Carregar FFmpeg quando o componente montar
  useEffect(() => {
    const loadFFmpeg = async () => {
      try {
        setFfmpegLoading(true);
        addLog('Carregando FFmpeg...');
        
        // Importar FFmpeg dinamicamente
        const { FFmpeg } = await import('@ffmpeg/ffmpeg');
        await import('@ffmpeg/util');
        
        // Criar instância do FFmpeg
        const ffmpeg = new FFmpeg();
        ffmpegRef.current = ffmpeg;
        
        // Configurar log
        ffmpeg.on('log', ({ message }) => {
          addLog(message);
        });
        
        // Configurar progresso
        ffmpeg.on('progress', ({ progress }) => {
          setProgress(Math.round(progress * 100));
        });
        
        // Carregar FFmpeg
        await ffmpeg.load();
        
        addLog('FFmpeg carregado com sucesso!');
        setFfmpegLoaded(true);
      } catch (error) {
        console.error('Erro ao carregar FFmpeg:', error);
        setError('Não foi possível carregar o conversor. Tente recarregar a página.');
        addLog(`Erro ao carregar FFmpeg: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setFfmpegLoading(false);
      }
    };
    
    loadFFmpeg();
    
    // Limpar quando o componente desmontar
    return () => {
      if (ffmpegRef.current) {
        try {
          ffmpegRef.current.terminate();
        } catch (e) {
          console.error('Erro ao terminar FFmpeg:', e);
        }
      }
      
      // Limpar URLs de objeto
      if (outputFile) {
        URL.revokeObjectURL(outputFile.url);
      }
    };
  }, []);
  
  const addLog = (message: string) => {
    setLogMessages(prev => [...prev, message]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Verificar se é um formato de vídeo suportado
      const supportedFormats = ['video/mp4', 'video/webm', 'video/avi', 'video/mov', 'video/quicktime', 'video/x-matroska'];
      
      if (supportedFormats.includes(file.type) || file.name.match(/\.(mp4|webm|avi|mov|mkv|flv|wmv)$/i)) {
        setSelectedFile(file);
        setOutputFile(null);
        setError(null);
        addLog(`Arquivo selecionado: ${file.name} (${formatFileSize(file.size)})`);
      } else {
        setError('Formato de arquivo não suportado. Por favor, selecione um vídeo válido.');
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      // Verificar se é um formato de vídeo suportado
      const supportedFormats = ['video/mp4', 'video/webm', 'video/avi', 'video/mov', 'video/quicktime', 'video/x-matroska'];
      
      if (supportedFormats.includes(file.type) || file.name.match(/\.(mp4|webm|avi|mov|mkv|flv|wmv)$/i)) {
        setSelectedFile(file);
        setOutputFile(null);
        setError(null);
        addLog(`Arquivo arrastado: ${file.name} (${formatFileSize(file.size)})`);
      } else {
        setError('Formato de arquivo não suportado. Por favor, selecione um vídeo válido.');
      }
    }
  };

  const convertToMp3 = async () => {
    if (!selectedFile || !ffmpegLoaded || !ffmpegRef.current) return;
    
    try {
      setIsProcessing(true);
      setProgress(0);
      setError(null);
      setOutputFile(null);
      
      const ffmpeg = ffmpegRef.current;
      const { fetchFile } = await import('@ffmpeg/util');
      
      // Nome do arquivo de entrada e saída
      const inputFileName = 'input_video';
      const outputFileName = 'output_audio.mp3';
      
      addLog('Iniciando conversão...');
      
      // Escrever arquivo de entrada
      addLog('Carregando vídeo...');
      await ffmpeg.writeFile(inputFileName, await fetchFile(selectedFile));
      
      // Configurar comando FFmpeg
      const command = [
        '-i', inputFileName,
        '-vn',  // Remover vídeo
        '-ar', sampleRate, // Taxa de amostragem
        '-ab', `${audioQuality}k`, // Bitrate
        '-f', 'mp3', // Formato de saída
        outputFileName
      ];
      
      addLog(`Executando comando: ffmpeg ${command.join(' ')}`);
      
      // Executar comando
      await ffmpeg.exec(command);
      
      // Ler arquivo de saída
      addLog('Lendo arquivo convertido...');
      const data = await ffmpeg.readFile(outputFileName);
      
      // Criar URL para download
      const blob = new Blob([data], { type: 'audio/mp3' });
      const url = URL.createObjectURL(blob);
      
      // Definir nome do arquivo de saída
      const originalName = selectedFile.name;
      const outputName = originalName.replace(/\.[^\.]+$/, '.mp3');
      
      setOutputFile({ url, name: outputName });
      addLog('Conversão concluída com sucesso!');
    } catch (error) {
      console.error('Erro na conversão:', error);
      setError(`Erro na conversão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      addLog(`Erro na conversão: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadMp3 = () => {
    if (outputFile) {
      saveAs(outputFile.url, outputFile.name);
      addLog(`Download iniciado: ${outputFile.name}`);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const resetConverter = () => {
    if (outputFile) {
      URL.revokeObjectURL(outputFile.url);
    }
    setSelectedFile(null);
    setOutputFile(null);
    setProgress(0);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    addLog('Conversor reiniciado');
  };

  return (
    <ToolLayout
      title={t.videoToMp3Title}
      description={t.videoToMp3Description}
    >
      <div className="space-y-6">
        {/* Upload Area */}
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Selecione ou arraste um vídeo
          </h3>
          <p className="text-gray-600 mb-4">
            Formatos suportados: MP4, AVI, MOV, WEBM, MKV, FLV, WMV
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*,.mp4,.avi,.mov,.webm,.mkv,.flv,.wmv"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            Escolher Arquivo
          </button>
        </div>

        {/* Arquivo selecionado */}
        {selectedFile && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-4">
            <FileVideo className="text-blue-600 flex-shrink-0 mt-1" size={24} />
            <div className="flex-1">
              <h4 className="font-medium text-blue-900">{selectedFile.name}</h4>
              <p className="text-sm text-blue-700">{formatFileSize(selectedFile.size)}</p>
            </div>
            <button 
              onClick={resetConverter}
              className="text-red-500 hover:text-red-700 p-1"
              title="Remover arquivo"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Configurações */}
        {selectedFile && (
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings size={20} className="text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-800">Configurações de Conversão</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qualidade do Áudio
                </label>
                <select 
                  value={audioQuality}
                  onChange={(e) => setAudioQuality(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="128">128 kbps (Padrão)</option>
                  <option value="192">192 kbps (Alta)</option>
                  <option value="320">320 kbps (Máxima)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taxa de Amostragem
                </label>
                <select 
                  value={sampleRate}
                  onChange={(e) => setSampleRate(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="44100">44.1 kHz (Padrão)</option>
                  <option value="48000">48 kHz</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Mensagem de erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Progresso */}
        {isProcessing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-blue-900">
                Convertendo vídeo para MP3...
              </span>
              <span className="text-sm font-bold text-blue-900">
                {progress}%
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Botão de conversão */}
        {selectedFile && !isProcessing && !outputFile && (
          <div className="text-center">
            <button
              onClick={convertToMp3}
              disabled={!ffmpegLoaded || ffmpegLoading || isProcessing}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {ffmpegLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span className="font-medium">Carregando conversor...</span>
                </>
              ) : (
                <>
                  <Music size={20} />
                  <span className="font-medium">Converter para MP3</span>
                </>
              )}
            </button>
            {ffmpegLoading && (
              <p className="text-sm text-gray-600 mt-2">
                Carregando o conversor, isso pode levar alguns segundos...
              </p>
            )}
          </div>
        )}

        {/* Resultado */}
        {outputFile && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle size={20} className="text-green-600" />
              <h3 className="text-lg font-semibold text-green-800">Conversão Concluída</h3>
            </div>
            <div className="bg-white border border-green-200 rounded-lg p-4 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Music className="text-green-600" size={24} />
                <div>
                  <h4 className="font-medium text-gray-900">{outputFile.name}</h4>
                  <p className="text-sm text-gray-600">Áudio MP3 • {audioQuality} kbps</p>
                </div>
              </div>
              <button
                onClick={downloadMp3}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Download size={16} />
                Baixar MP3
              </button>
            </div>
            <div className="text-center">
              <button
                onClick={resetConverter}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Converter outro vídeo
              </button>
            </div>
          </div>
        )}

        {/* Estado vazio */}
        {!selectedFile && !isProcessing && !outputFile && (
          <div className="text-center py-8 text-gray-600">
            <Music className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="font-medium text-gray-700">Nenhum vídeo selecionado</p>
            <p className="text-sm mt-1 text-gray-500">Selecione um vídeo para extrair o áudio em formato MP3</p>
          </div>
        )}

        {/* Informações */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">💡 Como funciona:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Todo o processamento é feito localmente no seu navegador</li>
            <li>• Seus arquivos não são enviados para nenhum servidor</li>
            <li>• Suporta vários formatos de vídeo populares</li>
            <li>• Qualidade ajustável para diferentes necessidades</li>
            <li>• Processo rápido e seguro para extrair áudio de vídeos</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}
