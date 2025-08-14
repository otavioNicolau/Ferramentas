'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Download, Video, Music, AlertCircle, Loader2, X, Info, ExternalLink, Youtube } from 'lucide-react';
import { saveAs } from 'file-saver';
import { getTranslations } from '@/config/language';
import useDownloadManager from '@/hooks/useDownloadManager';

// Hook para evitar problemas de hidratação com traduções
const useClientTranslations = () => {
  const [translations, setTranslations] = useState<Record<string, string> | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setTranslations(getTranslations());
  }, []);

  return { translations, isClient };
};

type VideoFormat = {
  itag: number;
  qualityLabel?: string;
  container: string;
  quality: string;
  hasVideo: boolean;
  hasAudio: boolean;
  contentLength?: string;
  sizeInMB?: string;
  type?: string;
};

type VideoInfo = {
  title: string;
  author: string;
  thumbnailUrl: string;
  lengthSeconds: number;
  formats: VideoFormat[];
  videoId: string;
};

export default function BaixarYoutubePage() {
  const { translations: t, isClient } = useClientTranslations();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [downloadType, setDownloadType] = useState<'video' | 'audio'>('video');
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const downloadManager = useDownloadManager();

  // Função para validar URL do YouTube
  // Função para formatar a duração do vídeo
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  };

  // Função para fazer requisição com timeout
  const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 10000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  };

  // Função para analisar a URL do vídeo
  const analyzeVideo = async () => {
    if (!url) {
      setError(safeT.youtubeDownloader?.urlRequired || 'Por favor, insira uma URL do YouTube');
      return;
    }
    
    // Validação básica da URL
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|m\.youtube\.com)\/.+/;
    if (!youtubeRegex.test(url.trim())) {
      setError(safeT.youtubeDownloader?.invalidUrl || 'Por favor, insira uma URL válida do YouTube');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setVideoInfo(null);
    
    try {
      // Fazer requisição para a API do servidor para obter informações do vídeo
      let response;
      let lastError;
      
      // Tentar até 2 vezes em caso de erro
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          console.log(`Tentativa ${attempt} de requisição para API`);
          response = await fetchWithTimeout('/api/youtube/info', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: url.trim() }),
          }, 15000); // 15 segundos de timeout
          break; // Se chegou aqui, a requisição foi bem-sucedida
        } catch (fetchError) {
          console.error(`Erro na tentativa ${attempt}:`, fetchError);
          lastError = fetchError;
          if (attempt === 2) {
            throw fetchError; // Se foi a última tentativa, propagar o erro
          }
          // Aguardar 1 segundo antes da próxima tentativa
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      if (!response) {
        throw lastError || new Error('Falha ao fazer requisição');
      }

      const contentType = response.headers.get('content-type');
      console.log('Response status:', response.status);
      console.log('Response content-type:', contentType);
      
      // Primeiro, vamos sempre tentar ler como texto para debug
      const responseText = await response.text();
      console.log('Response text (first 200 chars):', responseText.substring(0, 200));
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let data: any = null;

      // Tentar fazer parse do JSON
      try {
        data = JSON.parse(responseText);
        console.log('JSON parsed successfully');
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError);
        console.error('Response was:', responseText.substring(0, 500));
        
        // Se não conseguir fazer parse do JSON, é um erro do servidor
        throw new Error(
          safeT.youtubeDownloader?.invalidResponse ||
            'Resposta inválida do servidor. O servidor pode estar sobrecarregado.'
        );
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            safeT.youtubeDownloader?.videoInfoError ||
            'Erro ao obter informações do vídeo'
        );
      }

      // A API já retorna os formatos processados com sizeInMB
      setVideoInfo(data);

      // Verificar se é dados mock e definir modo demo
      if (data._isMockData) {
        setIsDemoMode(true);
        setError(
          `${data._message} - As funcionalidades de download também estarão indisponíveis.`
        );
      } else {
        setIsDemoMode(false);
      }

    } catch (error) {
      console.error('Erro ao analisar vídeo:', error);
      console.error('Tipo do erro:', typeof error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A');
      
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Erro desconhecido ao processar o vídeo';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para iniciar o download
  const startDownload = async (itag: number, isAudio: boolean = false) => {
    // Criar uma key única para este botão específico
    const buttonKey = `${itag}-${isAudio ? 'audio' : 'video'}`;
    if (!videoInfo) return;
    
    // Usar o download manager para controlar este download específico
    downloadManager.startDownload(buttonKey, async () => {
      // Se estiver em modo demo, simular download
      if (isDemoMode) {
        let currentProgress = 0;
        downloadManager.setInterval(buttonKey, () => {
          currentProgress += Math.random() * 15 + 5;
          
          if (currentProgress >= 100) {
            downloadManager.updateProgress(buttonKey, 100);
            
            // Finalizar após pequena pausa
            setTimeout(() => {
              downloadManager.finishDownload(buttonKey);
            }, 500);
          } else {
            downloadManager.updateProgress(buttonKey, Math.floor(currentProgress));
          }
        }, 400 + Math.random() * 200);
      } else {
        // Download real usando a API
        try {
          // Simular progresso realista durante o download
          let currentProgress = 0;
          const progressInterval = setInterval(() => {
            currentProgress += Math.random() * 8 + 2; // Incremento entre 2-10%
            if (currentProgress < 90) { // Não passar de 90% até o download terminar
              downloadManager.updateProgress(buttonKey, Math.floor(currentProgress));
            }
          }, 800 + Math.random() * 400); // Intervalo entre 800-1200ms
          
          downloadManager.updateProgress(buttonKey, 5);
          
          const response = await fetch('/api/youtube/download', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              url: videoInfo.videoId ? `https://www.youtube.com/watch?v=${videoInfo.videoId}` : url, 
              itag: itag,
              isAudio: isAudio
            }),
          });
          
          // Parar a simulação de progresso
          if (downloadManager.downloads[buttonKey]) {
            clearInterval(progressInterval);
          }
          
          downloadManager.updateProgress(buttonKey, 90);
          
          if (!response.ok) {
            const contentType = response.headers.get('content-type');
            let errorMessage = 'Erro ao baixar o arquivo';
            if (contentType && contentType.includes('application/json')) {
              const errorData = await response.json();
              errorMessage = errorData.message || errorData.error || errorMessage;
            } else {
              const text = await response.text();
              errorMessage = text || errorMessage;
            }
            throw new Error(errorMessage);
          }
          
          downloadManager.updateProgress(buttonKey, 95);
          
          const blob = await response.blob();
          downloadManager.updateProgress(buttonKey, 98);
          
          // Determinar nome do arquivo e extensão
          const fileExtension = isAudio ? '.mp3' : '.mp4';
          const fileName = `${videoInfo.title || 'video'}${fileExtension}`;
          
          // Fazer download do arquivo
          saveAs(blob, fileName);
          
          downloadManager.updateProgress(buttonKey, 100);
          
          // Finalizar após pequena pausa
          setTimeout(() => {
            downloadManager.finishDownload(buttonKey);
          }, 500);
          
        } catch (error) {
          console.error('Erro ao baixar:', error);
          downloadManager.finishDownload(buttonKey);
          setError(error instanceof Error ? error.message : 'Erro ao baixar o arquivo');
        }
      }
    });
  };

  // Função para limpar os resultados
  const clearResults = () => {
    // Limpar todos os intervalos ativos
    downloadManager.clearAllIntervals();
    
    setVideoInfo(null);
    setError(null);
    setUrl('');
    setIsDemoMode(false);
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
    }
  };

  // Função para lidar com a tecla Enter no input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      analyzeVideo();
    }
  };

  // Cleanup quando o componente for desmontado
  useEffect(() => {
    return () => {
      downloadManager.clearAllIntervals();
    };
  }, [downloadManager]);

  // Renderizar loading enquanto as traduções não estão carregadas
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-3xl shadow-lg mb-6 animate-pulse">
            <Youtube className="w-10 h-10 text-white" />
          </div>
          <div className="text-lg text-black/70">Carregando...</div>
        </div>
      </div>
    );
  }

  // Fallback para traduções não carregadas
  const safeT = t || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-3xl shadow-lg mb-6">
            <Youtube className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-black mb-4">
            📺 {safeT.youtubeDownloader?.title || 'Baixar Vídeos do YouTube'}
          </h1>
          <p className="text-lg text-black/70 max-w-2xl mx-auto">
            {safeT.youtubeDownloader?.description || 'Faça o download de vídeos do YouTube em diferentes formatos e qualidades. Rápido, fácil e sem marcas d\'água.'}
          </p>
        </div>

        <div className="space-y-8">
          {/* Input de URL */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="mb-4">
              <label className="block text-lg font-bold text-black mb-2">
                🎬 {safeT.youtubeDownloader?.urlLabel || 'URL do Vídeo do YouTube'}
              </label>
              <p className="text-sm text-black/70 mb-4">
                {safeT.youtubeDownloader?.urlDescription || 'Cole aqui o link do vídeo que você deseja baixar'}
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={safeT.youtubeDownloader?.urlPlaceholder || "https://www.youtube.com/watch?v=..."}
                    className="block w-full pl-12 pr-4 py-4 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 text-black placeholder-gray-500"
                  />
                </div>
                
                {/* Exemplos de URLs */}
                <div className="mt-3">
                  <details className="group">
                    <summary className="text-xs text-black/60 cursor-pointer hover:text-black/80 transition-colors">
                      💡 {safeT.youtubeDownloader?.examplesLabel || 'Ver exemplos de URLs suportadas'}
                    </summary>
                    <div className="mt-2 text-xs text-black/70 bg-gray-50 rounded-lg p-3 space-y-1">
                      <div>• https://www.youtube.com/watch?v=dQw4w9WgXcQ</div>
                      <div>• https://youtu.be/dQw4w9WgXcQ</div>
                      <div>• https://m.youtube.com/watch?v=dQw4w9WgXcQ</div>
                      <div>• https://www.youtube.com/embed/dQw4w9WgXcQ</div>
                    </div>
                  </details>
                </div>
              </div>
              <button 
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-4 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center justify-center gap-3 md:w-auto w-full disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
                onClick={analyzeVideo}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="font-semibold">{safeT.youtubeDownloader?.analyzing || 'Analisando...'}</span>
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    <span className="font-semibold">{safeT.youtubeDownloader?.analyzeButton || 'Analisar Vídeo'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Loading durante análise */}
          {isLoading && (
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    <Youtube className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -inset-2 border-4 border-red-200 rounded-full animate-ping"></div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-black mb-2">🔍 Analisando vídeo...</h3>
                  <p className="text-black/70">Aguarde enquanto extraímos as informações do YouTube</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-black/60">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Isso pode levar alguns segundos</span>
                </div>
              </div>
            </div>
          )}

          {/* Mensagem de erro */}
          {error && (
            <div className="bg-gradient-to-r from-red-50/90 to-orange-50/90 backdrop-blur-sm border border-red-200 rounded-2xl p-6 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                  <AlertCircle className="text-white w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-red-800 mb-2 text-lg">❌ {safeT.youtubeDownloader?.errorTitle || 'Erro ao analisar vídeo'}</h4>
                  <p className="text-red-700 mb-4">{error}</p>
                  
                  <div className="bg-white/70 rounded-xl p-4 border border-red-100">
                    <div className="font-semibold text-red-800 mb-2">💡 {safeT.youtubeDownloader?.solutionsTitle || 'Possíveis soluções:'}</div>
                    <ul className="text-sm text-red-700 space-y-1">
                      <li>• {safeT.youtubeDownloader?.solution1 || 'Verifique se a URL está correta e completa'}</li>
                      <li>• {safeT.youtubeDownloader?.solution2 || 'Certifique-se de que o vídeo é público e não privado'}</li>
                      <li>• {safeT.youtubeDownloader?.solution3 || 'Tente usar uma URL diferente (youtu.be ou youtube.com)'}</li>
                      <li>• {safeT.youtubeDownloader?.solution4 || 'O vídeo pode ter restrições geográficas ou de idade'}</li>
                      <li>• {safeT.youtubeDownloader?.solution5 || 'A API do YouTube pode estar temporariamente indisponível'}</li>
                    </ul>
                  </div>
                  
                  <button 
                    onClick={() => {
                      setError('');
                      setUrl('');
                      if (inputRef.current) {
                        inputRef.current.focus();
                      }
                    }}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    🔄 {safeT.youtubeDownloader?.tryAgain || 'Tentar Novamente'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Informações do vídeo */}
          {videoInfo && (
            <div className="space-y-6">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Thumbnail */}
                  <div className="lg:w-80 w-full flex-shrink-0">
                    <div className="relative group">
                      <img 
                        src={videoInfo.thumbnailUrl} 
                        alt={videoInfo.title}
                        className="w-full h-auto rounded-xl shadow-md group-hover:shadow-lg transition-all duration-200" 
                      />
                      <div className="absolute bottom-3 right-3 bg-black/80 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
                        ⏱️ {formatDuration(videoInfo.lengthSeconds)}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200"></div>
                    </div>
                  </div>
                  
                  {/* Detalhes */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 pr-4">
                        <h3 className="text-xl font-bold text-black mb-2 line-clamp-2">{videoInfo.title}</h3>
                        <p className="text-black/70 font-medium mb-4">👤 {videoInfo.author}</p>
                      </div>
                      <button 
                        onClick={clearResults}
                        className="flex-shrink-0 w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105"
                        title={safeT.youtubeDownloader?.clearResults || "Limpar resultados"}
                      >
                        <X size={18} />
                      </button>
                    </div>
                    
                    <div className="mb-6">
                      <a 
                        href={`https://www.youtube.com/watch?v=${videoInfo.videoId}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium transition-colors duration-200"
                      >
                        <ExternalLink size={16} />
                        🔗 {safeT.youtubeDownloader?.viewOnYoutube || 'Ver no YouTube'}
                      </a>
                    </div>
                    
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setDownloadType('video')}
                        className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                          downloadType === 'video' 
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105' 
                            : 'bg-gray-100 text-black hover:bg-gray-200'
                        }`}
                      >
                        <Video size={18} />
                        📹 {safeT.youtubeDownloader?.videoType || 'Vídeo'}
                      </button>
                      <button 
                        onClick={() => setDownloadType('audio')}
                        className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                          downloadType === 'audio' 
                            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105' 
                            : 'bg-gray-100 text-black hover:bg-gray-200'
                        }`}
                      >
                        <Music size={18} />
                        🎵 {safeT.youtubeDownloader?.audioType || 'Áudio'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Opções de download */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Download className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-black">
                    {downloadType === 'video' ? '🎬 Opções de Vídeo' : '🎵 Opções de Áudio'}
                  </h3>
                </div>
                
                <div className="space-y-4">
                  {downloadType === 'video' ? (
                    // Agrupar por resolução e mostrar apenas a melhor opção de cada resolução
                    (() => {
                      const videoFormats = videoInfo.formats.filter(format => format.hasVideo && format.qualityLabel);
                      
                      // Agrupar por qualityLabel (resolução)
                      const groupedByResolution = videoFormats.reduce((acc, format) => {
                        const resolution = format.qualityLabel!;
                        if (!acc[resolution]) {
                          acc[resolution] = [];
                        }
                        acc[resolution].push(format);
                        return acc;
                      }, {} as Record<string, VideoFormat[]>);
                      
                      // Para cada resolução, escolher o melhor formato (priorizar MP4 com áudio, depois MP4 sem áudio, depois outros)
                      const bestFormats = Object.entries(groupedByResolution).map(([resolution, formats]) => {
                        const sortedFormats = formats.sort((a, b) => {
                          // Priorizar formatos com áudio
                          if (a.hasAudio && !b.hasAudio) return -1;
                          if (!a.hasAudio && b.hasAudio) return 1;
                          
                          // Priorizar MP4
                          if (a.container === 'mp4' && b.container !== 'mp4') return -1;
                          if (a.container !== 'mp4' && b.container === 'mp4') return 1;
                          
                          // Priorizar por tamanho (maior = melhor qualidade)
                          const sizeA = parseFloat(a.sizeInMB?.replace(' MB', '') || '0');
                          const sizeB = parseFloat(b.sizeInMB?.replace(' MB', '') || '0');
                          return sizeB - sizeA;
                        });
                        
                        return { resolution, format: sortedFormats[0] };
                      });
                      
                      // Ordenar por resolução (maior para menor)
                      const sortedBestFormats = bestFormats.sort((a, b) => {
                        const getQualityValue = (quality: string) => {
                          const num = parseInt(quality.replace('p', ''));
                          return isNaN(num) ? 0 : num;
                        };
                        return getQualityValue(b.resolution) - getQualityValue(a.resolution);
                      });
                      
                      return sortedBestFormats.map(({ resolution, format }, index) => {
                        const needsMerge = !format.hasAudio;
                        // Selecionar melhor áudio disponível
                        const bestAudio = videoInfo.formats.filter(f => !f.hasVideo && f.hasAudio)
                          .sort((a, b) => parseInt(b.quality) - parseInt(a.quality))[0];
                        return (
                          <div key={`video-${format.itag}-${index}`} className="group bg-gradient-to-r from-white/50 to-white/30 backdrop-blur-sm border border-white/30 rounded-xl p-4 hover:shadow-lg transition-all duration-200 hover:border-blue-300">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-200">
                                  <Video className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <div className="font-semibold text-black text-lg">
                                    📹 {format.qualityLabel} ({format.container.toUpperCase()})
                                  </div>
                                  <div className="text-black/60 text-sm">
                                    📊 Tamanho: {format.sizeInMB || 'N/A'} • {format.hasAudio ? '🔊 Com áudio' : '🔇 Apenas vídeo'}
                                    {needsMerge && (
                                      <span className="ml-2 text-xs text-purple-700 font-semibold bg-purple-100 rounded px-2 py-0.5">Áudio será adicionado automaticamente</span>
                                    )}
                                  </div>
                                  <div className="text-black/50 text-xs mt-1">
                                    {format.type ? `Tipo: ${format.type} • ` : ''}Itag: {format.itag}
                                  </div>
                                </div>
                              </div>
                              <button 
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                                onClick={() => {
                                  if (needsMerge && bestAudio) {
                                    // Usar downloadManager para merge também
                                    const buttonKey = `${format.itag}-video`;
                                    downloadManager.startDownload(buttonKey, async () => {
                                      try {
                                        // Simular progresso realista durante o merge
                                        let currentProgress = 0;
                                        const progressInterval = setInterval(() => {
                                          currentProgress += Math.random() * 6 + 1; // Incremento entre 1-7%
                                          if (currentProgress < 85) { // Não passar de 85% até o merge terminar
                                            downloadManager.updateProgress(buttonKey, Math.floor(currentProgress));
                                          }
                                        }, 1000 + Math.random() * 500); // Intervalo entre 1000-1500ms
                                        
                                        downloadManager.updateProgress(buttonKey, 5);
                                        
                                        const res = await fetch('/api/youtube/merge', {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ 
                                            url: videoInfo.videoId ? `https://www.youtube.com/watch?v=${videoInfo.videoId}` : url, 
                                            videoItag: format.itag, 
                                            audioItag: bestAudio.itag 
                                          })
                                        });
                                        
                                        // Parar a simulação de progresso
                                        clearInterval(progressInterval);
                                        downloadManager.updateProgress(buttonKey, 90);
                                        
                                        if (!res.ok) {
                                          const errorData = await res.json();
                                          throw new Error(errorData.error || 'Erro ao baixar vídeo com merge');
                                        }
                                        
                                        downloadManager.updateProgress(buttonKey, 95);
                                        
                                        const blob = await res.blob();
                                        downloadManager.updateProgress(buttonKey, 98);
                                        
                                        saveAs(blob, `${videoInfo.title || 'video'}.mp4`);
                                        
                                        downloadManager.updateProgress(buttonKey, 100);
                                        setTimeout(() => {
                                          downloadManager.finishDownload(buttonKey);
                                        }, 500);
                                        
                                      } catch (error) {
                                        console.error('Erro ao baixar vídeo com merge:', error);
                                        downloadManager.finishDownload(buttonKey);
                                        setError(error instanceof Error ? error.message : 'Erro ao baixar vídeo com merge');
                                      }
                                    });
                                  } else {
                                    startDownload(format.itag);
                                  }
                                }}
                                disabled={downloadManager.downloads[`${format.itag}-video`]?.isDownloading}
                                title={`Baixar vídeo ${format.qualityLabel} ${format.container.toUpperCase()}`}
                              >
                                {downloadManager.downloads[`${format.itag}-video`]?.isDownloading ? (
                                <>
                                  <Loader2 size={18} className="animate-spin" />
                                  {downloadManager.downloads[`${format.itag}-video`]?.progress > 0 ? `${downloadManager.downloads[`${format.itag}-video`]?.progress}%` : (safeT.youtubeDownloader?.downloading || 'Baixando...')}
                                </>
                              ) : (
                                <>
                                  <Download size={18} />
                                  {isDemoMode ? (safeT.youtubeDownloader?.demo || 'Demo') : (safeT.youtubeDownloader?.download || 'Baixar')}
                                </>
                              )}
                              </button>
                            </div>
                          </div>
                        );
                      });
                    })()
                  ) : (
                    // Exibir todas as opções de áudio disponíveis, ordenando por qualidade e container
                    videoInfo.formats
                      .filter(format => !format.hasVideo && format.hasAudio)
                      .sort((a, b) => {
                        // Ordenar por qualidade e container
                        const diff = a.quality.localeCompare(b.quality);
                        if (diff !== 0) return diff;
                        return a.container.localeCompare(b.container);
                      })
                      .map((format, index) => (
                        <div key={`audio-${format.itag}-${index}`} className="group bg-gradient-to-r from-white/50 to-white/30 backdrop-blur-sm border border-white/30 rounded-xl p-4 hover:shadow-lg transition-all duration-200 hover:border-green-300">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-200">
                                <Music className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <div className="font-semibold text-black text-lg">
                                  🎵 {format.container.toUpperCase()} Audio ({format.quality || 'Padrão'})
                                </div>
                                <div className="text-black/60 text-sm">
                                  📊 Tamanho: {format.sizeInMB || 'N/A'}
                                </div>
                                <div className="text-black/50 text-xs mt-1">
                                  {format.type ? `Tipo: ${format.type} • ` : ''}Itag: {format.itag}
                                </div>
                              </div>
                            </div>
                            <button 
                              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                              onClick={() => startDownload(format.itag, true)}
                              disabled={downloadManager.downloads[`${format.itag}-audio`]?.isDownloading}
                              title={`Baixar áudio ${format.container.toUpperCase()} ${format.quality}`}
                            >
                              {downloadManager.downloads[`${format.itag}-audio`]?.isDownloading ? (
                                <>
                                  <Loader2 size={18} className="animate-spin" />
                                  {downloadManager.downloads[`${format.itag}-audio`]?.progress > 0 ? `${downloadManager.downloads[`${format.itag}-audio`]?.progress}%` : (safeT.youtubeDownloader?.downloading || 'Baixando...')}
                                </>
                              ) : (
                                <>
                                  <Download size={18} />
                                  {isDemoMode ? (safeT.youtubeDownloader?.demo || 'Demo') : (safeT.youtubeDownloader?.download || 'Baixar')}
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Estado vazio */}
          {!videoInfo && !isLoading && !error && (
            <div className="text-center py-16">
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-full mb-6 animate-pulse">
                  <Youtube className="w-12 h-12 text-red-500" />
                </div>
                <h3 className="text-2xl font-bold text-black mb-3">
                  🔗 {safeT.youtubeDownloader?.emptyStateTitle || 'Cole o link de um vídeo do YouTube'}
                </h3>
                <p className="text-lg text-black/70 max-w-md mx-auto mb-4">
                  {safeT.youtubeDownloader?.emptyStateDescription || 'Analisaremos o vídeo e mostraremos as opções de download em diferentes qualidades'}
                </p>
                <div className="text-sm text-black/50 italic">
                  {safeT.youtubeDownloader?.exampleUrl || 'Exemplo: https://www.youtube.com/watch?v=dQw4w9WgXcQ'}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                <div className="group bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/30 hover:shadow-lg transition-all duration-200 hover:scale-105">
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">🎬</div>
                  <div className="font-bold text-black mb-2">{safeT.youtubeDownloader?.feature1Title || 'Múltiplas Qualidades'}</div>
                  <div className="text-sm text-black/70">{safeT.youtubeDownloader?.feature1Desc || 'HD, Full HD, 4K e mais formatos disponíveis'}</div>
                </div>
                <div className="group bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/30 hover:shadow-lg transition-all duration-200 hover:scale-105">
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">🎵</div>
                  <div className="font-bold text-black mb-2">{safeT.youtubeDownloader?.feature2Title || 'Áudio MP3'}</div>
                  <div className="text-sm text-black/70">{safeT.youtubeDownloader?.feature2Desc || 'Extraia apenas o áudio em alta qualidade'}</div>
                </div>
                <div className="group bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/30 hover:shadow-lg transition-all duration-200 hover:scale-105">
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">⚡</div>
                  <div className="font-bold text-black mb-2">{safeT.youtubeDownloader?.feature3Title || 'Rápido e Seguro'}</div>
                  <div className="text-sm text-black/70">{safeT.youtubeDownloader?.feature3Desc || 'Download direto sem publicidade'}</div>
                </div>
              </div>

              {/* Como usar - versão compacta */}
              <div className="mt-12 max-w-2xl mx-auto">
                <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                  <h4 className="font-bold text-black mb-4 flex items-center justify-center gap-2">
                    📋 {safeT.youtubeDownloader?.howToUseTitle || 'Como usar:'}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold">1</div>
                      <span className="text-black/80">{safeT.youtubeDownloader?.step1 || 'Copie a URL do YouTube'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold">2</div>
                      <span className="text-black/80">{safeT.youtubeDownloader?.step2 || 'Cole aqui e clique em Analisar'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold">3</div>
                      <span className="text-black/80">{safeT.youtubeDownloader?.step3 || 'Escolha a qualidade desejada'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold">4</div>
                      <span className="text-black/80">{safeT.youtubeDownloader?.step4 || 'Baixe o arquivo automaticamente'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Informações */}
          <div className="bg-gradient-to-br from-blue-50/80 via-indigo-50/80 to-purple-50/80 backdrop-blur-sm border border-blue-200 rounded-2xl p-8 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <Info className="text-white w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-blue-900 mb-4 text-xl flex items-center gap-2">
                  💡 {safeT.youtubeDownloader?.importantInfoTitle || 'Informações importantes'}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/60 rounded-xl p-4 border border-white/30">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-orange-600 font-bold">🔧</span>
                      </div>
                      <span className="font-semibold text-blue-900">{safeT.youtubeDownloader?.apiStatusTitle || 'Status da API'}</span>
                    </div>
                    <p className="text-sm text-blue-800">{safeT.youtubeDownloader?.apiStatusDesc || 'Esta ferramenta requer uma API do YouTube configurada no servidor para funcionar corretamente'}</p>
                  </div>
                  
                  <div className="bg-white/60 rounded-xl p-4 border border-white/30">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-bold">�</span>
                      </div>
                      <span className="font-semibold text-blue-900">{safeT.youtubeDownloader?.privacyTitle || 'Privacidade'}</span>
                    </div>
                    <p className="text-sm text-blue-800">{safeT.youtubeDownloader?.privacyDesc || 'Não armazenamos nenhum conteúdo em nossos servidores. Tudo é processado em tempo real'}</p>
                  </div>
                  
                  <div className="bg-white/60 rounded-xl p-4 border border-white/30">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-red-600 font-bold">⚖️</span>
                      </div>
                      <span className="font-semibold text-blue-900">{safeT.youtubeDownloader?.legalUseTitle || 'Uso Legal'}</span>
                    </div>
                    <p className="text-sm text-blue-800">{safeT.youtubeDownloader?.legalUseDesc || 'Use apenas para vídeos com permissão de download ou de domínio público, respeitando os termos do YouTube'}</p>
                  </div>
                  
                  <div className="bg-white/60 rounded-xl p-4 border border-white/30">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-bold">🎯</span>
                      </div>
                      <span className="font-semibold text-blue-900">{safeT.youtubeDownloader?.qualityTitle || 'Qualidade'}</span>
                    </div>
                    <p className="text-sm text-blue-800">{safeT.youtubeDownloader?.qualityDesc || 'A qualidade disponível depende do que o YouTube oferece para cada vídeo específico'}</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-300 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <div className="font-bold text-yellow-900 mb-1">{safeT.youtubeDownloader?.legalWarningTitle || 'Aviso Legal'}</div>
                      <p className="text-sm text-yellow-800">
                        {safeT.youtubeDownloader?.legalWarningDesc || 'Este serviço é apenas para uso pessoal e educacional. Respeite sempre os direitos autorais e não utilize o conteúdo para fins comerciais.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
