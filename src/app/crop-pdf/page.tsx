'use client';

import { useState, useRef } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Upload, Download, FileText, Crop, CheckCircle, AlertTriangle, Scissors, Eye, RotateCcw } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

interface CropSettings {
  top: number;
  bottom: number;
  left: number;
  right: number;
  unit: 'mm' | 'inch' | 'pt';
}

interface CropPreset {
  name: string;
  description: string;
  settings: CropSettings;
}

export default function CropPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [cropSettings, setCropSettings] = useState<CropSettings>({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    unit: 'mm'
  });
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [applyToAllPages, setApplyToAllPages] = useState(true);
  const [selectedPages, setSelectedPages] = useState<string>('1');
  const [previewMode, setPreviewMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cropPresets: CropPreset[] = [
    {
      name: 'Margens Pequenas',
      description: 'Remove 5mm de cada lado',
      settings: { top: 5, bottom: 5, left: 5, right: 5, unit: 'mm' }
    },
    {
      name: 'Margens Médias',
      description: 'Remove 10mm de cada lado',
      settings: { top: 10, bottom: 10, left: 10, right: 10, unit: 'mm' }
    },
    {
      name: 'Margens Grandes',
      description: 'Remove 20mm de cada lado',
      settings: { top: 20, bottom: 20, left: 20, right: 20, unit: 'mm' }
    },
    {
      name: 'Remover Cabeçalho',
      description: 'Remove 15mm do topo',
      settings: { top: 15, bottom: 0, left: 0, right: 0, unit: 'mm' }
    },
    {
      name: 'Remover Rodapé',
      description: 'Remove 15mm da base',
      settings: { top: 0, bottom: 15, left: 0, right: 0, unit: 'mm' }
    },
    {
      name: 'Formato A4 para A5',
      description: 'Corte para formato A5',
      settings: { top: 37, bottom: 37, left: 26, right: 26, unit: 'mm' }
    }
  ];

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
    if (selectedFile.type !== 'application/pdf') {
      alert('Por favor, selecione apenas arquivos PDF.');
      return;
    }
    
    if (selectedFile.size > 100 * 1024 * 1024) {
      alert('Arquivo muito grande. Limite de 100MB.');
      return;
    }
    
    setFile(selectedFile);
    setResultUrl(null);
    
    // Carregar informações do PDF
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      setPageCount(pdfDoc.getPageCount());
      setSelectedPages(`1-${pdfDoc.getPageCount()}`);
    } catch (error) {
      console.error('Erro ao carregar PDF:', error);
      alert('Erro ao carregar o PDF.');
    }
  };

  const convertToPoints = (value: number, unit: string): number => {
    switch (unit) {
      case 'mm': return value * 2.834645669;
      case 'inch': return value * 72;
      case 'pt': return value;
      default: return value;
    }
  };

  const applyPreset = (preset: CropPreset) => {
    setCropSettings(preset.settings);
  };

  const resetCropSettings = () => {
    setCropSettings({
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      unit: 'mm'
    });
  };

  const parsePageRange = (range: string, totalPages: number): number[] => {
    const pages: number[] = [];
    const parts = range.split(',');
    
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.includes('-')) {
        const [start, end] = trimmed.split('-').map(n => parseInt(n.trim()));
        for (let i = Math.max(1, start); i <= Math.min(totalPages, end); i++) {
          if (!pages.includes(i)) pages.push(i);
        }
      } else {
        const pageNum = parseInt(trimmed);
        if (pageNum >= 1 && pageNum <= totalPages && !pages.includes(pageNum)) {
          pages.push(pageNum);
        }
      }
    }
    
    return pages.sort((a, b) => a - b);
  };

  const processCrop = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setProgress(0);
    
    try {
      setProgress(20);
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      
      setProgress(40);
      
      // Determinar quais páginas processar
      const pagesToProcess = applyToAllPages 
        ? Array.from({ length: pageCount }, (_, i) => i + 1)
        : parsePageRange(selectedPages, pageCount);
      
      // Converter medidas para pontos
      const cropInPoints = {
        top: convertToPoints(cropSettings.top, cropSettings.unit),
        bottom: convertToPoints(cropSettings.bottom, cropSettings.unit),
        left: convertToPoints(cropSettings.left, cropSettings.unit),
        right: convertToPoints(cropSettings.right, cropSettings.unit)
      };
      
      setProgress(60);
      
      // Aplicar recorte às páginas selecionadas
      pagesToProcess.forEach(pageNum => {
        const pageIndex = pageNum - 1;
        if (pageIndex < pages.length) {
          const page = pages[pageIndex];
          const { width, height } = page.getSize();
          
          // Calcular nova área de recorte
          const newWidth = width - cropInPoints.left - cropInPoints.right;
          const newHeight = height - cropInPoints.top - cropInPoints.bottom;
          
          // Verificar se as dimensões são válidas
          if (newWidth > 0 && newHeight > 0) {
            // Aplicar recorte usando cropBox
            page.setCropBox(
              cropInPoints.left,
              cropInPoints.bottom,
              newWidth,
              newHeight
            );
            
            // Também definir mediaBox para o novo tamanho
            page.setMediaBox(
              0,
              0,
              newWidth,
              newHeight
            );
          }
        }
      });
      
      setProgress(80);
      
      // Gerar PDF resultante
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      
      setProgress(100);
      
    } catch (error) {
      console.error('Erro ao processar recorte:', error);
      alert('Erro ao processar o recorte.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const clearAll = () => {
    setFile(null);
    setResultUrl(null);
    setPageCount(0);
    resetCropSettings();
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

  const hasValidCropSettings = () => {
    return cropSettings.top > 0 || cropSettings.bottom > 0 || 
           cropSettings.left > 0 || cropSettings.right > 0;
  };

  return (
    <ToolLayout
      title="Recortar PDF"
      description="Recorte e ajuste as margens das páginas do seu PDF"
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
          <Crop className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Selecione o PDF para Recortar
          </h3>
          <p className="text-gray-600 mb-4">
            Arraste e solte seu arquivo PDF aqui ou clique para selecionar
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
            Selecionar PDF
          </button>
          
          {file && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center justify-center space-x-2">
                <FileText className="h-5 w-5 text-gray-500" />
                <span className="font-medium text-gray-900">{file.name}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {formatFileSize(file.size)} • {pageCount} páginas
              </p>
            </div>
          )}
        </div>

        {/* Crop Settings */}
        {file && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurações de Recorte</h3>
            
            {/* Unit Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Unidade de Medida</label>
              <div className="flex space-x-4">
                {['mm', 'inch', 'pt'].map(unit => (
                  <label key={unit} className="flex items-center">
                    <input
                      type="radio"
                      value={unit}
                      checked={cropSettings.unit === unit}
                      onChange={(e) => setCropSettings(prev => ({ ...prev, unit: e.target.value as 'mm' | 'inch' | 'pt' }))}
                      className="mr-2"
                    />
                    <span className="text-sm">
                      {unit === 'mm' ? 'Milímetros' : unit === 'inch' ? 'Polegadas' : 'Pontos'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Crop Values */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Topo</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={cropSettings.top}
                  onChange={(e) => setCropSettings(prev => ({ ...prev, top: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Base</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={cropSettings.bottom}
                  onChange={(e) => setCropSettings(prev => ({ ...prev, bottom: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Esquerda</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={cropSettings.left}
                  onChange={(e) => setCropSettings(prev => ({ ...prev, left: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Direita</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={cropSettings.right}
                  onChange={(e) => setCropSettings(prev => ({ ...prev, right: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
            </div>
            
            {/* Reset Button */}
            <div className="mb-6">
              <button
                onClick={resetCropSettings}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition-colors flex items-center"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Resetar Valores
              </button>
            </div>
            
            {/* Presets */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">Presets de Recorte</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {cropPresets.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => applyPreset(preset)}
                    className="bg-gray-50 border border-gray-200 p-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
                  >
                    <div className="font-medium text-gray-900 text-sm">{preset.name}</div>
                    <div className="text-xs text-gray-600 mt-1">{preset.description}</div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Page Selection */}
            <div className="border-t pt-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">Páginas a Processar</h4>
              
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={applyToAllPages}
                    onChange={() => setApplyToAllPages(true)}
                    className="mr-2"
                  />
                  <span>Aplicar a todas as páginas</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={!applyToAllPages}
                    onChange={() => setApplyToAllPages(false)}
                    className="mr-2"
                  />
                  <span>Aplicar a páginas específicas</span>
                </label>
                
                {!applyToAllPages && (
                  <div className="ml-6">
                    <input
                      type="text"
                      value={selectedPages}
                      onChange={(e) => setSelectedPages(e.target.value)}
                      placeholder="Ex: 1,3,5-10"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Use vírgulas para páginas individuais e hífens para intervalos (ex: 1,3,5-10)
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Process Button */}
        {file && hasValidCropSettings() && (
          <div className="text-center">
            <button
              onClick={processCrop}
              disabled={isProcessing}
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center mx-auto"
            >
              <Scissors className="w-5 h-5 mr-2" />
              {isProcessing ? 'Recortando PDF...' : 'Recortar PDF'}
            </button>
          </div>
        )}

        {/* Progress */}
        {isProcessing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-blue-900">
                Recortando páginas...
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
        {resultUrl && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
              <h3 className="text-xl font-bold text-green-900">PDF Recortado com Sucesso!</h3>
            </div>
            
            <div className="flex justify-center space-x-4">
              <a
                href={resultUrl}
                download={file?.name.replace('.pdf', '_recortado.pdf')}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center"
              >
                <Download className="w-5 h-5 mr-2" />
                Baixar PDF Recortado
              </a>
              
              <button
                onClick={clearAll}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Recortar Outro PDF
              </button>
            </div>
          </div>
        )}

        {/* Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Sobre o Recorte de PDF</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Remove margens e áreas desnecessárias das páginas</li>
            <li>• Suporte a diferentes unidades de medida</li>
            <li>• Presets para recortes comuns</li>
            <li>• Aplicação seletiva por páginas</li>
            <li>• Preserva a qualidade do conteúdo</li>
          </ul>
        </div>

        {/* Tips */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-2">💡 Dicas de Uso</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Use presets para recortes padronizados</li>
            <li>• Teste com valores pequenos primeiro</li>
            <li>• Milímetros são mais precisos que polegadas</li>
            <li>• Recorte excessivo pode remover conteúdo importante</li>
            <li>• Funciona com PDFs de até 100MB</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}
