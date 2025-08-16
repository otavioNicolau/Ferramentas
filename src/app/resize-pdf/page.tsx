'use client';

import { useState, useRef } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Upload, Download, Maximize, Trash2, Eye, AlertCircle, CheckCircle, RotateCw } from 'lucide-react';
import { PDFDocument, PageSizes, degrees } from 'pdf-lib';
import { useI18n } from '@/i18n/client';

interface PageSize {
  name: string;
  width: number;
  height: number;
  description: string;
}

const PAGE_SIZES: PageSize[] = [
  { name: 'A4', width: 595, height: 842, description: '210 × 297 mm' },
  { name: 'A3', width: 842, height: 1191, description: '297 × 420 mm' },
  { name: 'A5', width: 420, height: 595, description: '148 × 210 mm' },
  { name: 'Letter', width: 612, height: 792, description: '8.5 × 11 in' },
  { name: 'Legal', width: 612, height: 1008, description: '8.5 × 14 in' },
  { name: 'Tabloid', width: 792, height: 1224, description: '11 × 17 in' },
  { name: 'A0', width: 2384, height: 3370, description: '841 × 1189 mm' },
  { name: 'A1', width: 1684, height: 2384, description: '594 × 841 mm' },
  { name: 'A2', width: 1191, height: 1684, description: '420 × 594 mm' },
];

interface ResizedPdf {
  fileName: string;
  fileSize: number;
  pageCount: number;
  blob: Blob;
  downloadUrl: string;
  originalSize: { width: number; height: number };
  newSize: { width: number; height: number };
  sizeName: string;
}

export default function ResizePdfPage() {
  const { t } = useI18n();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resizedPdf, setResizedPdf] = useState<ResizedPdf | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedSize, setSelectedSize] = useState('A4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [scaleContent, setScaleContent] = useState(true);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [customWidth, setCustomWidth] = useState('');
  const [customHeight, setCustomHeight] = useState('');
  const [useCustomSize, setUseCustomSize] = useState(false);
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
    if (files && files[0] && files[0].type === 'application/pdf') {
      setFile(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setFile(files[0]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTargetSize = () => {
    if (useCustomSize) {
      const width = parseFloat(customWidth) || 595;
      const height = parseFloat(customHeight) || 842;
      return {
        width: orientation === 'landscape' ? height : width,
        height: orientation === 'landscape' ? width : height,
        name: 'Personalizado'
      };
    }
    
    const pageSize = PAGE_SIZES.find(size => size.name === selectedSize) || PAGE_SIZES[0];
    return {
      width: orientation === 'landscape' ? pageSize.height : pageSize.width,
      height: orientation === 'landscape' ? pageSize.width : pageSize.height,
      name: pageSize.name
    };
  };

  const resizePdf = async () => {
    if (!file) return;

    setIsProcessing(true);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      
      if (pages.length === 0) {
        throw new Error('PDF não contém páginas válidas');
      }
      
      const originalSize = pages[0].getSize();
      const targetSize = getTargetSize();
      
      // Criar novo documento PDF
      const newPdfDoc = await PDFDocument.create();
      
      for (const page of pages) {
        const currentSize = page.getSize();
        
        // Criar nova página com o tamanho desejado
        const newPage = newPdfDoc.addPage([targetSize.width, targetSize.height]);
        
        if (scaleContent) {
          // Calcular escala para ajustar o conteúdo
          let scaleX = targetSize.width / currentSize.width;
          let scaleY = targetSize.height / currentSize.height;
          
          if (maintainAspectRatio) {
            const scale = Math.min(scaleX, scaleY);
            scaleX = scale;
            scaleY = scale;
          }
          
          // Calcular posição para centralizar o conteúdo
          const scaledWidth = currentSize.width * scaleX;
          const scaledHeight = currentSize.height * scaleY;
          const offsetX = (targetSize.width - scaledWidth) / 2;
          const offsetY = (targetSize.height - scaledHeight) / 2;
          
          // Incorporar a página original
          const [embeddedPage] = await newPdfDoc.embedPages([page]);
          
          // Desenhar a página incorporada com escala e posição
          newPage.drawPage(embeddedPage, {
            x: offsetX,
            y: offsetY,
            width: scaledWidth,
            height: scaledHeight,
          });
        } else {
          // Apenas copiar o conteúdo sem escalar
          const [embeddedPage] = await newPdfDoc.embedPages([page]);
          newPage.drawPage(embeddedPage, {
            x: 0,
            y: 0,
            width: Math.min(currentSize.width, targetSize.width),
            height: Math.min(currentSize.height, targetSize.height),
          });
        }
      }
      
      // Salvar o PDF redimensionado
      const resizedPdfBytes = await newPdfDoc.save();
      const blob = new Blob([resizedPdfBytes], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);
      
      setResizedPdf({
        fileName: file.name.replace('.pdf', `_${targetSize.name.toLowerCase()}.pdf`),
        fileSize: blob.size,
        pageCount: pages.length,
        blob,
        downloadUrl,
        originalSize,
        newSize: targetSize,
        sizeName: targetSize.name
      });
    } catch (error: any) {
      console.error('Erro ao redimensionar PDF:', error);
      alert('Erro ao processar o PDF. Verifique se o arquivo não está corrompido.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResizedPdf = () => {
    if (!resizedPdf) return;
    
    const link = document.createElement('a');
    link.href = resizedPdf.downloadUrl;
    link.download = resizedPdf.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearAll = () => {
    setFile(null);
    setResizedPdf(null);
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <ToolLayout
      title={t.resizePdf?.title || 'Change PDF Page Size'}
      description={t.resizePdf?.description || 'Altere o tamanho das páginas de documentos PDF'}
    >
      <div className="space-y-6">
        {/* Upload de Arquivo */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{t.resizePdf?.selectFile || 'Selecionar Arquivo PDF'}</h3>
          
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              {t.resizePdf?.dragDrop || 'Arraste e solte seu arquivo PDF aqui'}
            </p>
            <p className="text-gray-600 mb-4">{t.resizePdf?.or || 'ou'}</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileInputChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              {t.resizePdf?.selectFileButton || 'Selecionar Arquivo'}
            </button>
          </div>
        </div>

        {/* Configurações */}
        {file && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{t.resizePdf?.resizeSettings || 'Configurações de Redimensionamento'}</h3>
              <button
                onClick={clearAll}
                className="text-gray-600 hover:text-gray-800 flex items-center gap-1"
              >
                <Trash2 size={16} />
                {t.resizePdf?.clearButton || 'Limpar'}
              </button>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-6">
              <Maximize className="text-blue-600" size={24} />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-600">{formatFileSize(file.size)}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tamanho da Página */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.resizePdf?.pageSize || 'Tamanho da Página'}
                </label>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="preset-size"
                      checked={!useCustomSize}
                      onChange={() => setUseCustomSize(false)}
                      className="text-blue-600"
                    />
                    <label htmlFor="preset-size" className="text-sm text-gray-700">{t.resizePdf?.standardSize || 'Tamanho padrão'}</label>
                  </div>
                  
                  {!useCustomSize && (
                    <select
                      value={selectedSize}
                      onChange={(e) => setSelectedSize(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {PAGE_SIZES.map((size) => (
                        <option key={size.name} value={size.name}>
                          {size.name} - {size.description}
                        </option>
                      ))}
                    </select>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="custom-size"
                      checked={useCustomSize}
                      onChange={() => setUseCustomSize(true)}
                      className="text-blue-600"
                    />
                    <label htmlFor="custom-size" className="text-sm text-gray-700">{t.resizePdf?.customSize || 'Tamanho personalizado (pontos)'}</label>
                  </div>
                  
                  {useCustomSize && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">{t.resizePdf?.width || 'Largura'}</label>
                        <input
                          type="number"
                          placeholder={t.resizePdf?.width || 'Largura'}
                          value={customWidth}
                          onChange={(e) => setCustomWidth(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">{t.resizePdf?.height || 'Altura'}</label>
                        <input
                          type="number"
                          placeholder={t.resizePdf?.height || 'Altura'}
                          value={customHeight}
                          onChange={(e) => setCustomHeight(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Orientação */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.resizePdf?.orientation || 'Orientação'}
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="portrait"
                      checked={orientation === 'portrait'}
                      onChange={(e) => setOrientation(e.target.value as 'portrait' | 'landscape')}
                      className="text-blue-600"
                    />
                    <span className="text-sm text-gray-700">{t.resizePdf?.portrait || 'Retrato'}</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="landscape"
                      checked={orientation === 'landscape'}
                      onChange={(e) => setOrientation(e.target.value as 'portrait' | 'landscape')}
                      className="text-blue-600"
                    />
                    <RotateCw size={16} className="text-gray-500" />
                    <span className="text-sm text-gray-700">{t.resizePdf?.landscape || 'Paisagem'}</span>
                  </label>
                </div>
              </div>
            </div>
            
            {/* Opções de Escala */}
            <div className="mt-6 space-y-4">
              <h4 className="font-medium text-gray-800">{t.resizePdf?.contentOptions || 'Opções de Conteúdo'}</h4>
              
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={scaleContent}
                    onChange={(e) => setScaleContent(e.target.checked)}
                    className="text-blue-600"
                  />
                  <span className="text-sm text-gray-700">{t.resizePdf?.resizeContent || 'Redimensionar conteúdo para ajustar ao novo tamanho'}</span>
                </label>
                
                {scaleContent && (
                  <label className="flex items-center gap-2 ml-6">
                    <input
                      type="checkbox"
                      checked={maintainAspectRatio}
                      onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                      className="text-blue-600"
                    />
                    <span className="text-sm text-gray-700">{t.resizePdf?.maintainAspectRatio || 'Manter proporção (evitar distorção)'}</span>
                  </label>
                )}
              </div>
            </div>
            
            <button
              onClick={resizePdf}
              disabled={isProcessing}
              className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Maximize size={20} />
              {isProcessing ? (t.resizePdf?.processing || 'Redimensionando...') : (t.resizePdf?.resizeButton || 'Redimensionar PDF')}
            </button>
          </div>
        )}

        {/* Resultado */}
        {resizedPdf && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{t.resizePdf?.resizedPdf || 'PDF Redimensionado'}</h3>
              <button
                onClick={clearAll}
                className="text-gray-600 hover:text-gray-800 flex items-center gap-1"
              >
                <Trash2 size={16} />
                {t.resizePdf?.clearButton || 'Limpar'}
              </button>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="text-green-600" size={20} />
                <span className="font-medium text-green-800">{t.resizePdf?.successMessage || 'PDF redimensionado com sucesso!'}</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span className="text-green-700 font-medium">{t.resizePdf?.fileName || 'Arquivo'}:</span>
                  <p className="text-green-800">{resizedPdf.fileName}</p>
                </div>
                <div>
                  <span className="text-green-700 font-medium">{t.resizePdf?.fileSize || 'Tamanho'}:</span>
                  <p className="text-green-800">{formatFileSize(resizedPdf.fileSize)}</p>
                </div>
                <div>
                  <span className="text-green-700 font-medium">{t.resizePdf?.pages || 'Páginas'}:</span>
                  <p className="text-green-800">{resizedPdf.pageCount}</p>
                </div>
                <div>
                  <span className="text-green-700 font-medium">{t.resizePdf?.newSize || 'Novo tamanho'}:</span>
                  <p className="text-green-800">{resizedPdf.sizeName} ({Math.round(resizedPdf.newSize.width)} × {Math.round(resizedPdf.newSize.height)} pts)</p>
                </div>
              </div>
              
              <div className="text-sm text-green-700">
                <span className="font-medium">{t.resizePdf?.originalSize || 'Tamanho original'}:</span> {Math.round(resizedPdf.originalSize.width)} × {Math.round(resizedPdf.originalSize.height)} pts
              </div>
            </div>
            
            <button
              onClick={downloadResizedPdf}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <Download size={20} />
                {t.resizePdf?.downloadButton || 'Baixar PDF Redimensionado'}
            </button>
          </div>
        )}

        {/* Informações */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">📏 {t.resizePdf?.howItWorksTitle || 'Como funciona'}:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• {t.resizePdf?.howItWorks1 || 'Altera o tamanho das páginas do PDF para o formato desejado'}</li>
            <li>• {t.resizePdf?.howItWorks2 || 'Opção de redimensionar o conteúdo para ajustar ao novo tamanho'}</li>
            <li>• {t.resizePdf?.howItWorks3 || 'Mantém a proporção para evitar distorção do conteúdo'}</li>
            <li>• {t.resizePdf?.howItWorks4 || 'Suporte para tamanhos padrão (A4, A3, Letter, etc.) e personalizados'}</li>
            <li>• {t.resizePdf?.howItWorks5 || 'Processamento realizado localmente no navegador'}</li>
          </ul>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
            <AlertCircle size={16} />
            ⚠️ {t.resizePdf?.importantTitle || 'Importante'}
          </h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• {t.resizePdf?.important1 || 'O redimensionamento pode afetar a qualidade visual do conteúdo'}</li>
            <li>• {t.resizePdf?.important2 || 'Recomendado manter a proporção para evitar distorção'}</li>
            <li>• {t.resizePdf?.important3 || 'Tamanhos personalizados devem ser especificados em pontos (1 ponto = 1/72 polegada)'}</li>
            <li>• {t.resizePdf?.important4 || 'PDFs com elementos complexos podem ter resultados variados'}</li>
            <li>• {t.resizePdf?.important5 || 'Sempre mantenha uma cópia do arquivo original'}</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}
