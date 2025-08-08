'use client';

import { useState, useRef } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Upload, Download, FileText, RotateCw, RotateCcw, CheckCircle, AlertTriangle, RefreshCw, Eye } from 'lucide-react';
import { PDFDocument, degrees } from 'pdf-lib';

interface PageRotation {
  pageNumber: number;
  rotation: number; // 0, 90, 180, 270
  originalRotation: number;
}

interface RotationPreset {
  name: string;
  description: string;
  action: (pages: PageRotation[]) => PageRotation[];
}

export default function RotatePagesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pageRotations, setPageRotations] = useState<PageRotation[]>([]);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [previewMode, setPreviewMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const rotationPresets: RotationPreset[] = [
    {
      name: 'Rotacionar Todas 90° Horário',
      description: 'Rotaciona todas as páginas 90° no sentido horário',
      action: (pages) => pages.map(p => ({ ...p, rotation: (p.rotation + 90) % 360 }))
    },
    {
      name: 'Rotacionar Todas 90° Anti-horário',
      description: 'Rotaciona todas as páginas 90° no sentido anti-horário',
      action: (pages) => pages.map(p => ({ ...p, rotation: (p.rotation - 90 + 360) % 360 }))
    },
    {
      name: 'Rotacionar Todas 180°',
      description: 'Rotaciona todas as páginas 180°',
      action: (pages) => pages.map(p => ({ ...p, rotation: (p.rotation + 180) % 360 }))
    },
    {
      name: 'Resetar Todas',
      description: 'Remove todas as rotações aplicadas',
      action: (pages) => pages.map(p => ({ ...p, rotation: p.originalRotation }))
    },
    {
      name: 'Rotacionar Páginas Ímpares 90°',
      description: 'Rotaciona apenas páginas ímpares 90° horário',
      action: (pages) => pages.map(p => p.pageNumber % 2 === 1 ? { ...p, rotation: (p.rotation + 90) % 360 } : p)
    },
    {
      name: 'Rotacionar Páginas Pares 90°',
      description: 'Rotaciona apenas páginas pares 90° horário',
      action: (pages) => pages.map(p => p.pageNumber % 2 === 0 ? { ...p, rotation: (p.rotation + 90) % 360 } : p)
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
    setPageRotations([]);
    setResultUrl(null);
    setSelectedPages(new Set());
    
    // Carregar páginas do PDF
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      
      const rotations: PageRotation[] = pages.map((page, index) => {
        const currentRotation = page.getRotation().angle;
        return {
          pageNumber: index + 1,
          rotation: currentRotation,
          originalRotation: currentRotation
        };
      });
      
      setPageRotations(rotations);
    } catch (error) {
      console.error('Erro ao carregar PDF:', error);
      alert('Erro ao carregar o PDF.');
    }
  };

  const rotatePage = (pageNumber: number, direction: 'cw' | 'ccw') => {
    setPageRotations(prev => prev.map(p => {
      if (p.pageNumber === pageNumber) {
        const increment = direction === 'cw' ? 90 : -90;
        return { ...p, rotation: (p.rotation + increment + 360) % 360 };
      }
      return p;
    }));
  };

  const rotateSelectedPages = (direction: 'cw' | 'ccw') => {
    if (selectedPages.size === 0) {
      alert('Selecione pelo menos uma página para rotacionar.');
      return;
    }
    
    setPageRotations(prev => prev.map(p => {
      if (selectedPages.has(p.pageNumber)) {
        const increment = direction === 'cw' ? 90 : -90;
        return { ...p, rotation: (p.rotation + increment + 360) % 360 };
      }
      return p;
    }));
  };

  const applyPreset = (preset: RotationPreset) => {
    setPageRotations(prev => preset.action(prev));
  };

  const togglePageSelection = (pageNumber: number) => {
    setSelectedPages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pageNumber)) {
        newSet.delete(pageNumber);
      } else {
        newSet.add(pageNumber);
      }
      return newSet;
    });
  };

  const selectAllPages = () => {
    setSelectedPages(new Set(pageRotations.map(p => p.pageNumber)));
  };

  const deselectAllPages = () => {
    setSelectedPages(new Set());
  };

  const processRotations = async () => {
    if (!file || pageRotations.length === 0) return;
    
    setIsProcessing(true);
    setProgress(0);
    
    try {
      setProgress(20);
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      
      setProgress(40);
      
      // Aplicar rotações
      pageRotations.forEach((pageRotation, index) => {
        if (index < pages.length) {
          const page = pages[index];
          const targetRotation = pageRotation.rotation;
          const currentRotation = page.getRotation().angle;
          const rotationDiff = (targetRotation - currentRotation + 360) % 360;
          
          if (rotationDiff !== 0) {
            page.setRotation(degrees(targetRotation));
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
      console.error('Erro ao processar rotações:', error);
      alert('Erro ao processar as rotações.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const clearAll = () => {
    setFile(null);
    setPageRotations([]);
    setResultUrl(null);
    setSelectedPages(new Set());
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

  const getRotationIcon = (rotation: number) => {
    switch (rotation) {
      case 90: return '↻';
      case 180: return '↕';
      case 270: return '↺';
      default: return '↑';
    }
  };

  const hasChanges = () => {
    return pageRotations.some(p => p.rotation !== p.originalRotation);
  };

  return (
    <ToolLayout
      title="Rotacionar Páginas"
      description="Rotacione páginas específicas do seu PDF"
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
          <RefreshCw className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Selecione o PDF para Rotacionar Páginas
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
                {formatFileSize(file.size)} • {pageRotations.length} páginas
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {pageRotations.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
            
            {/* Selection Controls */}
            <div className="mb-4 flex flex-wrap gap-2">
              <button
                onClick={selectAllPages}
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200 transition-colors"
              >
                Selecionar Todas
              </button>
              <button
                onClick={deselectAllPages}
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200 transition-colors"
              >
                Desmarcar Todas
              </button>
              <span className="text-sm text-gray-500 self-center">
                {selectedPages.size} de {pageRotations.length} páginas selecionadas
              </span>
            </div>
            
            {/* Rotation Controls for Selected */}
            <div className="mb-4 flex flex-wrap gap-2">
              <button
                onClick={() => rotateSelectedPages('cw')}
                disabled={selectedPages.size === 0}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center"
              >
                <RotateCw className="w-4 h-4 mr-2" />
                Rotacionar Selecionadas 90° ↻
              </button>
              <button
                onClick={() => rotateSelectedPages('ccw')}
                disabled={selectedPages.size === 0}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Rotacionar Selecionadas 90° ↺
              </button>
            </div>
            
            {/* Presets */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {rotationPresets.map((preset, index) => (
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
        )}

        {/* Pages Grid */}
        {pageRotations.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Páginas do PDF</h3>
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200 transition-colors flex items-center"
              >
                <Eye className="w-4 h-4 mr-1" />
                {previewMode ? 'Lista' : 'Visualização'}
              </button>
            </div>
            
            <div className={`grid gap-4 ${
              previewMode 
                ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'
                : 'grid-cols-1'
            }`}>
              {pageRotations.map((pageRotation) => (
                <div
                  key={pageRotation.pageNumber}
                  className={`border rounded-lg p-4 transition-all cursor-pointer ${
                    selectedPages.has(pageRotation.pageNumber)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => togglePageSelection(pageRotation.pageNumber)}
                >
                  {previewMode ? (
                    <div className="text-center">
                      <div className="w-16 h-20 bg-gray-100 border rounded mx-auto mb-2 flex items-center justify-center text-2xl">
                        {getRotationIcon(pageRotation.rotation)}
                      </div>
                      <div className="text-sm font-medium">Página {pageRotation.pageNumber}</div>
                      <div className="text-xs text-gray-500">{pageRotation.rotation}°</div>
                      <div className="mt-2 flex justify-center space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            rotatePage(pageRotation.pageNumber, 'ccw');
                          }}
                          className="bg-blue-600 text-white p-1 rounded hover:bg-blue-700 transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            rotatePage(pageRotation.pageNumber, 'cw');
                          }}
                          className="bg-blue-600 text-white p-1 rounded hover:bg-blue-700 transition-colors"
                        >
                          <RotateCw className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-10 bg-gray-100 border rounded flex items-center justify-center text-lg">
                          {getRotationIcon(pageRotation.rotation)}
                        </div>
                        <div>
                          <div className="font-medium">Página {pageRotation.pageNumber}</div>
                          <div className="text-sm text-gray-500">
                            Rotação: {pageRotation.rotation}°
                            {pageRotation.rotation !== pageRotation.originalRotation && (
                              <span className="text-blue-600 ml-1">(modificada)</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            rotatePage(pageRotation.pageNumber, 'ccw');
                          }}
                          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            rotatePage(pageRotation.pageNumber, 'cw');
                          }}
                          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors"
                        >
                          <RotateCw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Process Button */}
        {pageRotations.length > 0 && hasChanges() && (
          <div className="text-center">
            <button
              onClick={processRotations}
              disabled={isProcessing}
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center mx-auto"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              {isProcessing ? 'Aplicando Rotações...' : 'Aplicar Rotações'}
            </button>
          </div>
        )}

        {/* Progress */}
        {isProcessing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-blue-900">
                Aplicando rotações...
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
              <h3 className="text-xl font-bold text-green-900">PDF Processado com Sucesso!</h3>
            </div>
            
            <div className="flex justify-center space-x-4">
              <a
                href={resultUrl}
                download={file?.name.replace('.pdf', '_rotacionado.pdf')}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center"
              >
                <Download className="w-5 h-5 mr-2" />
                Baixar PDF Rotacionado
              </a>
              
              <button
                onClick={clearAll}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Processar Outro PDF
              </button>
            </div>
          </div>
        )}

        {/* Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Sobre a Rotação de Páginas</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Rotacione páginas individuais ou em lote</li>
            <li>• Suporte a rotações de 90°, 180° e 270°</li>
            <li>• Visualização em tempo real das rotações</li>
            <li>• Presets para rotações comuns</li>
            <li>• Seleção múltipla de páginas</li>
          </ul>
        </div>

        {/* Tips */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-2">💡 Dicas de Uso</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Use Ctrl+clique para selecionar múltiplas páginas</li>
            <li>• Presets facilitam rotações em lote</li>
            <li>• Visualização mostra a orientação atual</li>
            <li>• Rotações são aplicadas apenas ao salvar</li>
            <li>• Funciona com PDFs de até 100MB</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}
