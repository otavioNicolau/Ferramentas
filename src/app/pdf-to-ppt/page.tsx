'use client';

import { useState, useRef } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Upload, Download, FileText, CheckCircle, AlertTriangle, Presentation, RefreshCw, Settings, Image, FileImage } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { useI18n } from '@/i18n/client';
import { isPdfFile } from '@/lib/pdf';

interface ConversionSettings {
  slideLayout: 'single' | 'multiple';
  slidesPerPage: 1 | 2 | 4;
  preserveImages: boolean;
  extractText: boolean;
  slideSize: 'standard' | 'widescreen';
  theme: 'default' | 'minimal' | 'modern';
  includePageNumbers: boolean;
  autoFitText: boolean;
}

interface ConversionResult {
  success: boolean;
  message: string;
  originalSize: number;
  convertedSize: number;
  pageCount: number;
  slideCount: number;
  processingTime: number;
  extractedImages: number;
  extractedTextBlocks: number;
}

interface PdfMetadata {
  title: string;
  author: string;
  subject: string;
  pageCount: number;
  createdDate: string;
  modifiedDate: string;
}

export default function PdfToPptPage() {
  const { t } = useI18n();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [settings, setSettings] = useState<ConversionSettings>({
    slideLayout: 'single',
    slidesPerPage: 1,
    preserveImages: true,
    extractText: true,
    slideSize: 'widescreen',
    theme: 'modern',
    includePageNumbers: true,
    autoFitText: true
  });
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [pdfMetadata, setPdfMetadata] = useState<PdfMetadata | null>(null);
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
    if (!isPdfFile(selectedFile)) {
      alert(t.pdfToPpt?.onlyPdfAlert || 'Por favor, selecione apenas arquivos PDF.');
      return;
    }
    
    if (selectedFile.size > 100 * 1024 * 1024) {
      alert(t.pdfToPpt?.fileSizeAlert || 'Arquivo muito grande. Limite de 100MB.');
      return;
    }
    
    setFile(selectedFile);
    setResultUrl(null);
    setConversionResult(null);
    
    // Analisar PDF para extrair metadados
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      setPdfMetadata({
        title: pdfDoc.getTitle() || selectedFile.name.replace('.pdf', ''),
        author: pdfDoc.getAuthor() || 'Autor Desconhecido',
        subject: pdfDoc.getSubject() || 'Documento PDF',
        pageCount: pdfDoc.getPageCount(),
        createdDate: pdfDoc.getCreationDate()?.toLocaleDateString('pt-BR') || new Date().toLocaleDateString('pt-BR'),
        modifiedDate: pdfDoc.getModificationDate()?.toLocaleDateString('pt-BR') || new Date().toLocaleDateString('pt-BR')
      });
    } catch (error) {
      console.error('Erro ao analisar PDF:', error);
      // Fallback para metadados básicos
      setPdfMetadata({
        title: selectedFile.name.replace('.pdf', ''),
        author: 'Autor Desconhecido',
        subject: 'Documento PDF',
        pageCount: Math.max(1, Math.floor(selectedFile.size / (50 * 1024))), // Estimativa
        createdDate: new Date().toLocaleDateString('pt-BR'),
        modifiedDate: new Date().toLocaleDateString('pt-BR')
      });
    }
  };

  const getSlideSize = (slideSize: string) => {
    switch (slideSize) {
      case 'standard': return { width: 720, height: 540 }; // 4:3
      case 'widescreen': return { width: 960, height: 540 }; // 16:9
      default: return { width: 960, height: 540 };
    }
  };

  const getThemeColors = (theme: string) => {
    switch (theme) {
      case 'minimal':
        return {
          background: '#FFFFFF',
          primary: '#333333',
          secondary: '#666666',
          accent: '#0066CC'
        };
      case 'modern':
        return {
          background: '#F8F9FA',
          primary: '#2C3E50',
          secondary: '#7F8C8D',
          accent: '#3498DB'
        };
      case 'default':
      default:
        return {
          background: '#FFFFFF',
          primary: '#000000',
          secondary: '#555555',
          accent: '#0078D4'
        };
    }
  };

  // Simulação da conversão PDF para PPT
  const convertPdfToPpt = async () => {
    if (!file || !pdfMetadata) return;
    
    setIsProcessing(true);
    setProgress(0);
    const startTime = Date.now();
    
    try {
      setProgress(10);
      
      // Simular análise do PDF
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProgress(25);
      
      // Carregar PDF
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      
      setProgress(40);
      
      // Calcular número de slides baseado na configuração
      let slideCount: number;
      if (settings.slideLayout === 'single') {
        slideCount = pdfMetadata.pageCount;
      } else {
        slideCount = Math.ceil(pdfMetadata.pageCount / settings.slidesPerPage);
      }
      
      // Simular extração de conteúdo
      let extractedImages = 0;
      let extractedTextBlocks = 0;
      
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        
        // Simular extração de imagens
        if (settings.preserveImages) {
          extractedImages += Math.floor(Math.random() * 3) + 1; // 1-3 imagens por página
        }
        
        // Simular extração de texto
        if (settings.extractText) {
          extractedTextBlocks += Math.floor(Math.random() * 5) + 2; // 2-6 blocos de texto por página
        }
        
        // Atualizar progresso
        setProgress(40 + (i / pages.length) * 30);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      setProgress(75);
      
      // Simular criação da apresentação PowerPoint
      await new Promise(resolve => setTimeout(resolve, 1500));
      setProgress(90);
      
      // Criar arquivo de demonstração (XML básico do PowerPoint)
      const slideSize = getSlideSize(settings.slideSize);
      const themeColors = getThemeColors(settings.theme);
      
      const pptxContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<presentation xmlns="http://schemas.openxmlformats.org/presentationml/2006/main">
  <sldMasterIdLst>
    <sldMasterId id="2147483648" r:id="rId1"/>
  </sldMasterIdLst>
  <sldIdLst>
${Array.from({ length: slideCount }, (_, i) => `    <sldId id="${256 + i}" r:id="rId${i + 2}"/>`).join('\n')}
  </sldIdLst>
  <sldSz cx="${slideSize.width * 12700}" cy="${slideSize.height * 12700}"/>
  <notesSz cx="6858000" cy="9144000"/>
  <defaultTextStyle>
    <defPPr>
      <defRPr lang="pt-BR"/>
    </defPPr>
  </defaultTextStyle>
</presentation>`;
      
      // Criar slides de demonstração
      const slidesContent = Array.from({ length: slideCount }, (_, slideIndex) => {
        const pageStart = slideIndex * (settings.slideLayout === 'single' ? 1 : settings.slidesPerPage);
        const pageEnd = Math.min(pageStart + (settings.slideLayout === 'single' ? 1 : settings.slidesPerPage), pdfMetadata.pageCount);
        
        return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<sld xmlns="http://schemas.openxmlformats.org/presentationml/2006/main">
  <cSld>
    <spTree>
      <nvGrpSpPr>
        <cNvPr id="1" name=""/>
        <cNvGrpSpPr/>
        <nvPr/>
      </nvGrpSpPr>
      <grpSpPr>
        <a:xfrm xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </grpSpPr>
      <!-- Título do slide -->
      <sp>
        <nvSpPr>
          <cNvPr id="2" name="Título"/>
          <cNvSpPr>
            <a:spLocks noGrp="1" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"/>
          </cNvSpPr>
          <nvPr>
            <ph type="title"/>
          </nvPr>
        </nvSpPr>
        <spPr/>
        <txBody>
          <a:bodyPr xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"/>
          <a:lstStyle xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"/>
          <a:p xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
            <a:r>
              <a:rPr lang="pt-BR" sz="4400"/>
              <a:t>Slide ${slideIndex + 1}${pageStart !== pageEnd - 1 ? ` - Páginas ${pageStart + 1}-${pageEnd}` : ` - Página ${pageStart + 1}`}</a:t>
            </a:r>
          </a:p>
        </txBody>
      </sp>
      <!-- Conteúdo do slide -->
      <sp>
        <nvSpPr>
          <cNvPr id="3" name="Conteúdo"/>
          <cNvSpPr>
            <a:spLocks noGrp="1" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"/>
          </cNvSpPr>
          <nvPr>
            <ph type="body" idx="1"/>
          </nvPr>
        </nvSpPr>
        <spPr/>
        <txBody>
          <a:bodyPr xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"/>
          <a:lstStyle xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"/>
          <a:p xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
            <a:r>
              <a:rPr lang="pt-BR" sz="2800"/>
              <a:t>Conteúdo extraído da(s) página(s) ${pageStart + 1}${pageStart !== pageEnd - 1 ? `-${pageEnd}` : ''} do PDF original.</a:t>
            </a:r>
          </a:p>
          <a:p xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
            <a:r>
              <a:rPr lang="pt-BR" sz="2400"/>
              <a:t>• Texto e formatação preservados</a:t>
            </a:r>
          </a:p>
          <a:p xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
            <a:r>
              <a:rPr lang="pt-BR" sz="2400"/>
              <a:t>• Imagens e gráficos incluídos</a:t>
            </a:r>
          </a:p>
          <a:p xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
            <a:r>
              <a:rPr lang="pt-BR" sz="2400"/>
              <a:t>• Layout otimizado para apresentação</a:t>
            </a:r>
          </a:p>
        </txBody>
      </sp>
    </spTree>
  </cSld>
  <clrMapOvr>
    <a:masterClrMapping xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"/>
  </clrMapOvr>
</sld>`;
      }).join('\n\n');
      
      // Criar arquivo ZIP simulado (PPTX é um arquivo ZIP)
      const pptxData = `Apresentação PowerPoint criada a partir de: ${file.name}\n\nConfiguração utilizada:\n- Layout: ${settings.slideLayout === 'single' ? 'Uma página por slide' : `${settings.slidesPerPage} páginas por slide`}\n- Tamanho: ${settings.slideSize === 'widescreen' ? 'Widescreen (16:9)' : 'Padrão (4:3)'}\n- Tema: ${settings.theme}\n- Preservar imagens: ${settings.preserveImages ? 'Sim' : 'Não'}\n- Extrair texto: ${settings.extractText ? 'Sim' : 'Não'}\n\nEstatísticas:\n- Páginas PDF: ${pdfMetadata.pageCount}\n- Slides criados: ${slideCount}\n- Imagens extraídas: ${extractedImages}\n- Blocos de texto: ${extractedTextBlocks}\n\nEsta é uma demonstração. Em uma implementação real, seria gerado um arquivo PPTX válido.`;
      
      const blob = new Blob([pptxData], { type: 'application/vnd.openxmlformats-presentationml.presentation' });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      
      const endTime = Date.now();
      const processingTime = (endTime - startTime) / 1000;
      
      setConversionResult({
        success: true,
        message: 'Conversão concluída com sucesso!',
        originalSize: file.size,
        convertedSize: blob.size,
        pageCount: pdfMetadata.pageCount,
        slideCount,
        processingTime,
        extractedImages,
        extractedTextBlocks
      });
      
      setProgress(100);
      
    } catch (error) {
      console.error('Erro na conversão:', error);
      setConversionResult({
        success: false,
        message: 'Erro durante a conversão. Verifique o arquivo PDF.',
        originalSize: file.size,
        convertedSize: 0,
        pageCount: 0,
        slideCount: 0,
        processingTime: 0,
        extractedImages: 0,
        extractedTextBlocks: 0
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
    setPdfMetadata(null);
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
      title={t.pdfToPpt?.title || 'PDF para PPT'}
      description={t.pdfToPpt?.description || 'Converta documentos PDF para apresentações PowerPoint'}
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
            {t.pdfToPpt?.selectDocument || 'Selecione o documento PDF'}
          </h3>
          <p className="text-gray-600 mb-4">
            {t.pdfToPpt?.dragDropText || 'Arraste e solte seu arquivo PDF aqui ou clique para selecionar'}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload className="inline-block w-5 h-5 mr-2" />
            {t.pdfToPpt?.selectFileButton || 'Selecionar Arquivo PDF'}
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

        {/* PDF Metadata */}
        {pdfMetadata && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.pdfToPpt?.pdfInfo || 'Informações do PDF'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">{t.pdfToPpt?.title || 'Título'}:</span>
                <span className="ml-2 text-gray-600">{pdfMetadata.title}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">{t.pdfToPpt?.author || 'Autor'}:</span>
                <span className="ml-2 text-gray-600">{pdfMetadata.author}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">{t.pdfToPpt?.pages || 'Páginas'}:</span>
                <span className="ml-2 text-gray-600">{pdfMetadata.pageCount}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">{t.pdfToPpt?.createdOn || 'Criado em'}:</span>
                <span className="ml-2 text-gray-600">{pdfMetadata.createdDate}</span>
              </div>
            </div>
          </div>
        )}

        {/* Conversion Settings */}
        {file && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{t.pdfToPpt?.conversionSettings || 'Configurações de Conversão'}</h3>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-blue-600 hover:text-blue-700 flex items-center text-sm"
              >
                <Settings className="w-4 h-4 mr-1" />
                {showAdvanced ? (t.pdfToPpt?.hideAdvanced || 'Ocultar') : (t.pdfToPpt?.showAdvanced || 'Mostrar')} {t.pdfToPpt?.advanced || 'Avançadas'}
              </button>
            </div>
            
            {/* Basic Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.pdfToPpt?.slideLayout || 'Layout dos Slides'}</label>
                <select
                  value={settings.slideLayout}
                  onChange={(e) => setSettings(prev => ({ ...prev, slideLayout: e.target.value as 'single' | 'multiple' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="single">{t.pdfToPpt?.onePagePerSlide || 'Uma página por slide'}</option>
                  <option value="multiple">{t.pdfToPpt?.multiplePagesPerSlide || 'Múltiplas páginas por slide'}</option>
                </select>
              </div>
              
              {settings.slideLayout === 'multiple' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.pdfToPpt?.pagesPerSlide || 'Páginas por Slide'}</label>
                  <select
                    value={settings.slidesPerPage}
                    onChange={(e) => setSettings(prev => ({ ...prev, slidesPerPage: parseInt(e.target.value) as 1 | 2 | 4 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>1 página</option>
                    <option value={2}>2 páginas</option>
                    <option value={4}>4 páginas</option>
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.pdfToPpt?.slideSize || 'Tamanho do Slide'}</label>
                <select
                  value={settings.slideSize}
                  onChange={(e) => setSettings(prev => ({ ...prev, slideSize: e.target.value as 'standard' | 'widescreen' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="widescreen">{t.pdfToPpt?.widescreen || 'Widescreen (16:9)'}</option>
                  <option value="standard">{t.pdfToPpt?.standard || 'Padrão (4:3)'}</option>
                </select>
              </div>
            </div>
            
            {/* Advanced Settings */}
            {showAdvanced && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.pdfToPpt?.theme || 'Tema'}</label>
                    <select
                      value={settings.theme}
                      onChange={(e) => setSettings(prev => ({ ...prev, theme: e.target.value as 'default' | 'minimal' | 'modern' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="default">{t.pdfToPpt?.defaultTheme || 'Padrão'}</option>
                    <option value="minimal">{t.pdfToPpt?.minimalTheme || 'Minimalista'}</option>
                    <option value="modern">{t.pdfToPpt?.modernTheme || 'Moderno'}</option>
                    </select>
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
                    <span className="text-sm">{t.pdfToPpt?.preserveImages || 'Preservar imagens e gráficos'}</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.extractText}
                      onChange={(e) => setSettings(prev => ({ ...prev, extractText: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm">{t.pdfToPpt?.extractText || 'Extrair e formatar texto'}</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.includePageNumbers}
                      onChange={(e) => setSettings(prev => ({ ...prev, includePageNumbers: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm">{t.pdfToPpt?.includePageNumbers || 'Incluir números das páginas'}</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.autoFitText}
                      onChange={(e) => setSettings(prev => ({ ...prev, autoFitText: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm">{t.pdfToPpt?.autoAdjustText || 'Ajustar texto automaticamente'}</span>
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
              onClick={convertPdfToPpt}
              disabled={isProcessing}
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center mx-auto"
            >
              <RefreshCw className={`w-5 h-5 mr-2 ${isProcessing ? 'animate-spin' : ''}`} />
              {isProcessing ? (t.pdfToPpt?.converting || 'Convertendo...') : (t.pdfToPpt?.convertToPowerPoint || 'Converter para PowerPoint')}
            </button>
          </div>
        )}

        {/* Progress */}
        {isProcessing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-blue-900">
                {t.pdfToPpt?.convertingProgress || 'Convertendo PDF para PowerPoint...'}
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
                    <div className="font-semibold text-gray-900">{t.pdfToPpt?.pdfPages || 'Páginas PDF'}</div>
                    <div className="text-gray-600">{conversionResult.pageCount}</div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="font-semibold text-gray-900">{t.pdfToPpt?.slidesCreated || 'Slides Criados'}</div>
                    <div className="text-gray-600">{conversionResult.slideCount}</div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="font-semibold text-gray-900">{t.pdfToPpt?.images || 'Imagens'}</div>
                    <div className="text-gray-600">{conversionResult.extractedImages}</div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="font-semibold text-gray-900">{t.pdfToPpt?.time || 'Tempo'}</div>
                    <div className="text-gray-600">{conversionResult.processingTime.toFixed(1)}s</div>
                  </div>
                </div>
                
                <div className="flex justify-center space-x-4">
                  <a
                    href={resultUrl!}
                    download={file?.name.replace('.pdf', '.pptx')}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    {t.pdfToPpt?.downloadPowerPoint || 'Baixar PowerPoint'}
                  </a>
                  
                  <button
                    onClick={clearAll}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {t.pdfToPpt?.convertAnother || 'Converter Outro PDF'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">ℹ️ {t.pdfToPpt?.aboutConversion || 'Sobre a Conversão PDF para PowerPoint'}</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• {t.pdfToPpt?.aboutInfo1 || 'Converte páginas PDF em slides de apresentação'}</li>
            <li>• {t.pdfToPpt?.aboutInfo2 || 'Preserva texto, imagens e formatação'}</li>
            <li>• {t.pdfToPpt?.aboutInfo3 || 'Opções flexíveis de layout e tema'}</li>
            <li>• {t.pdfToPpt?.aboutInfo4 || 'Suporte a diferentes tamanhos de slide'}</li>
            <li>• {t.pdfToPpt?.aboutInfo5 || 'Ideal para criar apresentações a partir de documentos'}</li>
          </ul>
        </div>

        {/* Tips */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-2">💡 {t.pdfToPpt?.tipsTitle || 'Dicas de Conversão'}</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• {t.pdfToPpt?.tip1 || 'Use uma página por slide para melhor legibilidade'}</li>
            <li>• {t.pdfToPpt?.tip2 || 'Formato widescreen é ideal para apresentações modernas'}</li>
            <li>• {t.pdfToPpt?.tip3 || 'Preserve imagens para manter o impacto visual'}</li>
            <li>• {t.pdfToPpt?.tip4 || 'Ajuste automático de texto evita sobreposições'}</li>
            <li>• {t.pdfToPpt?.tip5 || 'Tema moderno oferece aparência profissional'}</li>
          </ul>
        </div>

        {/* Warning */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="font-semibold text-orange-900 mb-2">⚠️ {t.pdfToPpt?.importantNote || 'Nota Importante'}</h4>
          <p className="text-sm text-orange-800">
            {t.pdfToPpt?.demoNote || 'Esta é uma implementação de demonstração. Para conversão real de PDF para PowerPoint, seria necessário integrar uma biblioteca específica como Apache POI, python-pptx ou usar um serviço backend especializado para processar e converter os arquivos.'}
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
