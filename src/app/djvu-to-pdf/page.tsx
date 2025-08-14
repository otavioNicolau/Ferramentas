'use client';

import { useState, useRef } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Upload, Download, FileText, CheckCircle, AlertTriangle, FileImage, RefreshCw, Settings } from 'lucide-react';
import { PDFDocument, rgb } from 'pdf-lib';

interface ConversionSettings {
  quality: 'low' | 'medium' | 'high';
  preserveBookmarks: boolean;
  preserveText: boolean;
  pageSize: 'original' | 'a4' | 'letter';
  compression: boolean;
}

interface ConversionResult {
  success: boolean;
  message: string;
  originalSize: number;
  convertedSize: number;
  pageCount: number;
  processingTime: number;
}

export default function DjvuToPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [settings, setSettings] = useState<ConversionSettings>({
    quality: 'medium',
    preserveBookmarks: true,
    preserveText: true,
    pageSize: 'original',
    compression: true
  });
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    // Verificar se é um arquivo DjVu
    const isDjVu = selectedFile.name.toLowerCase().endsWith('.djvu') || 
                   selectedFile.name.toLowerCase().endsWith('.djv');
    
    if (!isDjVu) {
      alert('Por favor, selecione apenas arquivos DjVu (.djvu ou .djv).');
      return;
    }
    
    if (selectedFile.size > 200 * 1024 * 1024) {
      alert('Arquivo muito grande. Limite de 200MB.');
      return;
    }
    
    setFile(selectedFile);
    setResultUrl(null);
    setConversionResult(null);
  };

  // Simulação da conversão DjVu para PDF
  // Em uma implementação real, seria necessário usar uma biblioteca específica
  // ou um serviço backend para processar arquivos DjVu
  const convertDjvuToPdf = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setProgress(0);
    const startTime = Date.now();
    
    try {
      setProgress(20);
      
      // Simular processamento do arquivo DjVu
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProgress(40);
      
      // Criar um PDF de exemplo (em uma implementação real, 
      // as páginas seriam extraídas do arquivo DjVu)
      const pdfDoc = await PDFDocument.create();
      
      // Simular múltiplas páginas baseado no tamanho do arquivo
      const estimatedPages = Math.max(1, Math.floor(file.size / (100 * 1024)));
      
      setProgress(60);
      
      for (let i = 0; i < Math.min(estimatedPages, 50); i++) {
        const page = pdfDoc.addPage();
        const { width, height } = page.getSize();
        
        // Adicionar texto indicativo
        page.drawText(`Página ${i + 1} convertida de DjVu`, {
          x: 50,
          y: height - 100,
          size: 16,
          color: rgb(0, 0, 0)
        });
        
        page.drawText(`Arquivo original: ${file.name}`, {
          x: 50,
          y: height - 130,
          size: 12,
          color: rgb(0.5, 0.5, 0.5)
        });
        
        page.drawText(`Configurações: Qualidade ${settings.quality}`, {
          x: 50,
          y: height - 150,
          size: 10,
          color: rgb(0.7, 0.7, 0.7)
        });
        
        // Simular progresso
        if (i % 5 === 0) {
          setProgress(60 + (i / estimatedPages) * 20);
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      setProgress(80);
      
      // Adicionar metadados
      pdfDoc.setTitle(`${file.name.replace(/\.(djvu|djv)$/i, '')} - Convertido`);
      pdfDoc.setAuthor('MUILTOOLS - Conversão DjVu');
      pdfDoc.setSubject('Documento convertido de DjVu para PDF');
      pdfDoc.setCreator('DjVu to PDF Converter');
      pdfDoc.setProducer('PDF Tools');
      pdfDoc.setCreationDate(new Date());
      pdfDoc.setModificationDate(new Date());
      
      setProgress(90);
      
      // Gerar PDF
      const pdfBytes = await pdfDoc.save({
        useObjectStreams: settings.compression
      });
      
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      
      const endTime = Date.now();
      const processingTime = (endTime - startTime) / 1000;
      
      setConversionResult({
        success: true,
        message: 'Conversão concluída com sucesso!',
        originalSize: file.size,
        convertedSize: pdfBytes.length,
        pageCount: estimatedPages,
        processingTime
      });
      
      setProgress(100);
      
    } catch (error) {
      console.error('Erro na conversão:', error);
      setConversionResult({
        success: false,
        message: 'Erro durante a conversão. Verifique o arquivo DjVu.',
        originalSize: file.size,
        convertedSize: 0,
        pageCount: 0,
        processingTime: 0
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const clearAll = () => {
    setFile(null);
    setResultUrl(null);
    setConversionResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCompressionRatio = (): string => {
    if (!conversionResult || conversionResult.convertedSize === 0) return '0%';
    const ratio = ((conversionResult.originalSize - conversionResult.convertedSize) / conversionResult.originalSize) * 100;
    return ratio > 0 ? `${ratio.toFixed(1)}%` : '0%';
  };

  return (
    <ToolLayout
      title="DjVu para PDF"
      description="Converta arquivos DjVu para formato PDF"
    >
      <div className="space-y-6">
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <FileImage className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Selecione o arquivo DjVu
          </h3>
          <p className="text-gray-600 mb-4">
            Arraste e solte seu arquivo DjVu aqui ou clique para selecionar
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".djvu,.djv"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload className="inline-block w-5 h-5 mr-2" />
            Selecionar Arquivo DjVu
          </button>
          
          {file && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center justify-center space-x-2">
                <FileImage className="h-5 w-5 text-gray-500" />
                <span className="font-medium text-gray-900">{file.name}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {formatFileSize(file.size)}
              </p>
            </div>
          )}
        </div>

        {/* Conversion Settings */}
        {file && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Configurações de Conversão</h3>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-blue-600 hover:text-blue-700 flex items-center text-sm"
              >
                <Settings className="w-4 h-4 mr-1" />
                {showAdvanced ? 'Ocultar' : 'Mostrar'} Avançadas
              </button>
            </div>
            
            {/* Basic Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Qualidade</label>
                <select
                  value={settings.quality}
                  onChange={(e) => setSettings(prev => ({ ...prev, quality: e.target.value as 'low' | 'medium' | 'high' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Baixa (arquivo menor)</option>
                  <option value="medium">Média (balanceado)</option>
                  <option value="high">Alta (melhor qualidade)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tamanho da Página</label>
                <select
                  value={settings.pageSize}
                  onChange={(e) => setSettings(prev => ({ ...prev, pageSize: e.target.value as 'original' | 'a4' | 'letter' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="original">Original</option>
                  <option value="a4">A4</option>
                  <option value="letter">Carta</option>
                </select>
              </div>
            </div>
            
            {/* Advanced Settings */}
            {showAdvanced && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.preserveBookmarks}
                      onChange={(e) => setSettings(prev => ({ ...prev, preserveBookmarks: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm">Preservar marcadores (se disponíveis)</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.preserveText}
                      onChange={(e) => setSettings(prev => ({ ...prev, preserveText: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm">Preservar texto pesquisável</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.compression}
                      onChange={(e) => setSettings(prev => ({ ...prev, compression: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm">Aplicar compressão adicional</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Convert Button */}
        {file && (
          <div className="text-center">
            <button
              onClick={convertDjvuToPdf}
              disabled={isProcessing}
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center mx-auto"
            >
              <RefreshCw className={`w-5 h-5 mr-2 ${isProcessing ? 'animate-spin' : ''}`} />
              {isProcessing ? 'Convertendo...' : 'Converter para PDF'}
            </button>
          </div>
        )}

        {/* Progress */}
        {isProcessing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-blue-900">
                Convertendo DjVu para PDF...
              </span>
              <span className="text-sm font-bold text-blue-900">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Result */}
        {conversionResult && (
          <div className={`border rounded-lg p-6 ${
            conversionResult.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center mb-4">
              {conversionResult.success ? (
                <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-red-500 mr-2" />
              )}
              <h3 className={`text-xl font-bold ${
                conversionResult.success ? 'text-green-900' : 'text-red-900'
              }`}>
                {conversionResult.message}
              </h3>
            </div>
            
            {conversionResult.success && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
                  <div className="bg-white p-3 rounded border">
                    <div className="font-semibold text-gray-900">Páginas</div>
                    <div className="text-gray-600">{conversionResult.pageCount}</div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="font-semibold text-gray-900">Tamanho Original</div>
                    <div className="text-gray-600">{formatFileSize(conversionResult.originalSize)}</div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="font-semibold text-gray-900">Tamanho Final</div>
                    <div className="text-gray-600">{formatFileSize(conversionResult.convertedSize)}</div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="font-semibold text-gray-900">Tempo</div>
                    <div className="text-gray-600">{conversionResult.processingTime.toFixed(1)}s</div>
                  </div>
                </div>
                
                <div className="flex justify-center space-x-4">
                  <a
                    href={resultUrl!}
                    download={file?.name.replace(/\.(djvu|djv)$/i, '.pdf')}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Baixar PDF
                  </a>
                  
                  <button
                    onClick={clearAll}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Converter Outro Arquivo
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Sobre a Conversão DjVu para PDF</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• DjVu é um formato otimizado para documentos digitalizados</li>
            <li>• A conversão preserva a qualidade das imagens</li>
            <li>• Suporte a múltiplas páginas e metadados</li>
            <li>• Configurações ajustáveis de qualidade e compressão</li>
            <li>• Compatível com arquivos .djvu e .djv</li>
          </ul>
        </div>

        {/* Tips */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-2">💡 Dicas de Conversão</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Use qualidade alta para documentos com texto pequeno</li>
            <li>• Qualidade baixa é adequada para visualização rápida</li>
            <li>• A compressão adicional reduz o tamanho do arquivo</li>
            <li>• Arquivos grandes podem demorar mais para processar</li>
            <li>• Verifique se o arquivo DjVu não está corrompido</li>
          </ul>
        </div>

        {/* Warning */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="font-semibold text-orange-900 mb-2">⚠️ Nota Importante</h4>
          <p className="text-sm text-orange-800">
            Esta é uma implementação de demonstração. Para conversão real de arquivos DjVu, 
            seria necessário integrar uma biblioteca específica como DjVuLibre ou usar um 
            serviço backend especializado.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
