'use client';

import { useState, useRef } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Upload, FileImage, Download, X, RotateCw, Move, Settings } from 'lucide-react';
import { saveAs } from 'file-saver';

interface ImageFile {
  file: File;
  preview: string;
  id: string;
}

interface PageSize {
  width: number;
  height: number;
  label: string;
}

const PAGE_SIZES: { [key: string]: PageSize } = {
  'A4': { width: 210, height: 297, label: 'A4 (210 × 297 mm)' },
  'A3': { width: 297, height: 420, label: 'A3 (297 × 420 mm)' },
  'A5': { width: 148, height: 210, label: 'A5 (148 × 210 mm)' },
  'Letter': { width: 216, height: 279, label: 'Letter (8.5 × 11 in)' },
  'Legal': { width: 216, height: 356, label: 'Legal (8.5 × 14 in)' }
};

export default function ImagemParaPdfPage() {
  const [selectedImages, setSelectedImages] = useState<ImageFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pageSize, setPageSize] = useState('A4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [margin, setMargin] = useState(10);
  const [quality, setQuality] = useState(0.85);
  const [fitMode, setFitMode] = useState<'fit' | 'fill' | 'stretch'>('fit');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const processFiles = (files: File[]) => {
    const imageFiles = files.filter(file => 
      file.type.startsWith('image/') && 
      ['image/jpeg', 'image/png', 'image/bmp', 'image/gif', 'image/webp'].includes(file.type)
    );

    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage: ImageFile = {
          file,
          preview: e.target?.result as string,
          id: Math.random().toString(36).substr(2, 9)
        };
        setSelectedImages(prev => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    });

    if (imageFiles.length < files.length) {
      alert('Alguns arquivos foram ignorados. Apenas imagens são aceitas (JPG, PNG, BMP, GIF, WebP).');
    }
  };

  const removeImage = (id: string) => {
    setSelectedImages(prev => prev.filter(img => img.id !== id));
  };

  const moveImage = (id: string, direction: 'up' | 'down') => {
    setSelectedImages(prev => {
      const index = prev.findIndex(img => img.id === id);
      if (index === -1) return prev;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      
      const newArray = [...prev];
      [newArray[index], newArray[newIndex]] = [newArray[newIndex], newArray[index]];
      return newArray;
    });
  };

  const generatePDF = async () => {
    if (selectedImages.length === 0) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const { jsPDF } = await import('jspdf');
      
      const currentPageSize = PAGE_SIZES[pageSize];
      const pageWidth = orientation === 'landscape' ? currentPageSize.height : currentPageSize.width;
      const pageHeight = orientation === 'landscape' ? currentPageSize.width : currentPageSize.height;
      
      const pdf = new jsPDF({
        orientation: orientation === 'landscape' ? 'l' : 'p',
        unit: 'mm',
        format: [pageWidth, pageHeight]
      });

      // Remove a primeira página em branco
      pdf.deletePage(1);

      for (let i = 0; i < selectedImages.length; i++) {
        const imageData = selectedImages[i];
        setProgress(((i + 1) / selectedImages.length) * 100);

        // Adicionar nova página
        pdf.addPage([pageWidth, pageHeight], orientation === 'landscape' ? 'l' : 'p');

        try {
          // Carregar imagem
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = imageData.preview;
          });

          // Calcular dimensões com margem
          const availableWidth = pageWidth - (margin * 2);
          const availableHeight = pageHeight - (margin * 2);
          
          let imgWidth = img.width;
          let imgHeight = img.height;
          
          // Converter pixels para mm (assumindo 96 DPI)
          const pixelToMm = 25.4 / 96;
          imgWidth *= pixelToMm;
          imgHeight *= pixelToMm;

          let finalWidth = imgWidth;
          let finalHeight = imgHeight;
          let x = margin;
          let y = margin;

          if (fitMode === 'fit') {
            // Ajustar mantendo proporção
            const scaleX = availableWidth / imgWidth;
            const scaleY = availableHeight / imgHeight;
            const scale = Math.min(scaleX, scaleY);
            
            finalWidth = imgWidth * scale;
            finalHeight = imgHeight * scale;
            
            // Centralizar
            x = (pageWidth - finalWidth) / 2;
            y = (pageHeight - finalHeight) / 2;
          } else if (fitMode === 'fill') {
            // Preencher toda a área disponível mantendo proporção
            const scaleX = availableWidth / imgWidth;
            const scaleY = availableHeight / imgHeight;
            const scale = Math.max(scaleX, scaleY);
            
            finalWidth = imgWidth * scale;
            finalHeight = imgHeight * scale;
            
            // Centralizar (pode cortar partes da imagem)
            x = (pageWidth - finalWidth) / 2;
            y = (pageHeight - finalHeight) / 2;
          } else if (fitMode === 'stretch') {
            // Esticar para preencher toda a área (pode distorcer)
            finalWidth = availableWidth;
            finalHeight = availableHeight;
          }

          // Adicionar imagem ao PDF
          pdf.addImage(
            imageData.preview,
            'JPEG',
            x,
            y,
            finalWidth,
            finalHeight,
            undefined,
            'FAST'
          );

        } catch (imgError) {
          console.error(`Erro ao processar imagem ${i + 1}:`, imgError);
          // Continuar com as outras imagens
        }

        // Pequena pausa para não travar a UI
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Gerar e fazer download do PDF
      const pdfBlob = pdf.output('blob');
      const fileName = `imagens_convertidas_${selectedImages.length}_paginas.pdf`;
      saveAs(pdfBlob, fileName);

      console.log(`✅ PDF gerado com sucesso: ${fileName}`);

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente com imagens menores ou menos imagens.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const clearAll = () => {
    setSelectedImages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <ToolLayout
      title="Imagem para PDF"
      description="Converta imagens (JPG, PNG, BMP, GIF, WebP) em documentos PDF com qualidade preservada."
    >
      <div className="space-y-6">
        {/* Upload Area */}
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
        >
          <FileImage className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            Selecione ou arraste imagens
          </h3>
          <p className="text-gray-600 mb-4">
            Formatos suportados: JPG, PNG, BMP, GIF, WebP
          </p>
          <div className="flex items-center justify-center gap-3">
            <Upload size={20} className="text-blue-600" />
            <span className="text-blue-600 font-medium">Escolher Imagens</span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Configurações */}
        {selectedImages.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings size={20} className="text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-800">Configurações do PDF</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tamanho da Página
                </label>
                <select 
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {Object.entries(PAGE_SIZES).map(([key, size]) => (
                    <option key={key} value={key}>{size.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Orientação
                </label>
                <select 
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as 'portrait' | 'landscape')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="portrait">Retrato</option>
                  <option value="landscape">Paisagem</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ajuste da Imagem
                </label>
                <select 
                  value={fitMode}
                  onChange={(e) => setFitMode(e.target.value as 'fit' | 'fill' | 'stretch')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="fit">Ajustar (manter proporção)</option>
                  <option value="fill">Preencher (pode cortar)</option>
                  <option value="stretch">Esticar (pode distorcer)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Margem (mm): {margin}
                </label>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={margin}
                  onChange={(e) => setMargin(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qualidade: {Math.round(quality * 100)}%
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
            </div>
          </div>
        )}

        {/* Lista de Imagens */}
        {selectedImages.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Imagens Selecionadas ({selectedImages.length})
              </h3>
              <button
                onClick={clearAll}
                className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
              >
                <X size={16} />
                Limpar Tudo
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
              {selectedImages.map((image, index) => (
                <div key={image.id} className="relative border border-gray-200 rounded-lg overflow-hidden group">
                  <img
                    src={image.preview}
                    alt={`Imagem ${index + 1}`}
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                      <button
                        onClick={() => moveImage(image.id, 'up')}
                        disabled={index === 0}
                        className="bg-blue-600 text-white p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
                      >
                        <RotateCw size={14} className="rotate-[-90deg]" />
                      </button>
                      <button
                        onClick={() => moveImage(image.id, 'down')}
                        disabled={index === selectedImages.length - 1}
                        className="bg-blue-600 text-white p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
                      >
                        <RotateCw size={14} className="rotate-90" />
                      </button>
                      <button
                        onClick={() => removeImage(image.id)}
                        className="bg-red-600 text-white p-1 rounded hover:bg-red-700"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="absolute top-1 left-1 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>

            {/* Progress */}
            {isProcessing && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-blue-900">
                    Gerando PDF...
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
                  Convertendo imagens em PDF...
                </div>
              </div>
            )}

            {/* Botão de conversão */}
            <div className="text-center">
              <button
                onClick={generatePDF}
                disabled={isProcessing || selectedImages.length === 0}
                className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-3 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Download size={20} />
                <span className="font-medium">
                  {isProcessing ? 'Gerando PDF...' : `Gerar PDF (${selectedImages.length} imagens)`}
                </span>
                {isProcessing && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Estado vazio */}
        {selectedImages.length === 0 && (
          <div className="text-center py-8 text-gray-600">
            <FileImage className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="font-medium text-gray-700">Nenhuma imagem selecionada</p>
            <p className="text-sm mt-1 text-gray-500">Selecione imagens para começar a conversão</p>
          </div>
        )}

        {/* Informações */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">💡 Dicas de Uso:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Arraste múltiplas imagens ou selecione várias de uma vez</li>
            <li>• Use os botões para reordenar as imagens antes da conversão</li>
            <li>• Ajuste as configurações para otimizar o resultado</li>
            <li>• Cada imagem será uma página no PDF final</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}
