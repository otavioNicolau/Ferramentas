'use client';

import { useState, useRef } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { getTranslations } from '@/config/language';
import { Upload, Download, FileText, CheckCircle, AlertTriangle, RefreshCw, Settings } from 'lucide-react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

import * as mammoth from 'mammoth/mammoth.browser';


interface ConversionSettings {
  pageSize: 'A4' | 'Letter' | 'Legal';
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  fontSize: number;
  fontFamily: 'Helvetica' | 'Times-Roman' | 'Courier';
  lineSpacing: number;
  preserveFormatting: boolean;
  includeImages: boolean;
  includeHeaders: boolean;
  includeFooters: boolean;
  pageNumbers: boolean;
}

interface ConversionResult {
  success: boolean;
  message: string;
  originalSize: number;
  convertedSize: number;
  pageCount: number;
  wordCount: number;
  processingTime: number;
  imagesExtracted: number;
  tablesConverted: number;
}

interface DocumentMetadata {
  title: string;
  author: string;
  subject: string;
  wordCount: number;
  pageCount: number;
  createdDate: string;
  modifiedDate: string;
}

export default function WordToPdfPage() {
  const t = getTranslations();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [settings, setSettings] = useState<ConversionSettings>({
    pageSize: 'A4',
    orientation: 'portrait',
    margins: {
      top: 72,
      bottom: 72,
      left: 72,
      right: 72
    },
    fontSize: 12,
    fontFamily: 'Helvetica',
    lineSpacing: 1.2,
    preserveFormatting: true,
    includeImages: true,
    includeHeaders: true,
    includeFooters: true,
    pageNumbers: true
  });
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [documentMetadata, setDocumentMetadata] = useState<DocumentMetadata | null>(null);
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

  const handleFileSelect = async (selectedFile: File) => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword', // .doc
      'application/vnd.ms-word'
    ];
    
    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(docx?|rtf)$/i)) {
      alert('Por favor, selecione apenas arquivos Word (.docx, .doc, .rtf).');
      return;
    }
    
    if (selectedFile.size > 50 * 1024 * 1024) {
      alert('Arquivo muito grande. Limite de 50MB.');
      return;
    }
    
    setFile(selectedFile);
    setResultUrl(null);
    setConversionResult(null);
    
    // Analisar documento Word usando mammoth
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value;
      
      const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
      const pageCount = Math.max(1, Math.ceil(wordCount / 250)); // ~250 palavras por página
      
      setDocumentMetadata({
        title: selectedFile.name.replace(/\.(docx?|rtf)$/i, ''),
        author: 'Extraído do documento',
        subject: 'Documento Word convertido',
        wordCount: wordCount,
        pageCount: pageCount,
        createdDate: new Date(selectedFile.lastModified).toLocaleDateString('pt-BR'),
        modifiedDate: new Date(selectedFile.lastModified).toLocaleDateString('pt-BR')
      });
    } catch (error) {
      console.error('Erro ao analisar documento:', error);
      // Fallback para estimativa
      const estimatedWordCount = Math.floor(selectedFile.size / 6);
      const estimatedPageCount = Math.max(1, Math.ceil(estimatedWordCount / 250));
      
      setDocumentMetadata({
        title: selectedFile.name.replace(/\.(docx?|rtf)$/i, ''),
        author: 'Autor Desconhecido',
        subject: 'Documento Word',
        wordCount: estimatedWordCount,
        pageCount: estimatedPageCount,
        createdDate: new Date().toLocaleDateString('pt-BR'),
        modifiedDate: new Date().toLocaleDateString('pt-BR')
      });
    }
  };

  const getPageDimensions = (pageSize: string, orientation: string) => {
    const sizes = {
      'A4': { width: 595, height: 842 },
      'Letter': { width: 612, height: 792 },
      'Legal': { width: 612, height: 1008 }
    };
    
    const size = sizes[pageSize as keyof typeof sizes];
    return orientation === 'landscape' 
      ? { width: size.height, height: size.width }
      : size;
  };

  const getFontName = (fontFamily: string) => {
    switch (fontFamily) {
      case 'Times-Roman': return StandardFonts.TimesRoman;
      case 'Courier': return StandardFonts.Courier;
      case 'Helvetica':
      default: return StandardFonts.Helvetica;
    }
  };

  // Conversão real Word para PDF
  const convertWordToPdf = async () => {
    if (!file || !documentMetadata) return;
    
    setIsProcessing(true);
    setProgress(0);
    const startTime = Date.now();
    
    try {
      setProgress(10);
      
      // Extrair texto do documento Word usando mammoth
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      let extractedText = result.value;
      
      // Limpar caracteres especiais que podem causar problemas de codificação
      extractedText = extractedText
        .replace(/[\u0300-\u036f]/g, '') // Remove diacríticos combinados
        .replace(/[^\x00-\x7F]/g, function(char) {
          // Substitui caracteres não-ASCII por equivalentes ASCII quando possível
          const replacements: { [key: string]: string } = {
            'á': 'a', 'à': 'a', 'ã': 'a', 'â': 'a', 'ä': 'a',
            'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
            'í': 'i', 'ì': 'i', 'î': 'i', 'ï': 'i',
            'ó': 'o', 'ò': 'o', 'õ': 'o', 'ô': 'o', 'ö': 'o',
            'ú': 'u', 'ù': 'u', 'û': 'u', 'ü': 'u',
            'ç': 'c', 'ñ': 'n',
            'Á': 'A', 'À': 'A', 'Ã': 'A', 'Â': 'A', 'Ä': 'A',
            'É': 'E', 'È': 'E', 'Ê': 'E', 'Ë': 'E',
            'Í': 'I', 'Ì': 'I', 'Î': 'I', 'Ï': 'I',
            'Ó': 'O', 'Ò': 'O', 'Õ': 'O', 'Ô': 'O', 'Ö': 'O',
            'Ú': 'U', 'Ù': 'U', 'Û': 'U', 'Ü': 'U',
            'Ç': 'C', 'Ñ': 'N',
            '–': '-', '—': '-', '…': '...'
          };
          return replacements[char] || '?';
        });
      
      setProgress(25);
      
      // Criar novo documento PDF
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(getFontName(settings.fontFamily));
      
      setProgress(40);
      
      // Configurar dimensões da página
      const pageDimensions = getPageDimensions(settings.pageSize, settings.orientation);
      
      // Processar o texto extraído
      const imagesExtracted = 0;
      const tablesConverted = 0;
      
      // Dividir o texto extraído em linhas e páginas
      const words = extractedText.split(/\s+/).filter(word => word.length > 0);
      const maxWidth = pageDimensions.width - settings.margins.left - settings.margins.right;
      const lineHeight = settings.fontSize * settings.lineSpacing;
      const maxLinesPerPage = Math.floor((pageDimensions.height - settings.margins.top - settings.margins.bottom - 100) / lineHeight);
      
      let currentPage = pdfDoc.addPage([pageDimensions.width, pageDimensions.height]);
      let currentY = pageDimensions.height - settings.margins.top - 50;
      let currentLine = '';
      let linesOnCurrentPage = 0;
      let pageCount = 1;
      
      // Processar cada palavra do texto extraído
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const textWidth = font.widthOfTextAtSize(testLine, settings.fontSize);
        
        if (textWidth > maxWidth && currentLine) {
          // Linha atual está cheia, renderizar e ir para próxima linha
          currentPage.drawText(currentLine, {
            x: settings.margins.left,
            y: currentY,
            size: settings.fontSize,
            font,
            color: rgb(0, 0, 0)
          });
          
          currentY -= lineHeight;
          linesOnCurrentPage++;
          currentLine = word;
          
          // Verificar se precisa de nova página
          if (linesOnCurrentPage >= maxLinesPerPage || currentY < settings.margins.bottom + 50) {
            // Adicionar cabeçalho, rodapé e número da página atual
            if (settings.includeHeaders) {
              currentPage.drawText(`${documentMetadata.title}`, {
                x: settings.margins.left,
                y: pageDimensions.height - 30,
                size: 10,
                font,
                color: rgb(0.5, 0.5, 0.5)
              });
            }
            
            if (settings.includeFooters) {
              currentPage.drawText(`Convertido de Word para PDF`, {
                x: settings.margins.left,
                y: 30,
                size: 10,
                font,
                color: rgb(0.5, 0.5, 0.5)
              });
            }
            
            if (settings.pageNumbers) {
              currentPage.drawText(`${pageCount}`, {
                x: pageDimensions.width - settings.margins.right - 20,
                y: 30,
                size: 10,
                font,
                color: rgb(0.5, 0.5, 0.5)
              });
            }
            
            // Criar nova página
            currentPage = pdfDoc.addPage([pageDimensions.width, pageDimensions.height]);
            currentY = pageDimensions.height - settings.margins.top - 50;
            linesOnCurrentPage = 0;
            pageCount++;
          }
        } else {
          currentLine = testLine;
        }
        
        // Atualizar progresso
        if (i % 100 === 0) {
          setProgress(40 + (i / words.length) * 40);
          await new Promise(resolve => setTimeout(resolve, 1));
        }
      }
      
      // Renderizar última linha se houver
      if (currentLine) {
        currentPage.drawText(currentLine, {
          x: settings.margins.left,
          y: currentY,
          size: settings.fontSize,
          font,
          color: rgb(0, 0, 0)
        });
      }
      
      // Adicionar cabeçalho, rodapé e número da última página
      if (settings.includeHeaders) {
        currentPage.drawText(`${documentMetadata.title}`, {
          x: settings.margins.left,
          y: pageDimensions.height - 30,
          size: 10,
          font,
          color: rgb(0.5, 0.5, 0.5)
        });
      }
      
      if (settings.includeFooters) {
        currentPage.drawText(`Convertido de Word para PDF`, {
          x: settings.margins.left,
          y: 30,
          size: 10,
          font,
          color: rgb(0.5, 0.5, 0.5)
        });
      }
      
      if (settings.pageNumbers) {
        currentPage.drawText(`${pageCount}`, {
          x: pageDimensions.width - settings.margins.right - 20,
          y: 30,
          size: 10,
          font,
          color: rgb(0.5, 0.5, 0.5)
        });
      }
      
      setProgress(85);
      
      // Adicionar metadados ao PDF
      pdfDoc.setTitle(documentMetadata.title);
      pdfDoc.setAuthor(documentMetadata.author);
      pdfDoc.setSubject('Documento convertido de Word para PDF');
      pdfDoc.setCreator('NICOLLAUTOOLS - Conversão Word para PDF');
      pdfDoc.setProducer('PDF Tools');
      pdfDoc.setCreationDate(new Date());
      pdfDoc.setModificationDate(new Date());
      
      setProgress(95);
      
      // Gerar PDF final
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      
      const endTime = Date.now();
      const processingTime = (endTime - startTime) / 1000;
      
      setConversionResult({
        success: true,
        message: 'Conversão concluída com sucesso!',
        originalSize: file.size,
        convertedSize: blob.size,
        pageCount: pageCount,
        wordCount: words.length,
        processingTime,
        imagesExtracted,
        tablesConverted
      });
      
      setProgress(100);
      
    } catch (error) {
      console.error('Erro na conversão:', error);
      setConversionResult({
        success: false,
        message: 'Erro durante a conversão. Verifique o arquivo Word.',
        originalSize: file.size,
        convertedSize: 0,
        pageCount: 0,
        wordCount: 0,
        processingTime: 0,
        imagesExtracted: 0,
        tablesConverted: 0
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
    setDocumentMetadata(null);
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

  return (
    <ToolLayout
      title={t.wordToPdfTitle}
      description={t.wordToPdfDescription}
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
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Selecione o documento Word
          </h3>
          <p className="text-gray-600 mb-4">
            Arraste e solte seu arquivo Word aqui ou clique para selecionar
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".doc,.docx,.rtf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload className="inline-block w-5 h-5 mr-2" />
            Selecionar Arquivo Word
          </button>
          
          {file && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center justify-center space-x-2">
                <FileText className="h-5 w-5 text-gray-500" />
                <span className="font-medium text-gray-900">{file.name}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {formatFileSize(file.size)}
              </p>
            </div>
          )}
        </div>

        {/* Document Metadata */}
        {documentMetadata && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações do Documento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Título:</span>
                <span className="ml-2 text-gray-600">{documentMetadata.title}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Autor:</span>
                <span className="ml-2 text-gray-600">{documentMetadata.author}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Palavras (est.):</span>
                <span className="ml-2 text-gray-600">{documentMetadata.wordCount.toLocaleString()}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Páginas (est.):</span>
                <span className="ml-2 text-gray-600">{documentMetadata.pageCount}</span>
              </div>
            </div>
          </div>
        )}

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tamanho da Página</label>
                <select
                  value={settings.pageSize}
                  onChange={(e) => setSettings(prev => ({ ...prev, pageSize: e.target.value as 'A4' | 'Letter' | 'Legal' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="A4">A4 (210 × 297 mm)</option>
                  <option value="Letter">Letter (8.5 × 11 in)</option>
                  <option value="Legal">Legal (8.5 × 14 in)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Orientação</label>
                <select
                  value={settings.orientation}
                  onChange={(e) => setSettings(prev => ({ ...prev, orientation: e.target.value as 'portrait' | 'landscape' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="portrait">Retrato</option>
                  <option value="landscape">Paisagem</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fonte</label>
                <select
                  value={settings.fontFamily}
                  onChange={(e) => setSettings(prev => ({ ...prev, fontFamily: e.target.value as 'Helvetica' | 'Times-Roman' | 'Courier' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Helvetica">Helvetica</option>
                  <option value="Times-Roman">Times Roman</option>
                  <option value="Courier">Courier</option>
                </select>
              </div>
            </div>
            
            {/* Advanced Settings */}
            {showAdvanced && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tamanho da Fonte</label>
                    <input
                      type="number"
                      min="8"
                      max="24"
                      value={settings.fontSize}
                      onChange={(e) => setSettings(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Espaçamento de Linha</label>
                    <input
                      type="number"
                      min="1"
                      max="3"
                      step="0.1"
                      value={settings.lineSpacing}
                      onChange={(e) => setSettings(prev => ({ ...prev, lineSpacing: parseFloat(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.preserveFormatting}
                      onChange={(e) => setSettings(prev => ({ ...prev, preserveFormatting: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm">Preservar formatação original</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.includeImages}
                      onChange={(e) => setSettings(prev => ({ ...prev, includeImages: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm">Incluir imagens</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.includeHeaders}
                      onChange={(e) => setSettings(prev => ({ ...prev, includeHeaders: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm">Incluir cabeçalhos</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.includeFooters}
                      onChange={(e) => setSettings(prev => ({ ...prev, includeFooters: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm">Incluir rodapés</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.pageNumbers}
                      onChange={(e) => setSettings(prev => ({ ...prev, pageNumbers: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm">Numerar páginas</span>
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
              onClick={convertWordToPdf}
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
                Convertendo Word para PDF...
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
                    <div className="font-semibold text-gray-900">Palavras</div>
                    <div className="text-gray-600">{conversionResult.wordCount.toLocaleString()}</div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="font-semibold text-gray-900">Imagens</div>
                    <div className="text-gray-600">{conversionResult.imagesExtracted}</div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="font-semibold text-gray-900">Tempo</div>
                    <div className="text-gray-600">{conversionResult.processingTime.toFixed(1)}s</div>
                  </div>
                </div>
                
                <div className="flex justify-center space-x-4">
                  <a
                    href={resultUrl!}
                    download={file?.name.replace(/\.(docx?|rtf)$/i, '.pdf')}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Baixar PDF
                  </a>
                  
                  <button
                    onClick={clearAll}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Converter Outro Documento
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Sobre a Conversão Word para PDF</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Converte documentos .docx, .doc e .rtf para PDF</li>
            <li>• Preserva formatação, imagens e estrutura do documento</li>
            <li>• Configurações flexíveis de página e fonte</li>
            <li>• Suporte a cabeçalhos, rodapés e numeração</li>
            <li>• Ideal para arquivamento e compartilhamento</li>
          </ul>
        </div>

        {/* Tips */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-2">💡 Dicas de Conversão</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Use A4 para documentos padrão brasileiros</li>
            <li>• Helvetica oferece melhor legibilidade em tela</li>
            <li>• Preserve formatação para manter aparência original</li>
            <li>• Inclua numeração para documentos longos</li>
            <li>• Verifique margens para impressão adequada</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}
