'use client';

import ToolLayout from '@/components/ToolLayout';
import { Download, ExternalLink, AlertCircle, Check, Loader2, Play, Heart, MessageCircle, Share2, Eye, User, Music, Copy, Share } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { saveAs } from 'file-saver';
import { getTranslations } from '@/config/language';

interface VideoInfo {
  id: string;
  title: string;
  author: string;
  authorAvatar: string;
  thumbnailUrl: string;
  videoUrl: string;
  audioUrl?: string;
  duration?: number;
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
}

interface DownloadItem {
  id: string;
  title: string;
  author: string;
  type: 'video' | 'audio';
  timestamp: number;
  thumbnailUrl: string;
}

export default function BaixarTikTok() {
  const t = getTranslations();
  const [url, setUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadType, setDownloadType] = useState<'video' | 'audio'>('video');
  const [downloadHistory, setDownloadHistory] = useState<DownloadItem[]>([]);
  const [copiedUrl, setCopiedUrl] = useState('');
  const urlInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem('tiktok-download-history');
    if (savedHistory) {
      setDownloadHistory(JSON.parse(savedHistory));
    }
  }, []);

  const validateTikTokUrl = (url: string): boolean => {
    const tiktokPatterns = [
      /^https?:\/\/(www\.)?tiktok\.com\/@[\w.-]+\/video\/\d+/,
      /^https?:\/\/(vm|vt)\.tiktok\.com\/[\w]+/,
      /^https?:\/\/m\.tiktok\.com\/v\/\d+/,
      /^https?:\/\/(www\.)?tiktok\.com\/t\/[\w]+/
    ];
    
    return tiktokPatterns.some(pattern => pattern.test(url));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedUrl(text);
      setTimeout(() => setCopiedUrl(''), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const fetchVideoInfo = async () => {
    if (!url.trim()) {
      setError(t.tiktokDownloader?.enterUrl || 'Por favor, insira uma URL do TikTok');
      return;
    }

    if (!validateTikTokUrl(url.trim())) {
      setError(t.tiktokDownloader?.invalidUrl || 'Por favor, insira uma URL válida do TikTok');
      return;
    }

    setIsLoading(true);
    setError('');
    setVideoInfo(null);

    try {
      const response = await fetch('/api/tiktok/info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const text = await response.text();
      let data: unknown;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(t.tiktokDownloader?.invalidResponse || 'Resposta inválida do servidor');
      }

      if (!response.ok) {
        const errorData = data as { error?: string; message?: string };
        throw new Error(
          errorData.error ||
            errorData.message ||
            t.tiktokDownloader?.videoInfoError ||
            'Erro ao obter informações do vídeo'
        );
      }

      setVideoInfo(data as VideoInfo);
    } catch (error) {
      console.error('Erro:', error);
      setError(error instanceof Error ? error.message : t.tiktokDownloader?.unknownError || 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (seconds: number | undefined | null): string => {
    if (seconds === undefined || seconds === null || isNaN(seconds)) {
      return '0:00';
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatNumber = (num: number | undefined | null): string => {
    if (num === undefined || num === null || isNaN(num)) {
      return '0';
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const downloadMedia = async (type: 'video' | 'audio') => {
    if (!videoInfo) return;

    setIsDownloading(true);
    setDownloadProgress(0);
    setDownloadType(type);

    try {
      // Simular progresso - diferentes para vídeo e áudio
      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => {
          const maxProgress = type === 'audio' ? 80 : 90; // Deixar espaço para conversão
          if (prev >= maxProgress) {
            clearInterval(progressInterval);
            return maxProgress;
          }
          return prev + (type === 'audio' ? 8 : 10);
        });
      }, type === 'audio' ? 300 : 200); // Mais devagar para áudio
      
      const response = await fetch('/api/tiktok/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, type }),
      });

      // Simular progresso final
      for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `${t.tiktokDownloader?.downloadError || 'Erro ao baixar'} ${
          type === 'video'
            ? (t.tiktokDownloader?.video || 'vídeo')
            : (t.tiktokDownloader?.audio || 'áudio')
        }`;

        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          console.error('Erro na resposta:', errorText);
        }

        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      
      // Finalizar progresso durante o processamento do blob
      for (let i = 0; i < 3; i++) {
        setDownloadProgress(prev => Math.min(prev + 3, 97));
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      const contentDisposition = response.headers.get('content-disposition');
      let fileName = `tiktok_${type}_${Date.now()}.${type === 'video' ? 'mp4' : 'mp3'}`;
      
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (fileNameMatch) {
          fileName = fileNameMatch[1];
        }
      }

      setDownloadProgress(100);
      
      // Pequena pausa para mostrar 100%
      await new Promise(resolve => setTimeout(resolve, 500));
      
      saveAs(blob, fileName);

      // Adicionar ao histórico
      const downloadItem: DownloadItem = {
        id: videoInfo.id,
        title: videoInfo.title,
        author: videoInfo.author,
        type,
        timestamp: Date.now(),
        thumbnailUrl: videoInfo.thumbnailUrl
      };

      const newHistory = [downloadItem, ...downloadHistory.slice(0, 9)];
      setDownloadHistory(newHistory);
      localStorage.setItem('tiktok-download-history', JSON.stringify(newHistory));

    } catch (error) {
      console.error('Erro no download:', error);
      setError(error instanceof Error ? error.message : t.tiktokDownloader?.downloadFailed || 'Erro no download');
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const clearHistory = () => {
    setDownloadHistory([]);
    localStorage.removeItem('tiktok-download-history');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      fetchVideoInfo();
    }
  };

  return (
    <ToolLayout
      title={t.tiktokDownloader?.title || "Baixar Vídeos do TikTok"}
      description={t.tiktokDownloader?.description || "Baixe vídeos do TikTok em alta qualidade ou extraia apenas o áudio em MP3"}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Seção de Entrada */}
        <div className="bg-gray-100 border border-gray-300 rounded-xl shadow-lg p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="tiktok-url" className="block text-sm font-semibold text-gray-900 mb-3">
                🎵 {t.tiktokDownloader?.urlLabel || "URL do TikTok"}
              </label>
              <div className="flex gap-3">
                <input
                  ref={urlInputRef}
                  id="tiktok-url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t.tiktokDownloader?.urlPlaceholder || "Cole aqui a URL do vídeo do TikTok..."}
                  className="flex-1 px-4 py-3 border-2 border-gray-400 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition-all duration-200 placeholder-gray-500"
                  disabled={isLoading}
                />
                <button
                  onClick={fetchVideoInfo}
                  disabled={isLoading || !url.trim()}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t.tiktokDownloader?.analyzing || "Analisando..."}
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4" />
                      {t.tiktokDownloader?.analyze || "Analisar"}
                    </>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-100 border-l-4 border-red-500 rounded-lg text-red-900 shadow-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Informações do Vídeo */}
        {videoInfo && (
          <div className="bg-gray-100 border border-gray-300 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl">
            <div className="md:flex">
              {/* Thumbnail */}
              <div className="md:w-1/3">
                <div className="relative aspect-[9/16] bg-gradient-to-br from-gray-200 to-gray-300">
                  <img
                    src={videoInfo.thumbnailUrl}
                    alt={videoInfo.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center transition-opacity duration-300 hover:bg-opacity-30">
                    <div className="bg-white bg-opacity-90 rounded-full p-3 shadow-lg">
                      <Play className="w-8 h-8 text-gray-800" fill="currentColor" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black bg-opacity-80 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                    ⏱️ {formatDuration(videoInfo.duration)}
                  </div>
                </div>
              </div>

              {/* Informações */}
              <div className="md:w-2/3 p-6">
                <div className="space-y-5">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 line-clamp-2 leading-tight">
                      {videoInfo.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-3">
                      <img
                        src={videoInfo.authorAvatar}
                        alt={videoInfo.author}
                        className="w-8 h-8 rounded-full border-2 border-gray-400"
                      />
                      <span className="text-gray-700 font-medium">{videoInfo.author}</span>
                    </div>
                  </div>

                  {/* Estatísticas */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-800 bg-gray-200 p-3 rounded-lg">
                      <Eye className="w-4 h-4 text-blue-500" />
                      <span className="font-semibold">{formatNumber(videoInfo.views)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-800 bg-gray-200 p-3 rounded-lg">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span className="font-semibold">{formatNumber(videoInfo.likes)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-800 bg-gray-200 p-3 rounded-lg">
                      <MessageCircle className="w-4 h-4 text-green-500" />
                      <span className="font-semibold">{formatNumber(videoInfo.comments)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-800 bg-gray-200 p-3 rounded-lg">
                      <Share2 className="w-4 h-4 text-purple-500" />
                      <span className="font-semibold">{formatNumber(videoInfo.shares)}</span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-700 italic bg-yellow-100 p-2 rounded-lg border-l-2 border-yellow-400">
                    ℹ️ {t.tiktokDownloader?.statsDisclaimer || "As estatísticas são estimadas e podem não refletir os valores reais"}
                  </div>

                  {/* Botões de Download */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <button
                      onClick={() => downloadMedia('video')}
                      disabled={isDownloading}
                      className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                    >
                      {isDownloading && downloadType === 'video' ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <div className="text-left">
                            <div>{t.tiktokDownloader?.downloading || "Baixando..."}</div>
                            <div className="text-xs opacity-80">{downloadProgress}% {t.tiktokDownloader?.completed || "concluído"}</div>
                          </div>
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5" />
                          <div className="text-left">
                            <div>{t.tiktokDownloader?.downloadVideo || "Baixar Vídeo"}</div>
                            <div className="text-xs opacity-80">{t.tiktokDownloader?.mp4Format || "Formato MP4"}</div>
                          </div>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => downloadMedia('audio')}
                      disabled={isDownloading}
                      className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                    >
                      {isDownloading && downloadType === 'audio' ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <div className="text-left">
                            <div>{t.tiktokDownloader?.converting || "Convertendo..."}</div>
                            <div className="text-xs opacity-80">{downloadProgress}% {t.tiktokDownloader?.completed || "concluído"}</div>
                          </div>
                        </>
                      ) : (
                        <>
                          <Music className="w-5 h-5" />
                          <div className="text-left">
                            <div>{t.tiktokDownloader?.downloadAudio || "Baixar Áudio"}</div>
                            <div className="text-xs opacity-80">{t.tiktokDownloader?.mp3Format || "Formato MP3"}</div>
                          </div>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Barra de Progresso */}
                  {isDownloading && (
                    <div className="w-full bg-gray-300 rounded-full h-3 shadow-inner">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                        style={{ width: `${downloadProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Histórico de Downloads */}
        {downloadHistory.length > 0 && (
          <div className="bg-gray-100 border border-gray-300 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                📚 {t.tiktokDownloader?.downloadHistory || "Histórico de Downloads"}
              </h3>
              <button
                onClick={clearHistory}
                className="text-sm text-red-700 hover:text-red-900 font-medium hover:underline transition-colors"
              >
                🗑️ {t.tiktokDownloader?.clearHistory || "Limpar Histórico"}
              </button>
            </div>
            <div className="space-y-3">
              {downloadHistory.slice(0, 3).map((item, index) => (
                <div key={`${item.id}-${item.timestamp}-${index}`} className="flex items-center gap-4 p-4 bg-gray-200 border border-gray-400 rounded-xl hover:shadow-md transition-all duration-200">
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="w-16 h-16 object-cover rounded-lg border-2 border-gray-400"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-700 mt-1">
                      👤 @{item.author} • 📅 {new Date(item.timestamp).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      item.type === 'video' 
                        ? 'bg-red-200 text-red-900'
                        : 'bg-green-200 text-green-900'
                    }`}>
                      {item.type === 'video' ? `🎥 ${t.tiktokDownloader?.video || 'Vídeo'}` : `🎵 ${t.tiktokDownloader?.audio || 'Áudio'}`}
                    </span>
                  </div>
                </div>
              ))}
              {downloadHistory.length > 3 && (
                <p className="text-sm text-gray-700 text-center py-2 italic">
                  {t.tiktokDownloader?.moreDownloads || "... e mais"} {downloadHistory.length - 3} downloads
                </p>
              )}
            </div>
          </div>
        )}

        {/* Informações de Uso */}
        <div className="bg-gradient-to-br from-gray-200 to-gray-300 border border-gray-400 rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            📖 {t.tiktokDownloader?.howToUse || "Como usar:"}:
          </h3>
          <ol className="list-decimal list-inside space-y-3 text-gray-800">
            <li className="flex items-start gap-2">
              <span className="font-semibold">1.</span>
              <span>🔗 {t.tiktokDownloader?.step1 || "Copie a URL do vídeo do TikTok que deseja baixar"}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold">2.</span>
              <span>📋 {t.tiktokDownloader?.step2 || 'Cole a URL no campo acima e clique em "Analisar"'}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold">3.</span>
              <span>🎯 {t.tiktokDownloader?.step3 || "Escolha entre baixar o vídeo completo (MP4) ou apenas o áudio (MP3)"}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold">4.</span>
              <span>⬇️ {t.tiktokDownloader?.step4 || "O download será iniciado automaticamente"}</span>
            </li>
          </ol>
          <div className="mt-6 p-4 bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-300 rounded-xl">
            <p className="text-sm text-gray-900 flex items-start gap-2">
              <span className="text-lg">⚠️</span>
              <span>
                <strong>{t.tiktokDownloader?.importantNote || "Nota Importante:"}:</strong> {t.tiktokDownloader?.disclaimer || "Este serviço é apenas para uso pessoal e educacional. Respeite sempre os direitos autorais e os termos de uso do TikTok. Não utilize este conteúdo para fins comerciais."}
              </span>
            </p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
