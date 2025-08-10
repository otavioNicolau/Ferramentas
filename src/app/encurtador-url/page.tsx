'use client';

import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Link2, Copy, RotateCcw, ExternalLink, Clock } from 'lucide-react';
import { getTranslations } from '@/config/language';

interface ShortenedUrl {
  original: string;
  shortened: string;
  timestamp: Date;
  clicks: number;
}

export default function EncurtadorUrlPage() {
  const t = getTranslations();
  const [originalUrl, setOriginalUrl] = useState('');
  const [shortenedUrls, setShortenedUrls] = useState<ShortenedUrl[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateShortCode = (): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      // Se não tem protocolo, tenta adicionar https://
      try {
        new URL(`https://${url}`);
        return true;
      } catch {
        return false;
      }
    }
  };

  const normalizeUrl = (url: string): string => {
    try {
      new URL(url);
      return url;
    } catch {
      return `https://${url}`;
    }
  };

  const shortenUrl = async () => {
    if (!originalUrl.trim()) return;

    if (!validateUrl(originalUrl)) {
      alert('Por favor, insira uma URL válida (ex: google.com ou https://google.com)');
      return;
    }

    setLoading(true);

    // Simular delay de processamento
    setTimeout(() => {
      const normalizedUrl = normalizeUrl(originalUrl);
      const shortCode = generateShortCode();
      const shortened = `https://util.web/${shortCode}`;

      const newShortenedUrl: ShortenedUrl = {
        original: normalizedUrl,
        shortened: shortened,
        timestamp: new Date(),
        clicks: 0
      };

      setShortenedUrls(prev => [newShortenedUrl, ...prev]);
      setOriginalUrl('');
      setLoading(false);
    }, 1000);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const clearHistory = () => {
    setShortenedUrls([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      shortenUrl();
    }
  };

  return (
    <ToolLayout
      title={t.urlShortenerTitle}
      description={t.urlShortenerDescription}
    >
      <div className="space-y-6">
        {/* Input de URL */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Link2 size={20} className="text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-800">Encurtar URL</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL para encurtar
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={originalUrl}
                  onChange={(e) => setOriginalUrl(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite ou cole a URL aqui (ex: google.com, https://exemplo.com)"
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={shortenUrl}
                  disabled={loading || !originalUrl.trim()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Encurtando...
                    </>
                  ) : (
                    <>
                      <Link2 size={16} />
                      Encurtar
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Aceita URLs com ou sem protocolo (ex: google.com ou https://google.com)
              </p>
            </div>
          </div>
        </div>

        {/* URLs Encurtadas */}
        {shortenedUrls.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">URLs Encurtadas</h3>
              <button
                onClick={clearHistory}
                className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
              >
                <RotateCcw size={14} />
                Limpar Histórico
              </button>
            </div>

            <div className="space-y-4">
              {shortenedUrls.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="space-y-3">
                    {/* URL Original */}
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                        URL Original
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-gray-800 break-all flex-1 bg-gray-50 px-3 py-2 rounded text-sm">
                          {item.original}
                        </p>
                        <button
                          onClick={() => window.open(item.original, '_blank')}
                          className="text-blue-600 hover:text-blue-700 p-1"
                          title="Abrir URL original"
                        >
                          <ExternalLink size={16} />
                        </button>
                      </div>
                    </div>

                    {/* URL Encurtada */}
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                        URL Encurtada
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-blue-600 font-medium flex-1 bg-blue-50 px-3 py-2 rounded text-sm">
                          {item.shortened}
                        </p>
                        <button
                          onClick={() => copyToClipboard(item.shortened)}
                          className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                            copied === item.shortened
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-600 text-white hover:bg-gray-700'
                          }`}
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Estatísticas */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        Criado em {item.timestamp.toLocaleDateString()} às {item.timestamp.toLocaleTimeString()}
                      </div>
                      <div className="flex items-center gap-1">
                        📊 {item.clicks} cliques
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Estado vazio */}
        {shortenedUrls.length === 0 && (
          <div className="text-center py-12 text-gray-600">
            <Link2 className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="font-medium text-gray-700">Nenhuma URL encurtada ainda</p>
            <p className="text-sm mt-1 text-gray-500">Digite uma URL acima para começar</p>
          </div>
        )}

        {/* Informações */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Importante:</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Este é um encurtador simulado para demonstração</li>
            <li>• As URLs encurtadas são geradas localmente e não funcionam realmente</li>
            <li>• Para uso real, considere serviços como Bitly, TinyURL ou encurtadores profissionais</li>
            <li>• Os dados são armazenados apenas na sessão atual</li>
          </ul>
        </div>

        {/* Dicas */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">💡 Dicas de Uso:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• URLs podem ser inseridas com ou sem protocolo</li>
            <li>• Use Ctrl+V ou Cmd+V para colar URLs rapidamente</li>
            <li>• Pressione Enter para encurtar mais rapidamente</li>
            <li>• Clique no ícone de link externo para testar a URL original</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}
