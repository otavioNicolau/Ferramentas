'use client';

import { useState, useRef } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { useI18n } from '@/i18n/client';
import { Upload, FileText, Download, Image, Settings, X, Eye } from 'lucide-react';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

interface RenderedPage {
  pageNumber: number;
  canvas: HTMLCanvasElement;
  dataUrl: string;
}

export default function PdfParaImagemPage() {
  const { t } = useI18n();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [renderedPages, setRenderedPages] = useState<RenderedPage[]>([]);
  
  // Configurações
  const [imageFormat, setImageFormat] = useState<'png' | 'jpeg'>('png');
  const [quality, setQuality] = useState(0.9);
  const [scale, setScale] = useState(2); // DPI multiplier
  const [pageRange, setPageRange] = useState('all');
  const [customRange, setCustomRange] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      await getPageCount(file);
      setRenderedPages([]);
    } else {
      alert('Por favor, selecione um arquivo PDF válido.');
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      await getPageCount(file);
      setRenderedPages([]);
    } else {
      alert('Por favor, selecione um arquivo PDF válido.');
    }
  };

  const initializePdfJs = async () => {
    const pdfjsLib = await import('pdfjs-dist');
    
    // Configurar worker apenas uma vez
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
    }
    
    return pdfjsLib;
  };

  const getPageCount = async (file: File): Promise<number> => {
    try {
      const pdfjsLib = await initializePdfJs();
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const count = pdf.numPages;
      setPageCount(count);
      return count;
    } catch (error) {
      console.error('Erro ao carregar PDF:', error);
      alert('Erro ao carregar PDF. Verifique se o arquivo não está corrompido.');
      return 0;
    }
  };

  const parsePageRange = (range: string): number[] => {
    const pages: number[] = [];
    
    if (!range.trim()) return pages;
    
    const parts = range.split(',');
    
    for (const part of parts) {
      const trimmed = part.trim();
      
      if (!trimmed) continue;
      
      if (trimmed.includes('-')) {
        const rangeParts = trimmed.split('-');
        if (rangeParts.length !== 2) continue;
        
        const start = parseInt(rangeParts[0].trim());
        const end = parseInt(rangeParts[1].trim());
        
        if (isNaN(start) || isNaN(end) || start <= 0 || end <= 0 || start > end || start > pageCount || end > pageCount) {
          continue;
        }
        
        for (let i = start; i <= end; i++) {
          pages.push(i);
        }
      } else {
        const pageNum = parseInt(trimmed);
        if (!isNaN(pageNum) && pageNum > 0 && pageNum <= pageCount) {
          pages.push(pageNum);
        }
      }
    }
    
    return [...new Set(pages)].sort((a, b) => a - b);
  };

  const convertToImages = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setProgress(0);
    setCurrentPage(0);
    setRenderedPages([]);

    try {
      const pdfjsLib = await initializePdfJs();
      
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      // Determinar quais páginas converter
      let pagesToConvert: number[] = [];
      
      if (pageRange === 'all') {
        pagesToConvert = Array.from({ length: pageCount }, (_, i) => i + 1);
      } else if (pageRange === 'custom') {
        pagesToConvert = parsePageRange(customRange);
        if (pagesToConvert.length === 0) {
          alert('Intervalo de páginas inválido. Exemplo: 1-3, 5, 7-10');
          return;
        }
      }

      console.log(`Convertendo ${pagesToConvert.length} páginas:`, pagesToConvert);

      const rendered: RenderedPage[] = [];

      for (let i = 0; i < pagesToConvert.length; i++) {
        const pageNum = pagesToConvert[i];
        setCurrentPage(i + 1);
        setProgress(((i + 1) / pagesToConvert.length) * 100);

        try {
          console.log(`Renderizando página ${pageNum}...`);
          
          const page = await pdf.getPage(pageNum);
          
          // Configurar viewport com escala
          const viewport = page.getViewport({ scale });
          
          // Criar canvas
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d')!;
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          // Renderizar página no canvas
          await page.render({
            canvasContext: context,
            viewport: viewport,
            canvas: canvas,
          }).promise;

          // Converter para data URL
          const dataUrl = canvas.toDataURL(
            imageFormat === 'png' ? 'image/png' : 'image/jpeg',
            imageFormat === 'jpeg' ? quality : undefined
          );

          rendered.push({
            pageNumber: pageNum,
            canvas,
            dataUrl
          });

          console.log(`✓ Página ${pageNum} renderizada`);

        } catch (pageError) {
          console.error(`Erro na página ${pageNum}:`, pageError);
          // Continuar com as outras páginas
        }

        // Pequena pausa para não travar a UI
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setRenderedPages(rendered);
      console.log(`✅ Conversão concluída: ${rendered.length} imagens geradas`);

    } catch (error) {
      console.error('Erro ao converter PDF:', error);
      alert('Erro ao converter PDF. Verifique se o arquivo não está corrompido.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setCurrentPage(0);
    }
  };

  const downloadSingleImage = (page: RenderedPage) => {
    const link = document.createElement('a');
    link.download = `pagina_${page.pageNumber}.${imageFormat}`;
    link.href = page.dataUrl;
    link.click();
  };

  const downloadAllImages = async () => {
    if (renderedPages.length === 0) return;

    if (renderedPages.length === 1) {
      downloadSingleImage(renderedPages[0]);
      return;
    }

    try {
      const zip = new JSZip();
      const baseName = selectedFile?.name.replace('.pdf', '') || 'pdf_convertido';

      renderedPages.forEach((page) => {
        // Converter data URL para blob
        const byteCharacters = atob(page.dataUrl.split(',')[1]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        
        const fileName = `${baseName}_pagina_${page.pageNumber}.${imageFormat}`;
        zip.file(fileName, byteArray);
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipFileName = `${baseName}_${renderedPages.length}_imagens.zip`;
      saveAs(zipBlob, zipFileName);

      console.log(`✅ Download do ZIP iniciado: ${zipFileName}`);

    } catch (error) {
      console.error('Erro ao criar ZIP:', error);
      alert('Erro ao criar arquivo ZIP. Tente baixar as imagens individualmente.');
    }
  };

  const clearAll = () => {
    setSelectedFile(null);
    setPageCount(0);
    setRenderedPages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <ToolLayout
      title={t.pdfToImageTitle}
      description={t.pdfToImageDescription}
    >
      <div className="space-y-6">
        {/* Upload Area */}
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
        >
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            Selecione ou arraste um arquivo PDF
          </h3>
          <p className="text-gray-600 mb-4">
            Converta páginas do PDF em imagens de alta qualidade
          </p>
          <div className="flex items-center justify-center gap-3">
            <Upload size={20} className="text-blue-600" />
            <span className="text-blue-600 font-medium">Escolher PDF</span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Informações do arquivo */}
        {selectedFile && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-blue-900">{selectedFile.name}</h4>
                <p className="text-sm text-blue-700">{pageCount} página{pageCount !== 1 ? 's' : ''}</p>
              </div>
              <button
                onClick={clearAll}
                className="text-red-600 hover:text-red-700 p-2"
                title="Remover arquivo"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Configurações */}
        {selectedFile && (
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings size={20} className="text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-800">Configurações de Conversão</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Formato da Imagem
                </label>
                <select 
                  value={imageFormat}
                  onChange={(e) => setImageFormat(e.target.value as 'png' | 'jpeg')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="png">PNG (sem perda)</option>
                  <option value="jpeg">JPEG (menor tamanho)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qualidade/DPI: {scale}x ({scale * 96} DPI)
                </label>
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="0.5"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Maior = melhor qualidade, arquivos maiores
                </div>
              </div>

              {imageFormat === 'jpeg' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Qualidade JPEG: {Math.round(quality * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.3"
                    max="1"
                    step="0.05"
                    value={quality}
                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              )}

              <div className="md:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Páginas a Converter
                </label>
                <select 
                  value={pageRange}
                  onChange={(e) => setPageRange(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Todas as páginas</option>
                  <option value="custom">Intervalo personalizado</option>
                </select>
              </div>

              {pageRange === 'custom' && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Intervalo de páginas (ex: 1-3, 5, 7-10):
                  </label>
                  <input
                    type="text"
                    value={customRange}
                    onChange={(e) => setCustomRange(e.target.value)}
                    placeholder="1-3, 5, 7-10"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Use vírgulas para separar páginas/intervalos
                  </div>
                </div>
              )}
            </div>

            {/* Progress */}
            {isProcessing && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-blue-900">
                    Convertendo página {currentPage} de {pageRange === 'all' ? pageCount : parsePageRange(customRange).length}
                  </span>
                  <span className="text-sm font-bold text-blue-900">
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="text-xs text-blue-800 mt-2 text-center font-medium">
                  Renderizando páginas do PDF em imagens...
                </div>
              </div>
            )}

            {/* Botão de conversão */}
            <div className="text-center mt-6">
              <button
                onClick={convertToImages}
                disabled={isProcessing}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Image size={20} />
                <span className="font-medium">
                  {isProcessing ? 'Convertendo...' : 'Converter para Imagens'}
                </span>
                {isProcessing && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Resultado - Imagens geradas */}
        {renderedPages.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Imagens Geradas ({renderedPages.length})
              </h3>
              <button
                onClick={downloadAllImages}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Download size={16} />
                {renderedPages.length === 1 ? 'Baixar Imagem' : 'Baixar Todas (ZIP)'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {renderedPages.map((page) => (
                <div key={page.pageNumber} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="relative">
                    <img
                      src={page.dataUrl}
                      alt={`Página ${page.pageNumber}`}
                      className="w-full h-48 object-contain bg-gray-50"
                    />
                    <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                      Página {page.pageNumber}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {page.canvas.width} × {page.canvas.height}px
                      </span>
                      <button
                        onClick={() => downloadSingleImage(page)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                      >
                        <Download size={14} />
                        Baixar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Estado vazio */}
        {!selectedFile && (
          <div className="text-center py-8 text-gray-600">
            <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="font-medium text-gray-700">Nenhum PDF selecionado</p>
            <p className="text-sm mt-1 text-gray-500">Selecione um arquivo PDF para começar a conversão</p>
          </div>
        )}

        {/* Informações */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">💡 Dicas de Uso:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• PNG oferece qualidade sem perda, ideal para texto e gráficos</li>
            <li>• JPEG é menor em tamanho, ideal para documentos com muitas imagens</li>
            <li>• Maior DPI = melhor qualidade, mas arquivos maiores</li>
            <li>• Use intervalos personalizados para converter apenas páginas específicas</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}
