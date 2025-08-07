'use client';

import { useState, useRef, useEffect } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { QrCode, Upload, Camera, Copy, ExternalLink, Scan, X } from 'lucide-react';

interface QRResult {
  text: string;
  format: string;
  timestamp: Date;
}

export default function LerQRCodePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<QRResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [useCamera, setUseCamera] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      // Limpar stream da câmera quando o componente desmontar
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const readQRFromFile = async (file: File) => {
    setIsScanning(true);
    setError(null);
    setResult(null);

    try {
      // Simular leitura de QR code
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simular resultado baseado no nome do arquivo
      const mockResults = [
        { text: 'https://www.google.com', format: 'URL' },
        { text: 'mailto:contato@exemplo.com', format: 'Email' },
        { text: 'Texto simples do QR Code', format: 'Texto' },
        { text: 'tel:+5511999999999', format: 'Telefone' },
        { text: 'wifi:T:WPA;S:MinhaRede;P:minhasenha123;;', format: 'WiFi' },
      ];
      
      const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
      
      setResult({
        ...randomResult,
        timestamp: new Date()
      });

    } catch (err) {
      setError('Não foi possível ler o QR Code da imagem. Verifique se a imagem contém um código QR válido.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Por favor, selecione um arquivo de imagem válido.');
        return;
      }
      setSelectedFile(file);
      readQRFromFile(file);
    }
  };

  const startCamera = async () => {
    setError(null);
    setUseCamera(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment' // Preferir câmera traseira
        } 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      // Simular escaneamento contínuo
      setTimeout(() => {
        scanFromCamera();
      }, 3000);
      
    } catch (err) {
      setError('Não foi possível acessar a câmera. Verifique as permissões.');
      setUseCamera(false);
    }
  };

  const scanFromCamera = () => {
    // Simular leitura bem-sucedida
    const mockResult = {
      text: 'QR Code lido pela câmera: https://exemplo.com/qr-camera',
      format: 'URL',
      timestamp: new Date()
    };
    
    setResult(mockResult);
    stopCamera();
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setUseCamera(false);
  };

  const copyToClipboard = async () => {
    if (!result) return;
    
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const openLink = () => {
    if (!result) return;
    
    if (result.text.startsWith('http://') || result.text.startsWith('https://')) {
      window.open(result.text, '_blank');
    } else if (result.text.startsWith('mailto:')) {
      window.location.href = result.text;
    } else if (result.text.startsWith('tel:')) {
      window.location.href = result.text;
    }
  };

  const reset = () => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
    setUseCamera(false);
    stopCamera();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isActionableResult = result && (
    result.text.startsWith('http://') || 
    result.text.startsWith('https://') || 
    result.text.startsWith('mailto:') || 
    result.text.startsWith('tel:')
  );

  return (
    <ToolLayout
      title="Ler QR Code"
      description="Leia códigos QR através de upload de imagem ou câmera em tempo real."
    >
      <div className="space-y-6">
        {/* Métodos de Input */}
        {!useCamera && !result && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Upload de Arquivo */}
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Upload de Imagem
              </h3>
              <p className="text-gray-600 mb-4">
                Clique para selecionar uma imagem com QR Code
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="text-xs text-gray-500">
                Suporte: JPG, PNG, GIF, WEBP
              </div>
            </div>

            {/* Câmera */}
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
              onClick={startCamera}
            >
              <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Usar Câmera
              </h3>
              <p className="text-gray-600 mb-4">
                Escaneie QR Codes em tempo real
              </p>
              <div className="text-xs text-gray-500">
                Funciona com câmera frontal ou traseira
              </div>
            </div>
          </div>
        )}

        {/* Visualização da Câmera */}
        {useCamera && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Scanner de QR Code</h3>
              <button
                onClick={stopCamera}
                className="text-red-600 hover:text-red-700 p-2"
                title="Fechar câmera"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full max-w-md mx-auto rounded-lg bg-gray-900"
                autoPlay
                playsInline
                muted
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Overlay de scanner */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-2 border-blue-500 rounded-lg relative">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500"></div>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-4 text-gray-600">
              <Scan className="inline-block w-5 h-5 mr-2" />
              Posicione o QR Code dentro do quadrado
            </div>
          </div>
        )}

        {/* Estado de Carregamento */}
        {isScanning && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
              <span className="text-blue-800 font-medium">Lendo QR Code...</span>
            </div>
            <p className="text-blue-700">Aguarde enquanto processamos a imagem</p>
          </div>
        )}

        {/* Resultado */}
        {result && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">QR Code Lido com Sucesso!</h3>
              <button
                onClick={reset}
                className="text-gray-600 hover:text-gray-700 text-sm font-medium"
              >
                Ler Outro
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conteúdo ({result.format})
                </label>
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <p className="text-gray-900 break-all font-mono text-sm">
                    {result.text}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={copyToClipboard}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    copied ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <Copy size={16} />
                  {copied ? 'Copiado!' : 'Copiar Texto'}
                </button>

                {isActionableResult && (
                  <button
                    onClick={openLink}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <ExternalLink size={16} />
                    Abrir Link
                  </button>
                )}
              </div>

              <div className="text-xs text-gray-500">
                Lido em {result.timestamp.toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-red-600">❌</div>
              <div>
                <h4 className="font-medium text-red-800">Erro ao ler QR Code</h4>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Estado vazio */}
        {!selectedFile && !useCamera && !result && !isScanning && (
          <div className="text-center py-12 text-gray-600">
            <QrCode className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="font-medium text-gray-700">Selecione um método para ler QR Codes</p>
            <p className="text-sm mt-1 text-gray-500">Escolha entre upload de imagem ou câmera</p>
          </div>
        )}

        {/* Informações */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Importante:</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Esta é uma simulação de leitor de QR Code para demonstração</li>
            <li>• Os resultados são gerados aleatoriamente, não leem QR Codes reais</li>
            <li>• Para uso real, considere bibliotecas como ZXing ou QuaggaJS</li>
            <li>• A câmera solicita permissões do navegador</li>
          </ul>
        </div>

        {/* Dicas */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">💡 Dicas:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use imagens com boa qualidade e iluminação adequada</li>
            <li>• Certifique-se de que o QR Code está completamente visível</li>
            <li>• Para câmera, mantenha o código dentro do quadrado de scanner</li>
            <li>• Suporta diferentes tipos: URLs, texto, email, telefone, WiFi</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}
