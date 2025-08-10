'use client';

import { useState, useEffect } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Wifi, Play, RotateCcw, Gauge, WifiOff } from 'lucide-react';
import { getTranslations } from '@/config/language';

interface SpeedTestResult {
  download: number;
  upload: number;
  ping: number;
  timestamp: Date;
  quality: 'poor' | 'fair' | 'good' | 'excellent';
}

interface ConnectionInfo {
  type: string;
  effectiveType: string;
  downlink: number;
  rtt: number;
}

export default function TesteVelocidadePage() {
  const t = getTranslations();
  const [isTestingDownload, setIsTestingDownload] = useState(false);
  const [isTestingUpload, setIsTestingUpload] = useState(false);
  const [isTestingPing, setIsTestingPing] = useState(false);
  const [result, setResult] = useState<SpeedTestResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo | null>(null);
  const [currentTest, setCurrentTest] = useState<'idle' | 'ping' | 'download' | 'upload'>('idle');
  const [testHistory, setTestHistory] = useState<SpeedTestResult[]>([]);

  useEffect(() => {
    // Carregar histórico do localStorage
    const savedHistory = localStorage.getItem('utilidadeweb-speedtest-history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory).map((test: any) => ({
          ...test,
          timestamp: new Date(test.timestamp)
        }));
        setTestHistory(parsed);
      } catch (e) {
        console.error('Erro ao carregar histórico:', e);
      }
    }

    // Detectar informações de conexão se disponível
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setConnectionInfo({
        type: connection.type || 'unknown',
        effectiveType: connection.effectiveType || 'unknown',
        downlink: connection.downlink || 0,
        rtt: connection.rtt || 0
      });
    }
  }, []);

  const simulateTest = async (
    testType: 'ping' | 'download' | 'upload',
    duration: number
  ): Promise<number> => {
    return new Promise((resolve) => {
      const startTime = Date.now();
      let lastProgress = 0;

      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min((elapsed / duration) * 100, 100);
        
        if (newProgress > lastProgress) {
          setProgress(newProgress);
          lastProgress = newProgress;
        }

        if (elapsed >= duration) {
          clearInterval(interval);
          
          // Simular resultados mais realistas baseados no tipo de conexão
          let result: number;
          const connectionMultiplier = connectionInfo?.downlink || 1;
          
          switch (testType) {
            case 'ping':
              // Ping: 5-150ms dependendo da conexão
              const basePing = connectionInfo?.rtt || 50;
              result = Math.max(5, basePing + (Math.random() * 30 - 15));
              break;
            case 'download':
              // Download: 1-200 Mbps baseado na conexão
              const baseDownload = Math.min(connectionMultiplier * 8, 100);
              result = Math.max(1, baseDownload + (Math.random() * 40 - 20));
              break;
            case 'upload':
              // Upload: geralmente 20-50% do download
              const estimatedDownload = Math.min(connectionMultiplier * 8, 100);
              const uploadRatio = 0.2 + Math.random() * 0.3; // 20-50%
              result = Math.max(0.5, estimatedDownload * uploadRatio);
              break;
          }
          
          resolve(result);
        }
      }, 50); // Atualização mais suave (50ms)
    });
  };

  const determineQuality = (download: number, upload: number, ping: number): 'poor' | 'fair' | 'good' | 'excellent' => {
    if (download < 10 || upload < 1 || ping > 100) return 'poor';
    if (download < 25 || upload < 3 || ping > 50) return 'fair';
    if (download < 50 || upload < 10 || ping > 20) return 'good';
    return 'excellent';
  };

  const startSpeedTest = async () => {
    setResult(null);
    setProgress(0);

    try {
      // Teste de Ping
      setCurrentTest('ping');
      setIsTestingPing(true);
      const ping = await simulateTest('ping', 2000);
      setIsTestingPing(false);

      // Teste de Download
      setCurrentTest('download');
      setIsTestingDownload(true);
      setProgress(0);
      const download = await simulateTest('download', 5000);
      setIsTestingDownload(false);

      // Teste de Upload
      setCurrentTest('upload');
      setIsTestingUpload(true);
      setProgress(0);
      const upload = await simulateTest('upload', 4000);
      setIsTestingUpload(false);

      // Determinar qualidade da conexão
      const quality = determineQuality(download, upload, ping);

      const testResult: SpeedTestResult = {
        download: Math.round(download * 100) / 100,
        upload: Math.round(upload * 100) / 100,
        ping: Math.round(ping * 100) / 100,
        timestamp: new Date(),
        quality
      };

      setResult(testResult);
      
      // Adicionar ao histórico
      const newHistory = [testResult, ...testHistory.slice(0, 9)]; // Manter apenas 10 testes
      setTestHistory(newHistory);
      localStorage.setItem('utilidadeweb-speedtest-history', JSON.stringify(newHistory));
      
      setCurrentTest('idle');
      setProgress(0);

    } catch (error) {
      console.error('Erro no teste de velocidade:', error);
      setIsTestingPing(false);
      setIsTestingDownload(false);
      setIsTestingUpload(false);
      setCurrentTest('idle');
    }
  };

  const resetTest = () => {
    setResult(null);
    setProgress(0);
    setCurrentTest('idle');
  };

  const isTestingAny = isTestingPing || isTestingDownload || isTestingUpload;

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'poor': return 'text-red-600 bg-red-50 border-red-200';
      case 'fair': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getQualityText = (quality: string) => {
    switch (quality) {
      case 'poor': return 'Ruim';
      case 'fair': return 'Regular';
      case 'good': return 'Boa';
      case 'excellent': return 'Excelente';
      default: return 'Desconhecida';
    }
  };

  return (
    <ToolLayout
      title={t.speedTestTitle}
      description={t.speedTestDescription}
    >
      <div className="space-y-6">
        {/* Painel Principal */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-center">
            <div className="mb-6">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full shadow-lg mb-4 transition-all duration-500 ${
                isTestingAny 
                  ? 'bg-gradient-to-br from-green-500 to-blue-600 animate-pulse' 
                  : 'bg-gradient-to-br from-blue-500 to-blue-600'
              }`}>
                <Wifi className={`w-10 h-10 text-white ${isTestingAny ? 'animate-bounce' : ''}`} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Teste de Velocidade</h3>
              <p className="text-gray-600">
                {isTestingAny 
                  ? 'Medindo sua conexão...' 
                  : 'Clique em "Iniciar Teste" para medir sua conexão'
                }
              </p>
            </div>

            {!isTestingAny && !result && (
              <button
                onClick={startSpeedTest}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-12 py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center gap-3 mx-auto text-lg font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Play size={24} />
                Iniciar Teste
              </button>
            )}

            {isTestingAny && (
              <div className="space-y-6">
                {/* Medidor Circular */}
                <div className="relative w-48 h-48 mx-auto">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Fundo do círculo */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                    />
                    {/* Progresso */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress / 100)}`}
                      className="transition-all duration-300 ease-out"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                  </svg>
                  {/* Texto central */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-3xl font-bold text-gray-800">
                      {Math.round(progress)}%
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {currentTest === 'ping' && '📡 Ping'}
                      {currentTest === 'download' && '⬇️ Download'}
                      {currentTest === 'upload' && '⬆️ Upload'}
                    </div>
                  </div>
                </div>
                
                <div className="text-xl font-semibold text-gray-800">
                  {currentTest === 'ping' && 'Testando Latência...'}
                  {currentTest === 'download' && 'Testando Velocidade de Download...'}
                  {currentTest === 'upload' && 'Testando Velocidade de Upload...'}
                </div>
                
                <div className="text-sm text-gray-600">
                  Aguarde enquanto medimos sua conexão
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Resultados */}
        {result && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">🎉 Teste Concluído!</h3>
              <div className={`inline-block px-6 py-3 rounded-full border-2 font-bold text-lg ${getQualityColor(result.quality)}`}>
                {getQualityText(result.quality)} Conexão
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Download */}
              <div className="text-center">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border-2 border-green-200">
                  <div className="text-4xl mb-2">⬇️</div>
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {result.download}
                  </div>
                  <div className="text-green-800 font-semibold text-lg">Mbps</div>
                  <div className="text-sm text-green-700 mt-2 font-medium">Velocidade de Download</div>
                  
                  {/* Barra de velocidade */}
                  <div className="mt-4 bg-green-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${Math.min((result.download / 100) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Upload */}
              <div className="text-center">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-200">
                  <div className="text-4xl mb-2">⬆️</div>
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {result.upload}
                  </div>
                  <div className="text-blue-800 font-semibold text-lg">Mbps</div>
                  <div className="text-sm text-blue-700 mt-2 font-medium">Velocidade de Upload</div>
                  
                  {/* Barra de velocidade */}
                  <div className="mt-4 bg-blue-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${Math.min((result.upload / 50) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Ping */}
              <div className="text-center">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border-2 border-purple-200">
                  <div className="text-4xl mb-2">📡</div>
                  <div className="text-4xl font-bold text-purple-600 mb-2">
                    {result.ping}
                  </div>
                  <div className="text-purple-800 font-semibold text-lg">ms</div>
                  <div className="text-sm text-purple-700 mt-2 font-medium">Latência (Ping)</div>
                  
                  {/* Barra de latência (invertida - menor é melhor) */}
                  <div className="mt-4 bg-purple-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${Math.max(20, 100 - (result.ping / 200) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Resumo Comparativo */}
            <div className="mt-8 bg-gray-50 rounded-xl p-6">
              <h4 className="font-bold text-gray-900 mb-4 text-center">📊 Comparação com Atividades Comuns</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium text-gray-800 mb-2">✅ Você pode fazer com facilidade:</div>
                  <ul className="space-y-1 text-gray-700">
                    <li>• Navegar na web e redes sociais</li>
                    <li>• Enviar emails e mensagens</li>
                    {result.download > 5 && <li>• Assistir vídeos em HD</li>}
                    {result.download > 25 && <li>• Videoconferências em alta qualidade</li>}
                    {result.download > 50 && <li>• Streaming 4K e jogos online</li>}
                    {result.download > 100 && <li>• Downloads muito rápidos</li>}
                  </ul>
                </div>
                <div>
                  <div className="font-medium text-gray-800 mb-2">⚡ Recomendações:</div>
                  <ul className="space-y-1 text-gray-700">
                    {result.ping > 100 && <li>• Considere melhorar a latência para jogos</li>}
                    {result.upload < 5 && <li>• Upload pode ser lento para arquivos grandes</li>}
                    {result.download < 10 && <li>• Considere upgrade de plano de internet</li>}
                    {result.quality === 'excellent' && <li>• Sua conexão está excelente!</li>}
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-center mt-6">
              <button
                onClick={resetTest}
                className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-8 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 flex items-center gap-2 mx-auto font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <RotateCcw size={18} />
                Testar Novamente
              </button>
            </div>

            <div className="text-center text-sm text-gray-500 mt-4">
              📅 Teste realizado em {result.timestamp.toLocaleString()}
            </div>
          </div>
        )}

        {/* Histórico de Testes */}
        {testHistory.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">📈 Histórico de Testes</h3>
              <button
                onClick={() => {
                  setTestHistory([]);
                  localStorage.removeItem('utilidadeweb-speedtest-history');
                }}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Limpar Histórico
              </button>
            </div>

            <div className="space-y-3">
              {testHistory.map((test, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-sm font-medium text-green-600">⬇️ {test.download} Mbps</div>
                        <div className="text-xs text-gray-500">Download</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium text-blue-600">⬆️ {test.upload} Mbps</div>
                        <div className="text-xs text-gray-500">Upload</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium text-purple-600">📡 {test.ping} ms</div>
                        <div className="text-xs text-gray-500">Ping</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${getQualityColor(test.quality)}`}>
                        {getQualityText(test.quality)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {test.timestamp.toLocaleDateString()} {test.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Média dos testes */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-800 mb-3">📊 Médias dos Últimos Testes</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-lg font-bold text-green-600">
                    {(testHistory.reduce((sum, test) => sum + test.download, 0) / testHistory.length).toFixed(1)}
                  </div>
                  <div className="text-xs text-green-700">Mbps Download</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-lg font-bold text-blue-600">
                    {(testHistory.reduce((sum, test) => sum + test.upload, 0) / testHistory.length).toFixed(1)}
                  </div>
                  <div className="text-xs text-blue-700">Mbps Upload</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="text-lg font-bold text-purple-600">
                    {(testHistory.reduce((sum, test) => sum + test.ping, 0) / testHistory.length).toFixed(1)}
                  </div>
                  <div className="text-xs text-purple-700">ms Ping</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Informações da Conexão */}
        {connectionInfo && (
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Gauge size={20} className="text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-800">Informações da Conexão</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Tipo</div>
                <div className="font-medium text-gray-900">{connectionInfo.type}</div>
              </div>
              <div>
                <div className="text-gray-500">Tipo Efetivo</div>
                <div className="font-medium text-gray-900">{connectionInfo.effectiveType}</div>
              </div>
              <div>
                <div className="text-gray-500">Downlink</div>
                <div className="font-medium text-gray-900">{connectionInfo.downlink} Mbps</div>
              </div>
              <div>
                <div className="text-gray-500">RTT</div>
                <div className="font-medium text-gray-900">{connectionInfo.rtt} ms</div>
              </div>
            </div>
          </div>
        )}

        {/* Interpretação dos Resultados */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">📊 Interpretação dos Resultados:</h4>
          <div className="text-sm text-blue-800 space-y-2">
            <div><strong>Download:</strong> Velocidade para baixar arquivos da internet</div>
            <div><strong>Upload:</strong> Velocidade para enviar arquivos para a internet</div>
            <div><strong>Ping:</strong> Tempo de resposta (latência) - menor é melhor</div>
            <div className="mt-3">
              <strong>Qualidade da Conexão:</strong>
              <ul className="mt-1 ml-4 space-y-1">
                <li>• <span className="text-red-600">Ruim:</span> &lt;10 Mbps download ou &gt;100ms ping</li>
                <li>• <span className="text-yellow-600">Regular:</span> 10-25 Mbps download, 50-100ms ping</li>
                <li>• <span className="text-blue-600">Boa:</span> 25-50 Mbps download, 20-50ms ping</li>
                <li>• <span className="text-green-600">Excelente:</span> &gt;50 Mbps download, &lt;20ms ping</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Aviso */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Importante:</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Este é um teste simulado para demonstração</li>
            <li>• Os resultados são gerados aleatoriamente e não refletem sua velocidade real</li>
            <li>• Para testes reais, use serviços como Speedtest.net ou Fast.com</li>
            <li>• A velocidade pode variar dependendo do horário e tráfego da rede</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}
