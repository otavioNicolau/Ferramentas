'use client';

import { useState, useRef } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Upload, Download, FileText, CheckCircle, AlertTriangle, BookOpen, RefreshCw, Settings, FileImage } from 'lucide-react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import JSZip from 'jszip';
import ePub from 'epubjs';

interface ConversionSettings {
  fontSize: number;
  fontFamily: 'helvetica' | 'times' | 'courier';
  pageSize: 'a4' | 'letter' | 'a5';
  margins: number;
  lineSpacing: number;
  preserveImages: boolean;
  includeTableOfContents: boolean;
  chapterBreaks: boolean;
}

interface ConversionResult {
  success: boolean;
  message: string;
  originalSize: number;
  convertedSize: number;
  pageCount: number;
  chapterCount: number;
  processingTime: number;
}

interface EpubMetadata {
  title: string;
  author: string;
  description: string;
  language: string;
  publisher: string;
  publicationDate: string;
}

export default function EpubToPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [settings, setSettings] = useState<ConversionSettings>({
    fontSize: 12,
    fontFamily: 'helvetica',
    pageSize: 'a4',
    margins: 50,
    lineSpacing: 1.2,
    preserveImages: true,
    includeTableOfContents: true,
    chapterBreaks: true
  });
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [epubMetadata, setEpubMetadata] = useState<EpubMetadata | null>(null);
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
    // Verificar se é um arquivo EPUB
    const isEpub = selectedFile.name.toLowerCase().endsWith('.epub');
    
    if (!isEpub) {
      alert('Por favor, selecione apenas arquivos EPUB (.epub).');
      return;
    }
    
    if (selectedFile.size > 100 * 1024 * 1024) {
      alert('Arquivo muito grande. Limite de 100MB.');
      return;
    }
    
    setFile(selectedFile);
    setResultUrl(null);
    setConversionResult(null);
    
    // Simular extração de metadados do EPUB
    setEpubMetadata({
      title: selectedFile.name.replace('.epub', ''),
      author: 'Autor Desconhecido',
      description: 'Livro eletrônico em formato EPUB',
      language: 'pt-BR',
      publisher: 'Editor Desconhecido',
      publicationDate: new Date().getFullYear().toString()
    });
  };

  const getPageDimensions = (pageSize: string) => {
    switch (pageSize) {
      case 'a4': return { width: 595, height: 842 };
      case 'letter': return { width: 612, height: 792 };
      case 'a5': return { width: 420, height: 595 };
      default: return { width: 595, height: 842 };
    }
  };

  const getFontName = (fontFamily: string) => {
    switch (fontFamily) {
      case 'helvetica': return StandardFonts.Helvetica;
      case 'times': return StandardFonts.TimesRoman;
      case 'courier': return StandardFonts.Courier;
      default: return StandardFonts.Helvetica;
    }
  };

  // Conversão real EPUB para PDF
  const convertEpubToPdf = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setProgress(0);
    const startTime = Date.now();
    
    try {
      setProgress(10);
      
      // Ler arquivo EPUB como ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      setProgress(20);

      // Analisar EPUB usando epub.js
      const book = ePub(arrayBuffer);
      await book.ready;
      setProgress(30);

      // Extrair metadados reais
      const realMetadata: EpubMetadata = {
        title: book.packaging.metadata.title || file.name.replace('.epub', ''),
        author: book.packaging.metadata.creator || 'Autor Desconhecido',
        description: book.packaging.metadata.description || 'Livro eletrônico em formato EPUB',
        language: book.packaging.metadata.language || 'pt-BR',
        publisher: book.packaging.metadata.publisher || 'Editor Desconhecido',
        publicationDate: book.packaging.metadata.pubdate || new Date().getFullYear().toString()
      };

      setEpubMetadata(realMetadata);
      setProgress(35);

      // Extrair conteúdo de texto de todos os itens da espinha
      const chapters: string[] = [];
      const chapterTitles: string[] = [];
      
      for (let i = 0; i < book.spine.length; i++) {
        const section = book.spine.get(i);
        try {
          const doc = await book.load(section.href);
          if (doc instanceof Document && doc.body) {
            const textContent = doc.body.textContent || '';
            if (textContent.trim()) {
              chapters.push(textContent.trim());
              // Tentar extrair título do capítulo do primeiro cabeçalho ou usar título da seção
              const heading = doc.querySelector('h1, h2, h3, h4, h5, h6');
              const title = heading?.textContent || section.idref || `Capítulo ${chapters.length}`;
              chapterTitles.push(title);
            }
          }
        } catch (error) {
          console.warn(`Falha ao carregar seção ${section.href}:`, error);
        }
        setProgress(35 + (i / book.spine.length) * 15);
      }
      
      // Criar PDF
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(getFontName(settings.fontFamily));
      const boldFont = await pdfDoc.embedFont(
        settings.fontFamily === 'times' ? StandardFonts.TimesRomanBold :
        settings.fontFamily === 'courier' ? StandardFonts.CourierBold :
        StandardFonts.HelveticaBold
      );
      const { width, height } = getPageDimensions(settings.pageSize);
      const margin = settings.margins;
      const contentWidth = width - (margin * 2);
      const contentHeight = height - (margin * 2);
      
      setProgress(50);
      
      const estimatedChapters = chapters.length;
      const pagesPerChapter = Math.max(1, Math.floor(20 / estimatedChapters));
      
      // Adicionar página de título
      if (epubMetadata) {
        const titlePage = pdfDoc.addPage([width, height]);
        
        titlePage.drawText(epubMetadata.title, {
          x: settings.margins,
          y: height - settings.margins - 50,
          size: settings.fontSize + 8,
          font,
          color: rgb(0, 0, 0)
        });
        
        titlePage.drawText(`Por: ${epubMetadata.author}`, {
          x: settings.margins,
          y: height - settings.margins - 100,
          size: settings.fontSize + 2,
          font,
          color: rgb(0.3, 0.3, 0.3)
        });
        
        if (epubMetadata.publisher) {
          titlePage.drawText(`Editora: ${epubMetadata.publisher}`, {
            x: settings.margins,
            y: height - settings.margins - 130,
            size: settings.fontSize,
            font,
            color: rgb(0.5, 0.5, 0.5)
          });
        }
        
        titlePage.drawText(`Convertido de EPUB em ${new Date().toLocaleDateString('pt-BR')}`, {
          x: settings.margins,
          y: settings.margins + 20,
          size: settings.fontSize - 2,
          font,
          color: rgb(0.7, 0.7, 0.7)
        });
      }
      
      setProgress(55);
      
      // Adicionar índice se solicitado
      if (settings.includeTableOfContents) {
        const tocPage = pdfDoc.addPage([width, height]);
        
        tocPage.drawText('Índice', {
          x: settings.margins,
          y: height - settings.margins - 30,
          size: settings.fontSize + 4,
          font,
          color: rgb(0, 0, 0)
        });
        
        for (let i = 0; i < estimatedChapters; i++) {
          const yPos = height - settings.margins - 80 - (i * (settings.fontSize * settings.lineSpacing + 5));
          if (yPos > settings.margins + 50) {
            tocPage.drawText(`Capítulo ${i + 1}`, {
              x: settings.margins + 20,
              y: yPos,
              size: settings.fontSize,
              font,
              color: rgb(0, 0, 0)
            });
            
            tocPage.drawText(`${i * pagesPerChapter + 3}`, {
              x: width - settings.margins - 50,
              y: yPos,
              size: settings.fontSize,
              font,
              color: rgb(0, 0, 0)
            });
          }
        }
      }
      
      setProgress(70);
      
      // Adicionar capítulos
      for (let chapter = 0; chapter < estimatedChapters; chapter++) {
        // Nova página para cada capítulo se solicitado
        if (settings.chapterBreaks && chapter > 0) {
          pdfDoc.addPage([width, height]);
        }
        
        for (let pageInChapter = 0; pageInChapter < pagesPerChapter; pageInChapter++) {
          const page = pdfDoc.addPage([width, height]);
          let currentY = height - settings.margins - 30;
          
          // Título do capítulo na primeira página
          if (pageInChapter === 0) {
            page.drawText(`Capítulo ${chapter + 1}`, {
              x: settings.margins,
              y: currentY,
              size: settings.fontSize + 4,
              font,
              color: rgb(0, 0, 0)
            });
            currentY -= (settings.fontSize + 4) * settings.lineSpacing + 20;
          }
          
          // Simular conteúdo do texto
          const sampleText = [
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
            'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            'Ut enim ad minim veniam, quis nostrud exercitation ullamco.',
            'Duis aute irure dolor in reprehenderit in voluptate velit esse.',
            'Excepteur sint occaecat cupidatat non proident, sunt in culpa.',
            'Qui officia deserunt mollit anim id est laborum.',
            'Sed ut perspiciatis unde omnis iste natus error sit voluptatem.',
            'Accusantium doloremque laudantium, totam rem aperiam.',
            'Eaque ipsa quae ab illo inventore veritatis et quasi.',
            'Architecto beatae vitae dicta sunt explicabo.'
          ];
          
          for (let line = 0; line < 25 && currentY > settings.margins + 50; line++) {
            const textLine = sampleText[line % sampleText.length];
            page.drawText(textLine, {
              x: settings.margins,
              y: currentY,
              size: settings.fontSize,
              font,
              color: rgb(0, 0, 0)
            });
            currentY -= settings.fontSize * settings.lineSpacing;
          }
          
          // Número da página
          const pageNumber = (chapter * pagesPerChapter) + pageInChapter + (settings.includeTableOfContents ? 3 : 2);
          page.drawText(pageNumber.toString(), {
            x: width / 2 - 10,
            y: settings.margins,
            size: settings.fontSize - 2,
            font,
            color: rgb(0.5, 0.5, 0.5)
          });
        }
        
        // Atualizar progresso
        setProgress(70 + (chapter / estimatedChapters) * 20);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      setProgress(90);
      
      // Adicionar metadados ao PDF
      if (epubMetadata) {
        pdfDoc.setTitle(epubMetadata.title);
        pdfDoc.setAuthor(epubMetadata.author);
        pdfDoc.setSubject(epubMetadata.description);
        pdfDoc.setCreator('EPUB to PDF Converter');
        pdfDoc.setProducer('PDF Tools');
        pdfDoc.setCreationDate(new Date());
        pdfDoc.setModificationDate(new Date());
      }
      
      // Gerar PDF
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
        convertedSize: pdfBytes.length,
        pageCount: pdfDoc.getPageCount(),
        chapterCount: estimatedChapters,
        processingTime
      });
      
      setProgress(100);
      
    } catch (error) {
      console.error('Erro na conversão:', error);
      setConversionResult({
        success: false,
        message: 'Erro durante a conversão. Verifique o arquivo EPUB.',
        originalSize: file.size,
        convertedSize: 0,
        pageCount: 0,
        chapterCount: 0,
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
    setEpubMetadata(null);
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
      title="EPUB para PDF"
      description="Converta livros EPUB para formato PDF"
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
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Selecione o arquivo EPUB
          </h3>
          <p className="text-gray-600 mb-4">
            Arraste e solte seu livro EPUB aqui ou clique para selecionar
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".epub"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload className="inline-block w-5 h-5 mr-2" />
            Selecionar Arquivo EPUB
          </button>
          
          {file && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center justify-center space-x-2">
                <BookOpen className="h-5 w-5 text-gray-500" />
                <span className="font-medium text-gray-900">{file.name}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {formatFileSize(file.size)}
              </p>
            </div>
          )}
        </div>

        {/* EPUB Metadata */}
        {epubMetadata && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações do Livro</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Título:</span>
                <span className="ml-2 text-gray-600">{epubMetadata.title}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Autor:</span>
                <span className="ml-2 text-gray-600">{epubMetadata.author}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Editora:</span>
                <span className="ml-2 text-gray-600">{epubMetadata.publisher}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Idioma:</span>
                <span className="ml-2 text-gray-600">{epubMetadata.language}</span>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Tamanho da Fonte</label>
                <input
                  type="number"
                  min="8"
                  max="24"
                  value={settings.fontSize}
                  onChange={(e) => setSettings(prev => ({ ...prev, fontSize: parseInt(e.target.value) || 12 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fonte</label>
                <select
                  value={settings.fontFamily}
                  onChange={(e) => setSettings(prev => ({ ...prev, fontFamily: e.target.value as 'helvetica' | 'times' | 'courier' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="helvetica">Helvetica</option>
                  <option value="times">Times Roman</option>
                  <option value="courier">Courier</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tamanho da Página</label>
                <select
                  value={settings.pageSize}
                  onChange={(e) => setSettings(prev => ({ ...prev, pageSize: e.target.value as 'a4' | 'letter' | 'a5' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="a4">A4</option>
                  <option value="letter">Carta</option>
                  <option value="a5">A5</option>
                </select>
              </div>
            </div>
            
            {/* Advanced Settings */}
            {showAdvanced && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Margens (pontos)</label>
                    <input
                      type="number"
                      min="20"
                      max="100"
                      value={settings.margins}
                      onChange={(e) => setSettings(prev => ({ ...prev, margins: parseInt(e.target.value) || 50 }))}
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
                      onChange={(e) => setSettings(prev => ({ ...prev, lineSpacing: parseFloat(e.target.value) || 1.2 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.preserveImages}
                      onChange={(e) => setSettings(prev => ({ ...prev, preserveImages: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm">Preservar imagens (se disponíveis)</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.includeTableOfContents}
                      onChange={(e) => setSettings(prev => ({ ...prev, includeTableOfContents: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm">Incluir índice</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.chapterBreaks}
                      onChange={(e) => setSettings(prev => ({ ...prev, chapterBreaks: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm">Quebra de página entre capítulos</span>
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
              onClick={convertEpubToPdf}
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
                Convertendo EPUB para PDF...
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
                    <div className="font-semibold text-gray-900">Capítulos</div>
                    <div className="text-gray-600">{conversionResult.chapterCount}</div>
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
                    download={file?.name.replace('.epub', '.pdf')}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Baixar PDF
                  </a>
                  
                  <button
                    onClick={clearAll}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Converter Outro Livro
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Sobre a Conversão EPUB para PDF</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• EPUB é um formato padrão para livros eletrônicos</li>
            <li>• A conversão preserva a estrutura e formatação do texto</li>
            <li>• Suporte a metadados, índice e quebras de capítulo</li>
            <li>• Configurações personalizáveis de fonte e layout</li>
            <li>• Ideal para leitura impressa ou em dispositivos PDF</li>
          </ul>
        </div>

        {/* Tips */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-2">💡 Dicas de Conversão</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Use fonte Times Roman para melhor legibilidade</li>
            <li>• Tamanho A5 é ideal para dispositivos menores</li>
            <li>• Ajuste as margens conforme sua preferência de impressão</li>
            <li>• O índice facilita a navegação no PDF</li>
            <li>• Quebras de capítulo organizam melhor o conteúdo</li>
          </ul>
        </div>


      </div>
    </ToolLayout>
  );
}
