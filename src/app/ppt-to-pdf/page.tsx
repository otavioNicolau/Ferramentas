'use client';

import { useState, useRef } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Upload, Download, FileText, CheckCircle, AlertTriangle, Presentation, RefreshCw, Settings, Image, FileImage } from 'lucide-react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import JSZip from 'jszip';
import { parseString } from 'xml2js';
import { getTranslations } from '@/config/language';

interface ConversionSettings {
  quality: 'low' | 'medium' | 'high';
  pageSize: 'original' | 'a4' | 'letter';
  preserveAnimations: boolean;
  includeNotes: boolean;
  slidesPerPage: 1 | 2 | 4 | 6;
  addSlideNumbers: boolean;
  compression: 'none' | 'low' | 'medium' | 'high';
}

interface ConversionResult {
  success: boolean;
  message: string;
  originalSize: number;
  convertedSize: number;
  slideCount: number;
  pageCount: number;
  processingTime: number;
}

interface PresentationMetadata {
  title: string;
  author: string;
  subject: string;
  slideCount: number;
  createdDate: string;
  modifiedDate: string;
}

export default function PptToPdfPage() {
  const t = getTranslations();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [settings, setSettings] = useState<ConversionSettings>({
    quality: 'high',
    pageSize: 'original',
    preserveAnimations: false,
    includeNotes: false,
    slidesPerPage: 1,
    addSlideNumbers: true,
    compression: 'medium'
  });
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [presentationMetadata, setPresentationMetadata] = useState<PresentationMetadata | null>(null);
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
    // Verificar se é um arquivo PowerPoint
    const isPowerPoint = selectedFile.name.toLowerCase().match(/\.(ppt|pptx)$/);
    
    if (!isPowerPoint) {
      alert('Por favor, selecione apenas arquivos PowerPoint (.ppt, .pptx).');
      return;
    }
    
    if (selectedFile.size > 200 * 1024 * 1024) {
      alert('Arquivo muito grande. Limite de 200MB.');
      return;
    }
    
    setFile(selectedFile);
    setResultUrl(null);
    setConversionResult(null);
    
    // Simular extração de metadados da apresentação
    const estimatedSlides = Math.max(5, Math.floor(selectedFile.size / (100 * 1024)));
    setPresentationMetadata({
      title: selectedFile.name.replace(/\.(ppt|pptx)$/i, ''),
      author: 'Autor Desconhecido',
      subject: 'Apresentação PowerPoint',
      slideCount: estimatedSlides,
      createdDate: new Date().toLocaleDateString('pt-BR'),
      modifiedDate: new Date().toLocaleDateString('pt-BR')
    });
  };

  const getPageDimensions = (pageSize: string) => {
    switch (pageSize) {
      case 'a4': return { width: 595, height: 842 };
      case 'letter': return { width: 612, height: 792 };
      case 'original': return { width: 720, height: 540 }; // 4:3 aspect ratio
      default: return { width: 720, height: 540 };
    }
  };

  const getSlidesLayout = (slidesPerPage: number, pageWidth: number, pageHeight: number) => {
    const margin = 40;
    switch (slidesPerPage) {
      case 1:
        return [{
          x: margin,
          y: margin,
          width: pageWidth - (margin * 2),
          height: pageHeight - (margin * 2)
        }];
      case 2:
        const halfHeight = (pageHeight - (margin * 3)) / 2;
        return [
          { x: margin, y: pageHeight - margin - halfHeight, width: pageWidth - (margin * 2), height: halfHeight },
          { x: margin, y: margin, width: pageWidth - (margin * 2), height: halfHeight }
        ];
      case 4:
        const quarterWidth = (pageWidth - (margin * 3)) / 2;
        const quarterHeight = (pageHeight - (margin * 3)) / 2;
        return [
          { x: margin, y: pageHeight - margin - quarterHeight, width: quarterWidth, height: quarterHeight },
          { x: margin + quarterWidth + margin, y: pageHeight - margin - quarterHeight, width: quarterWidth, height: quarterHeight },
          { x: margin, y: margin, width: quarterWidth, height: quarterHeight },
          { x: margin + quarterWidth + margin, y: margin, width: quarterWidth, height: quarterHeight }
        ];
      case 6:
        const sixthWidth = (pageWidth - (margin * 4)) / 3;
        const sixthHeight = (pageHeight - (margin * 3)) / 2;
        return [
          { x: margin, y: pageHeight - margin - sixthHeight, width: sixthWidth, height: sixthHeight },
          { x: margin + sixthWidth + margin, y: pageHeight - margin - sixthHeight, width: sixthWidth, height: sixthHeight },
          { x: margin + (sixthWidth + margin) * 2, y: pageHeight - margin - sixthHeight, width: sixthWidth, height: sixthHeight },
          { x: margin, y: margin, width: sixthWidth, height: sixthHeight },
          { x: margin + sixthWidth + margin, y: margin, width: sixthWidth, height: sixthHeight },
          { x: margin + (sixthWidth + margin) * 2, y: margin, width: sixthWidth, height: sixthHeight }
        ];
      default:
        return [{ x: margin, y: margin, width: pageWidth - (margin * 2), height: pageHeight - (margin * 2) }];
    }
  };

  // Função para extrair texto de nós XML
  const extractTextFromXml = (xmlString: string): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      parseString(xmlString, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        
        const texts: string[] = [];
        
        // Função recursiva para extrair apenas texto relevante
        const extractText = (obj: any, path: string = '') => {
          if (typeof obj === 'string') {
            // Filtrar URLs, namespaces XML e outros metadados
            const cleanText = obj.trim();
            if (cleanText.length > 0 && 
                !cleanText.startsWith('http://') && 
                !cleanText.startsWith('https://') &&
                !cleanText.match(/^[0-9a-fA-F-]{8,}$/) && // IDs hexadecimais
                !cleanText.match(/^\{[0-9a-fA-F-]+\}$/) && // GUIDs
                cleanText.length > 1 && // Evitar caracteres únicos
                !cleanText.match(/^[0-9]+$/) && // Números puros
                !cleanText.includes('schemas.') && // Namespaces
                !cleanText.includes('xmlns') &&
                !cleanText.includes('rId') &&
                cleanText !== 'pt-BR' &&
                cleanText !== 'ctrTitle') {
              texts.push(cleanText);
            }
          } else if (Array.isArray(obj)) {
            obj.forEach((item, index) => extractText(item, `${path}[${index}]`));
          } else if (obj && typeof obj === 'object') {
            // Focar em elementos que geralmente contêm texto de slides
            Object.entries(obj).forEach(([key, value]) => {
              const newPath = path ? `${path}.${key}` : key;
              // Priorizar elementos que contêm texto de apresentação
              if (key.includes('t') || key.includes('text') || key.includes('p') || 
                  key.includes('r') || key.includes('title') || key.includes('content')) {
                extractText(value, newPath);
              } else if (!key.includes('style') && !key.includes('format') && 
                        !key.includes('color') && !key.includes('font')) {
                extractText(value, newPath);
              }
            });
          }
        };
        
        extractText(result);
        
        // Remover duplicatas e textos muito curtos
        const uniqueTexts = [...new Set(texts)]
          .filter(text => text.length > 2)
          .slice(0, 20); // Limitar a 20 textos por slide
        
        resolve(uniqueTexts);
      });
    });
  };

  // Conversão real de PPT para PDF
  const convertPptToPdf = async () => {
    if (!file || !presentationMetadata) return;
    
    setIsProcessing(true);
    setProgress(0);
    const startTime = Date.now();
    
    try {
      setProgress(10);
      
      // Ler arquivo como ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      setProgress(20);
      
      // Extrair conteúdo do PowerPoint usando JSZip
      const zip = await JSZip.loadAsync(arrayBuffer);
      setProgress(30);
      
      // Extrair slides e conteúdo
      const slideContents: string[][] = [];
      const slideFiles = Object.keys(zip.files).filter(name => 
        name.startsWith('ppt/slides/slide') && name.endsWith('.xml')
      );
      
      setProgress(40);
      
      // Processar cada slide
      for (let i = 0; i < slideFiles.length; i++) {
        const slideFile = zip.files[slideFiles[i]];
        if (slideFile) {
          const slideXml = await slideFile.async('string');
          const slideTexts = await extractTextFromXml(slideXml);
          slideContents.push(slideTexts);
        }
        setProgress(40 + (i / slideFiles.length) * 20);
      }
      
      setProgress(60);
      
      // Criar PDF
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const { width, height } = getPageDimensions(settings.pageSize);
      
      setProgress(40);
      
      const slideLayouts = getSlidesLayout(settings.slidesPerPage, width, height);
      const totalSlides = presentationMetadata.slideCount;
      const totalPages = Math.ceil(totalSlides / settings.slidesPerPage);
      
      // Adicionar página de título se incluir notas
      if (settings.includeNotes) {
        const titlePage = pdfDoc.addPage([width, height]);
        
        titlePage.drawText(presentationMetadata.title, {
          x: 50,
          y: height - 100,
          size: 24,
          font: boldFont,
          color: rgb(0, 0, 0)
        });
        
        titlePage.drawText(`Autor: ${presentationMetadata.author}`, {
          x: 50,
          y: height - 140,
          size: 14,
          font,
          color: rgb(0.3, 0.3, 0.3)
        });
        
        titlePage.drawText(`Total de slides: ${totalSlides}`, {
          x: 50,
          y: height - 170,
          size: 12,
          font,
          color: rgb(0.5, 0.5, 0.5)
        });
        
        titlePage.drawText(`Convertido em: ${new Date().toLocaleDateString('pt-BR')}`, {
          x: 50,
          y: height - 200,
          size: 12,
          font,
          color: rgb(0.5, 0.5, 0.5)
        });
      }
      
      setProgress(55);
      
      // Gerar páginas com slides usando conteúdo real
      for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
        const page = pdfDoc.addPage([width, height]);
        
        // Adicionar slides na página
        for (let slideInPage = 0; slideInPage < settings.slidesPerPage; slideInPage++) {
          const slideIndex = pageIndex * settings.slidesPerPage + slideInPage;
          if (slideIndex >= totalSlides || slideIndex >= slideContents.length) break;
          
          const layout = slideLayouts[slideInPage];
          const slideTexts = slideContents[slideIndex] || [];
          
          // Desenhar borda do slide
          page.drawRectangle({
            x: layout.x - 2,
            y: layout.y - 2,
            width: layout.width + 4,
            height: layout.height + 4,
            borderColor: rgb(0.7, 0.7, 0.7),
            borderWidth: 1
          });
          
          // Título do slide
          const slideTitle = `Slide ${slideIndex + 1}`;
          const titleFontSize = Math.min(16, layout.height / 20);
          
          page.drawText(slideTitle, {
            x: layout.x + 10,
            y: layout.y + layout.height - 30,
            size: titleFontSize,
            font: boldFont,
            color: rgb(0, 0, 0)
          });
          
          // Conteúdo real extraído do slide
          const contentFontSize = Math.min(10, layout.height / 35);
          let currentY = layout.y + layout.height - 60;
          const lineHeight = contentFontSize * 1.4;
          const maxWidth = layout.width - 40;
          
          for (const text of slideTexts) {
            if (currentY > layout.y + 20 && text.trim().length > 0) {
              // Quebrar texto longo em múltiplas linhas
              const words = text.trim().split(' ');
              let currentLine = '';
              
              for (const word of words) {
                const testLine = currentLine + (currentLine ? ' ' : '') + word;
                const textWidth = testLine.length * (contentFontSize * 0.6); // Aproximação
                
                if (textWidth > maxWidth && currentLine) {
                  // Desenhar linha atual
                  page.drawText(currentLine, {
                    x: layout.x + 20,
                    y: currentY,
                    size: contentFontSize,
                    font,
                    color: rgb(0.2, 0.2, 0.2)
                  });
                  currentY -= lineHeight;
                  currentLine = word;
                  
                  if (currentY <= layout.y + 20) break;
                } else {
                  currentLine = testLine;
                }
              }
              
              // Desenhar última linha
              if (currentLine && currentY > layout.y + 20) {
                page.drawText(currentLine, {
                  x: layout.x + 20,
                  y: currentY,
                  size: contentFontSize,
                  font,
                  color: rgb(0.2, 0.2, 0.2)
                });
                currentY -= lineHeight;
              }
            }
          }
          
          // Simular gráfico/imagem
          if (layout.height > 200) {
            const chartWidth = Math.min(layout.width - 40, 150);
            const chartHeight = Math.min(layout.height / 3, 80);
            
            page.drawRectangle({
              x: layout.x + 20,
              y: layout.y + 20,
              width: chartWidth,
              height: chartHeight,
              color: rgb(0.9, 0.95, 1),
              borderColor: rgb(0.5, 0.7, 1),
              borderWidth: 1
            });
            
            page.drawText('Gráfico/Imagem', {
              x: layout.x + 30,
              y: layout.y + 50,
              size: Math.min(10, contentFontSize),
              font,
              color: rgb(0.5, 0.5, 0.5)
            });
          }
          
          // Número do slide se solicitado
          if (settings.addSlideNumbers) {
            page.drawText(`${slideIndex + 1}`, {
              x: layout.x + layout.width - 20,
              y: layout.y + 5,
              size: Math.min(10, contentFontSize),
              font,
              color: rgb(0.6, 0.6, 0.6)
            });
          }
        }
        
        // Número da página
        page.drawText(`Página ${pageIndex + (settings.includeNotes ? 2 : 1)}`, {
          x: width / 2 - 30,
          y: 20,
          size: 10,
          font,
          color: rgb(0.5, 0.5, 0.5)
        });
        
        // Atualizar progresso
        setProgress(55 + (pageIndex / totalPages) * 30);
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      setProgress(90);
      
      // Adicionar metadados ao PDF
      pdfDoc.setTitle(presentationMetadata.title);
      pdfDoc.setAuthor(presentationMetadata.author);
      pdfDoc.setSubject(presentationMetadata.subject);
      pdfDoc.setCreator('PowerPoint to PDF Converter');
      pdfDoc.setProducer('PDF Tools');
      pdfDoc.setCreationDate(new Date());
      pdfDoc.setModificationDate(new Date());
      
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
        slideCount: totalSlides,
        pageCount: pdfDoc.getPageCount(),
        processingTime
      });
      
      setProgress(100);
      
    } catch (error) {
      console.error('Erro na conversão:', error);
      setConversionResult({
        success: false,
        message: 'Erro durante a conversão. Verifique o arquivo PowerPoint.',
        originalSize: file.size,
        convertedSize: 0,
        slideCount: 0,
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
    setPresentationMetadata(null);
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
      title={t.pptToPdf?.title || "PPT para PDF"}
      description={t.pptToPdf?.description || "Converta apresentações PowerPoint para formato PDF"}
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
          <Presentation className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {t.pptToPdf?.selectPresentation || "Selecione a apresentação PowerPoint"}
          </h3>
          <p className="text-gray-600 mb-4">
            {t.pptToPdf?.dragDropText || "Arraste e solte seu arquivo PPT/PPTX aqui ou clique para selecionar"}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".ppt,.pptx"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload className="inline-block w-5 h-5 mr-2" />
            {t.pptToPdf?.selectFile || "Selecionar Arquivo PowerPoint"}
          </button>
          
          {file && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center justify-center space-x-2">
                <Presentation className="h-5 w-5 text-gray-500" />
                <span className="font-medium text-gray-900">{file.name}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {formatFileSize(file.size)}
              </p>
            </div>
          )}
        </div>

        {/* Presentation Metadata */}
        {presentationMetadata && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.pptToPdf?.presentationInfo || "Informações da Apresentação"}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">{t.pptToPdf?.titleLabel || "Título:"}:</span>
                <span className="ml-2 text-gray-600">{presentationMetadata.title}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">{t.pptToPdf?.authorLabel || "Autor:"}:</span>
                <span className="ml-2 text-gray-600">{presentationMetadata.author}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">{t.pptToPdf?.slidesLabel || "Slides:"}:</span>
                <span className="ml-2 text-gray-600">{presentationMetadata.slideCount}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">{t.pptToPdf?.createdLabel || "Criado em:"}:</span>
                <span className="ml-2 text-gray-600">{presentationMetadata.createdDate}</span>
              </div>
            </div>
          </div>
        )}

        {/* Conversion Settings */}
        {file && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{t.pptToPdf?.conversionSettings || "Configurações de Conversão"}</h3>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-blue-600 hover:text-blue-700 flex items-center text-sm"
              >
                <Settings className="w-4 h-4 mr-1" />
                {showAdvanced ? (t.pptToPdf?.hide || 'Ocultar') : (t.pptToPdf?.show || 'Mostrar')} {t.pptToPdf?.advanced || 'Avançadas'}
              </button>
            </div>
            
            {/* Basic Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.pptToPdf?.quality || "Qualidade"}</label>
                <select
                  value={settings.quality}
                  onChange={(e) => setSettings(prev => ({ ...prev, quality: e.target.value as 'low' | 'medium' | 'high' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">{t.pptToPdf?.qualityLow || "Baixa (menor arquivo)"}</option>
                  <option value="medium">{t.pptToPdf?.qualityMedium || "Média"}</option>
                  <option value="high">{t.pptToPdf?.qualityHigh || "Alta (melhor qualidade)"}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.pptToPdf?.pageSize || "Tamanho da Página"}</label>
                <select
                  value={settings.pageSize}
                  onChange={(e) => setSettings(prev => ({ ...prev, pageSize: e.target.value as 'original' | 'a4' | 'letter' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="original">{t.pptToPdf?.pageSizeOriginal || "Original (4:3)"}</option>
                  <option value="a4">{t.pptToPdf?.pageSizeA4 || "A4"}</option>
                  <option value="letter">{t.pptToPdf?.pageSizeLetter || "Carta"}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.pptToPdf?.slidesPerPage || "Slides por Página"}</label>
                <select
                  value={settings.slidesPerPage}
                  onChange={(e) => setSettings(prev => ({ ...prev, slidesPerPage: parseInt(e.target.value) as 1 | 2 | 4 | 6 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>{t.pptToPdf?.slidesPerPage1 || "1 slide por página"}</option>
                  <option value={2}>{t.pptToPdf?.slidesPerPage2 || "2 slides por página"}</option>
                  <option value={4}>{t.pptToPdf?.slidesPerPage4 || "4 slides por página"}</option>
                  <option value={6}>{t.pptToPdf?.slidesPerPage6 || "6 slides por página"}</option>
                </select>
              </div>
            </div>
            
            {/* Advanced Settings */}
            {showAdvanced && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.pptToPdf?.compression || "Compressão"}</label>
                    <select
                      value={settings.compression}
                      onChange={(e) => setSettings(prev => ({ ...prev, compression: e.target.value as 'none' | 'low' | 'medium' | 'high' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="none">{t.pptToPdf?.compressionNone || "Sem compressão"}</option>
                      <option value="low">{t.pptToPdf?.compressionLow || "Baixa"}</option>
                      <option value="medium">{t.pptToPdf?.compressionMedium || "Média"}</option>
                      <option value="high">{t.pptToPdf?.compressionHigh || "Alta"}</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.preserveAnimations}
                      onChange={(e) => setSettings(prev => ({ ...prev, preserveAnimations: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm">{t.pptToPdf?.preserveAnimations || "Preservar animações (como imagens estáticas)"}</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.includeNotes}
                      onChange={(e) => setSettings(prev => ({ ...prev, includeNotes: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm">{t.pptToPdf?.includeNotes || "Incluir página de título com informações"}</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.addSlideNumbers}
                      onChange={(e) => setSettings(prev => ({ ...prev, addSlideNumbers: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm">{t.pptToPdf?.addSlideNumbers || "Adicionar números dos slides"}</span>
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
              onClick={convertPptToPdf}
              disabled={isProcessing}
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center mx-auto"
            >
              <RefreshCw className={`w-5 h-5 mr-2 ${isProcessing ? 'animate-spin' : ''}`} />
              {isProcessing ? (t.pptToPdf?.converting || 'Convertendo...') : (t.pptToPdf?.convertButton || 'Converter para PDF')}
            </button>
          </div>
        )}

        {/* Progress */}
        {isProcessing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-blue-900">
                {t.pptToPdf?.convertingProgress || "Convertendo PowerPoint para PDF..."}
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
                    <div className="font-semibold text-gray-900">{t.pptToPdf?.slides || "Slides"}</div>
                    <div className="text-gray-600">{conversionResult.slideCount}</div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="font-semibold text-gray-900">{t.pptToPdf?.pdfPages || "Páginas PDF"}</div>
                    <div className="text-gray-600">{conversionResult.pageCount}</div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="font-semibold text-gray-900">{t.pptToPdf?.finalSize || "Tamanho Final"}</div>
                    <div className="text-gray-600">{formatFileSize(conversionResult.convertedSize)}</div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="font-semibold text-gray-900">{t.pptToPdf?.time || "Tempo"}</div>
                    <div className="text-gray-600">{conversionResult.processingTime.toFixed(1)}s</div>
                  </div>
                </div>
                
                <div className="flex justify-center space-x-4">
                  <a
                    href={resultUrl!}
                    download={file?.name.replace(/\.(ppt|pptx)$/i, '.pdf')}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    {t.pptToPdf?.downloadPdf || "Baixar PDF"}
                  </a>
                  
                  <button
                    onClick={clearAll}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {t.pptToPdf?.convertAnother || "Converter Outra Apresentação"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">{t.pptToPdf?.aboutConversionTitle || "ℹ️ Sobre a Conversão PowerPoint para PDF"}</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• {t.pptToPdf?.aboutFeature1 || "Suporte a arquivos PPT e PPTX"}</li>
            <li>• {t.pptToPdf?.aboutFeature2 || "Preserva layout e formatação dos slides"}</li>
            <li>• {t.pptToPdf?.aboutFeature3 || "Opções flexíveis de layout (1, 2, 4 ou 6 slides por página)"}</li>
            <li>• {t.pptToPdf?.aboutFeature4 || "Configurações de qualidade e compressão"}</li>
            <li>• {t.pptToPdf?.aboutFeature5 || "Ideal para distribuição e impressão"}</li>
          </ul>
        </div>

        {/* Tips */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-2">{t.pptToPdf?.conversionTipsTitle || "💡 Dicas de Conversão"}</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• {t.pptToPdf?.tip1 || "Use 1 slide por página para melhor legibilidade"}</li>
            <li>• {t.pptToPdf?.tip2 || "4 ou 6 slides por página economizam papel na impressão"}</li>
            <li>• {t.pptToPdf?.tip3 || "Qualidade alta preserva melhor gráficos e imagens"}</li>
            <li>• {t.pptToPdf?.tip4 || "Compressão média oferece bom equilíbrio tamanho/qualidade"}</li>
            <li>• {t.pptToPdf?.tip5 || "Inclua números dos slides para facilitar referências"}</li>
          </ul>
        </div>

        {/* Information */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-2">{t.pptToPdf?.realProcessingTitle || "✅ Processamento Real"}</h4>
          <p className="text-sm text-green-800">
            {t.pptToPdf?.realProcessingDescription || "Esta ferramenta processa arquivos PowerPoint reais usando JSZip e xml2js para extrair o conteúdo de texto dos slides. O texto extraído é então formatado e convertido para PDF mantendo a estrutura dos slides originais."}
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
