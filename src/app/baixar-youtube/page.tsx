'use client';

import { useState, useRef } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Search, Download, Video, Music, AlertCircle, Loader2, X, Info, ExternalLink, Youtube } from 'lucide-react';
import { saveAs } from 'file-saver';

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
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<{[key: number]: number}>({});
  const [isDownloading, setIsDownloading] = useState<{[key: number]: boolean}>({});
  const [downloadType, setDownloadType] = useState<'video' | 'audio'>('video');
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Função para validar URL do YouTube
  const isValidYoutubeUrl = (url: string) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return youtubeRegex.test(url);
  };

  // Função para extrair o ID do vídeo do YouTube
  const extractVideoId = (url: string) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/(u\/\w\/))|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

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

  // Função para analisar a URL do vídeo
  const analyzeVideo = async () => {
    if (!url) {
      setError('Por favor, insira uma URL do YouTube');
      return;
    }
    
    if (!isValidYoutubeUrl(url)) {
      setError('URL inválida. Por favor, insira uma URL válida do YouTube');
      return;
    }
    
    const videoId = extractVideoId(url);
    if (!videoId) {
      setError('Não foi possível extrair o ID do vídeo. Verifique a URL');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setVideoInfo(null);
    
    try {
      // Fazer requisição para a API do servidor para obter informações do vídeo
      const response = await fetch('/api/youtube/info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao obter informações do vídeo');
      }
      
      const data = await response.json();
      
      // Processar formatos e adicionar tamanho em MB
      const processedFormats = data.formats.map((format: VideoFormat) => {
        let sizeInMB = 'Desconhecido';
        if (format.contentLength) {
          const sizeInBytes = parseInt(format.contentLength);
          sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(1) + ' MB';
        }
        return { ...format, sizeInMB };
      });
      
      // Filtrar e ordenar formatos por qualidade
      const videoFormats = processedFormats
        .filter((format: VideoFormat) => format.hasVideo && format.qualityLabel)
        .sort((a: VideoFormat, b: VideoFormat) => {
          const getResolution = (label: string = '') => {
            const match = label.match(/(\d+)p/);
            return match ? parseInt(match[1]) : 0;
          };
          return getResolution(b.qualityLabel) - getResolution(a.qualityLabel);
        });
      
      // Obter formatos de áudio
      const audioFormats = processedFormats
        .filter((format: VideoFormat) => !format.hasVideo && format.hasAudio)
        .sort((a: VideoFormat, b: VideoFormat) => {
          const getBitrate = (quality: string = '') => {
            const match = quality.match(/(\d+)kbps/);
            return match ? parseInt(match[1]) : 0;
          };
          return getBitrate(b.quality) - getBitrate(a.quality);
        });
      
      setVideoInfo({
        ...data,
        formats: [...videoFormats, ...audioFormats],
        videoId
      });
    } catch (error) {
      console.error('Erro ao analisar vídeo:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido ao processar o vídeo');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para iniciar o download
  const startDownload = async (itag: number, isAudio: boolean = false) => {
    if (!videoInfo) return;
    
    try {
      setIsDownloading(prev => ({ ...prev, [itag]: true }));
      setDownloadProgress(prev => ({ ...prev, [itag]: 0 }));
      
      // Fazer requisição para a API do servidor para baixar o vídeo
      const response = await fetch('/api/youtube/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url, 
          itag,
          isAudio
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao baixar o vídeo');
      }
      
      // Obter o blob do vídeo/áudio
      const blob = await response.blob();
      
      // Gerar nome do arquivo
      const fileName = `${videoInfo.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}${isAudio ? '.mp3' : '.mp4'}`;
      
      // Salvar o arquivo
      saveAs(blob, fileName);
      
      setDownloadProgress(prev => ({ ...prev, [itag]: 100 }));
    } catch (error) {
      console.error('Erro ao baixar:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido ao baixar o vídeo');
    } finally {
      setIsDownloading(prev => ({ ...prev, [itag]: false }));
    }
  };

  // Função para limpar os resultados
  const clearResults = () => {
    setVideoInfo(null);
    setError(null);
    setUrl('');
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

  return (
    <ToolLayout
      title="Baixar Vídeos do YouTube"
      description="Faça o download de vídeos do YouTube em diferentes formatos e qualidades. Rápido, fácil e sem marcas d'água."
    >
      <div className="space-y-6">
        {/* Input de URL */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Cole o link do vídeo do YouTube aqui"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <button 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 md:w-auto w-full disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={analyzeVideo}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Search className="h-5 w-5" />
                Analisar
              </>
            )}
          </button>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Informações do vídeo */}
        {videoInfo && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
              {/* Thumbnail */}
              <div className="md:w-64 w-full flex-shrink-0">
                <div className="relative">
                  <img 
                    src={videoInfo.thumbnailUrl} 
                    alt={videoInfo.title}
                    className="w-full h-auto rounded-lg" 
                  />
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                    {formatDuration(videoInfo.lengthSeconds)}
                  </div>
                </div>
              </div>
              
              {/* Detalhes */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{videoInfo.title}</h3>
                <p className="text-gray-600 mb-3">{videoInfo.author}</p>
                
                <div className="flex gap-2 mb-4">
                  <a 
                    href={`https://www.youtube.com/watch?v=${videoInfo.videoId}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                  >
                    <ExternalLink size={14} />
                    Ver no YouTube
                  </a>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => setDownloadType('video')}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 ${downloadType === 'video' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    <Video size={16} />
                    Vídeo
                  </button>
                  <button 
                    onClick={() => setDownloadType('audio')}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 ${downloadType === 'audio' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    <Music size={16} />
                    Áudio
                  </button>
                </div>
              </div>
              
              {/* Botão para limpar */}
              <button 
                onClick={clearResults}
                className="text-gray-500 hover:text-gray-700 p-1 self-start"
                title="Limpar resultados"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Opções de download */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">
                {downloadType === 'video' ? 'Opções de Vídeo' : 'Opções de Áudio'}
              </h3>
              
              <div className="space-y-3">
                {downloadType === 'video' ? (
                  // Opções de vídeo
                  videoInfo.formats
                    .filter(format => format.hasVideo && format.qualityLabel)
                    .slice(0, 5) // Limitar a 5 opções
                    .map(format => (
                      <div key={format.itag} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <Video className="text-blue-600" />
                          <span>{format.qualityLabel} ({format.container.toUpperCase()})</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-gray-500 text-sm">{format.sizeInMB}</span>
                          <button 
                            className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => startDownload(format.itag)}
                            disabled={isDownloading[format.itag]}
                          >
                            {isDownloading[format.itag] ? (
                              <>
                                <Loader2 size={16} className="animate-spin" />
                                {downloadProgress[format.itag] > 0 ? `${downloadProgress[format.itag]}%` : 'Baixando...'}
                              </>
                            ) : (
                              <>
                                <Download size={16} />
                                Baixar
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))
                ) : (
                  // Opções de áudio
                  videoInfo.formats
                    .filter(format => !format.hasVideo && format.hasAudio)
                    .slice(0, 3) // Limitar a 3 opções
                    .map(format => (
                      <div key={format.itag} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <Music className="text-green-600" />
                          <span>MP3 Audio ({format.quality || 'Padrão'})</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-gray-500 text-sm">{format.sizeInMB}</span>
                          <button 
                            className="bg-green-600 text-white px-4 py-1.5 rounded hover:bg-green-700 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => startDownload(format.itag, true)}
                            disabled={isDownloading[format.itag]}
                          >
                            {isDownloading[format.itag] ? (
                              <>
                                <Loader2 size={16} className="animate-spin" />
                                {downloadProgress[format.itag] > 0 ? `${downloadProgress[format.itag]}%` : 'Baixando...'}
                              </>
                            ) : (
                              <>
                                <Download size={16} />
                                Baixar
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
          <div className="text-center py-8 text-gray-600">
            <Youtube className="mx-auto h-16 w-16 text-red-500 mb-4" />
            <p className="font-medium text-gray-700">Cole o link de um vídeo do YouTube</p>
            <p className="text-sm mt-1 text-gray-500">Analisaremos o vídeo e mostraremos as opções de download</p>
          </div>
        )}

        {/* Informações */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Informações importantes:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Esta ferramenta requer uma API no servidor para funcionar corretamente</li>
                <li>• O download de vídeos do YouTube deve respeitar os termos de serviço da plataforma</li>
                <li>• Use apenas para vídeos com permissão de download ou de domínio público</li>
                <li>• Não armazenamos nenhum conteúdo em nossos servidores</li>
                <li>• A qualidade disponível depende do que o YouTube oferece para cada vídeo</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
