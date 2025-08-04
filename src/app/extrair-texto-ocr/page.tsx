'use client';

import { useState, useRef } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Upload, Eye, Download, Copy, FileText, Image as ImageIcon, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { saveAs } from 'file-saver';

interface OCRResult {
  text: string;
  confidence: number;
  language: string;
  processingTime: number;
}

export default function ExtrairTextoOcrPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<{ file: File; result: OCRResult | null; error?: string }[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState('por');
  const [showPreview, setShowPreview] = useState(true);
  const [processingProgress, setProcessingProgress] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supportedLanguages = [
    { code: 'por', name: 'Português' },
    { code: 'eng', name: 'Inglês' },
    { code: 'spa', name: 'Espanhol' },
    { code: 'fra', name: 'Francês' },
    { code: 'deu', name: 'Alemão' },
    { code: 'ita', name: 'Italiano' },
    { code: 'rus', name: 'Russo' },
    { code: 'chi_sim', name: 'Chinês Simplificado' },
    { code: 'jpn', name: 'Japonês' },
    { code: 'ara', name: 'Árabe' }
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== files.length) {
      alert('Apenas arquivos de imagem são suportados (JPG, PNG, GIF, BMP, WEBP).');
    }
    
    setSelectedFiles(imageFiles);
    setResults([]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== files.length) {
      alert('Apenas arquivos de imagem são suportados.');
    }
    
    setSelectedFiles(imageFiles);
    setResults([]);
  };

  const processOCR = async () => {
    if (selectedFiles.length === 0) return;

    setIsProcessing(true);
    setProcessingProgress(0);
    const newResults: { file: File; result: OCRResult | null; error?: string }[] = [];

    try {
      // Importar Tesseract dinamicamente
      const Tesseract = await import('tesseract.js');

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const startTime = Date.now();

        try {
          setProcessingProgress(((i + 0.5) / selectedFiles.length) * 100);

          const { data } = await Tesseract.recognize(file, selectedLanguage, {
            logger: (m) => {
              if (m.status === 'recognizing text') {
                const progress = ((i + m.progress) / selectedFiles.length) * 100;
                setProcessingProgress(progress);
              }
            }
          });

          const processingTime = Date.now() - startTime;

          newResults.push({
            file,
            result: {
              text: data.text.trim(),
              confidence: Math.round(data.confidence),
              language: selectedLanguage,
              processingTime
            }
          });
        } catch (error) {
          console.error(`Erro ao processar ${file.name}:`, error);
          newResults.push({
            file,
            result: null,
            error: 'Erro ao processar imagem. Tente com uma imagem de melhor qualidade.'
          });
        }

        setProcessingProgress(((i + 1) / selectedFiles.length) * 100);
      }

      setResults(newResults);
    } catch (error) {
      console.error('Erro no OCR:', error);
      alert('Erro ao inicializar o OCR. Tente recarregar a página.');
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Texto copiado para a área de transferência!');
    });
  };

  const downloadAsText = (text: string, fileName: string) => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, fileName.replace(/\.[^/.]+$/, '') + '_texto_extraido.txt');
  };

  const downloadAllTexts = () => {
    const allTexts = results
      .filter(r => r.result)
      .map(r => `=== ${r.file.name} ===\n${r.result!.text}\n\n`)
      .join('');
    
    const blob = new Blob([allTexts], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, 'todos_textos_extraidos.txt');
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setResults([]);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <ToolLayout
      title="OCR - Extrair Texto"
      description="Extraia texto de imagens usando tecnologia OCR avançada com suporte a múltiplos idiomas."
    >
      <div className="space-y-6">
        {/* Área de Upload */}
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            Selecione ou arraste imagens
          </h3>
          <p className="text-gray-600 mb-4">
            Suporta JPG, PNG, GIF, BMP e WEBP - Múltiplos arquivos permitidos
          </p>
          <div className="flex items-center justify-center gap-3">
            <ImageIcon size={20} className="text-blue-600" />
            <span className="text-blue-600 font-medium">Escolher Imagens</span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Configurações */}
        {selectedFiles.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Configurações do OCR</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Idioma do Texto
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {supportedLanguages.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showPreview"
                  checked={showPreview}
                  onChange={(e) => setShowPreview(e.target.checked)}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="showPreview" className="text-sm font-medium text-gray-700">
                  Mostrar preview das imagens
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Lista de Arquivos */}
        {selectedFiles.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Imagens Selecionadas ({selectedFiles.length})
              </h3>
              <button
                onClick={processOCR}
                disabled={isProcessing}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <FileText size={16} />
                    Extrair Texto
                  </>
                )}
              </button>
            </div>

            {/* Barra de Progresso */}
            {isProcessing && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Processando OCR...</span>
                  <span>{Math.round(processingProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${processingProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
                  {showPreview && (
                    <div className="flex-shrink-0">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{file.name}</h4>
                    <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                    
                    {/* Resultado do OCR */}
                    {results[index] && (
                      <div className="mt-3">
                        {results[index].result ? (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle size={16} className="text-green-600" />
                              <span className="text-sm font-medium text-green-800">
                                Texto extraído (Confiança: {results[index].result!.confidence}%)
                              </span>
                              <span className="text-xs text-green-600">
                                {results[index].result!.processingTime}ms
                              </span>
                            </div>
                            <div className="bg-white border border-green-200 rounded p-3 max-h-32 overflow-y-auto">
                              <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                                {results[index].result!.text || 'Nenhum texto encontrado na imagem'}
                              </pre>
                            </div>
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => copyToClipboard(results[index].result!.text)}
                                className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-1"
                              >
                                <Copy size={12} />
                                Copiar
                              </button>
                              <button
                                onClick={() => downloadAsText(results[index].result!.text, file.name)}
                                className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 flex items-center gap-1"
                              >
                                <Download size={12} />
                                Download
                              </button>
                            </div>
                          </div>
                        ) : results[index].error ? (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <div className="flex items-center gap-2">
                              <AlertCircle size={16} className="text-red-600" />
                              <span className="text-sm text-red-800">{results[index].error}</span>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Remover arquivo"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Botão para baixar todos os textos */}
            {results.some(r => r.result) && (
              <div className="text-center mt-6">
                <button
                  onClick={downloadAllTexts}
                  className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-3 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 flex items-center gap-3 mx-auto shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Download size={20} />
                  <span className="font-medium">Baixar Todos os Textos</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Estado vazio */}
        {selectedFiles.length === 0 && (
          <div className="text-center py-8 text-gray-600">
            <Eye className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="font-medium text-gray-700">Nenhuma imagem selecionada</p>
            <p className="text-sm mt-1 text-gray-500">Selecione imagens para extrair texto usando OCR</p>
          </div>
        )}

        {/* Informações sobre OCR */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">🔍 Sobre o OCR:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Qualidade da imagem:</strong> Para melhores resultados, use imagens nítidas e com boa resolução</li>
            <li>• <strong>Contraste:</strong> Texto escuro em fundo claro funciona melhor</li>
            <li>• <strong>Orientação:</strong> Certifique-se de que o texto esteja na orientação correta</li>
            <li>• <strong>Idiomas:</strong> Selecione o idioma correto para maior precisão</li>
            <li>• <strong>Formatos suportados:</strong> JPG, PNG, GIF, BMP, WEBP</li>
            <li>• <strong>Processamento:</strong> O OCR é feito localmente no seu navegador</li>
          </ul>
        </div>

        {/* Dicas de uso */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-2">💡 Dicas para Melhor Precisão:</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Use imagens com resolução de pelo menos 300 DPI</li>
            <li>• Evite imagens com ruído, borrão ou distorção</li>
            <li>• Para documentos escaneados, use modo "texto" ou "documento"</li>
            <li>• Fotografias de tela podem ter qualidade inferior</li>
            <li>• Textos muito pequenos podem ser difíceis de reconhecer</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}
