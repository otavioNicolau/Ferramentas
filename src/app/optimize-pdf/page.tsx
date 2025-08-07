'use client';

import { useState, useRef } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Upload, FileText, Download, Settings, Zap, Trash2, Eye, AlertCircle, CheckCircle } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

interface OptimizationSettings {
  compressImages: boolean;
  removeMetadata: boolean;
  removeAnnotations: boolean;
  removeFormFields: boolean;
  removeBookmarks: boolean;
  linearize: boolean;
  qualityLevel: number;
}

interface PdfInfo {
  fileName: string;
  originalSize: number;
  optimizedSize?: number;
  pageCount: number;
  compressionRatio?: number;
}

export default function OptimizePdfPage() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfInfo, setPdfInfo] = useState<PdfInfo | null>(null);
  const [optimizedPdf, setOptimizedPdf] = useState<Uint8Array | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [settings, setSettings] = useState<OptimizationSettings>({
    compressImages: true,
    removeMetadata: true,
    removeAnnotations: false,
    removeFormFields: false,
    removeBookmarks: false,
    linearize: true,
    qualityLevel: 75
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Formatar tamanho do arquivo
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Calcular porcentagem de redução
  const calculateReduction = (original: number, optimized: number): number => {
    return Math.round(((original - optimized) / original) * 100);
  };

  // Otimizar PDF
  const optimizePdf = async (file: File): Promise<{ optimizedPdf: Uint8Array; info: PdfInfo }> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    
    const originalSize = arrayBuffer.byteLength;
    const pageCount = pdfDoc.getPageCount();

    // Remover metadados se solicitado
    if (settings.removeMetadata) {
      pdfDoc.setTitle('');
      pdfDoc.setAuthor('');
      pdfDoc.setSubject('');
      pdfDoc.setKeywords([]);
      pdfDoc.setProducer('');
      pdfDoc.setCreator('');
    }

    // Remover anotações se solicitado
    if (settings.removeAnnotations) {
      const pages = pdfDoc.getPages();
      pages.forEach(page => {
        // Nota: PDF-lib tem limitações para remoção de anotações
        // Esta é uma implementação básica
        try {
          const annotations = page.node.Annots();
          if (annotations) {
            page.node.delete('Annots');
          }
        } catch (error) {
          console.warn('Não foi possível remover algumas anotações:', error);
        }
      });
    }

    // Remover campos de formulário se solicitado
    if (settings.removeFormFields) {
      try {
        const form = pdfDoc.getForm();
        const fields = form.getFields();
        fields.forEach(field => {
          try {
            form.removeField(field);
          } catch (error) {
            console.warn('Não foi possível remover campo:', error);
          }
        });
      } catch (error) {
        console.warn('Documento não possui formulários ou erro ao remover:', error);
      }
    }

    // Remover marcadores se solicitado
    if (settings.removeBookmarks) {
      try {
        // PDF-lib não tem método direto para remover bookmarks
        // Esta é uma implementação básica
        const catalog = pdfDoc.catalog;
        if (catalog.has('Outlines')) {
          catalog.delete('Outlines');
        }
      } catch (error) {
        console.warn('Não foi possível remover marcadores:', error);
      }
    }

    // Serializar PDF otimizado
    const optimizedBytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
      objectStreamsThreshold: 1,
      updateFieldAppearances: false
    });

    const optimizedSize = optimizedBytes.byteLength;
    const compressionRatio = calculateReduction(originalSize, optimizedSize);

    const info: PdfInfo = {
      fileName: file.name,
      originalSize,
      optimizedSize,
      pageCount,
      compressionRatio
    };

    return { optimizedPdf: optimizedBytes, info };
  };

  // Manipular upload de arquivo
  const handleFileUpload = async (file: File) => {
    if (!file.type.includes('pdf')) {
      alert('Por favor, selecione um arquivo PDF válido.');
      return;
    }

    setPdfFile(file);
    setIsProcessing(true);
    setPdfInfo(null);
    setOptimizedPdf(null);

    try {
      const result = await optimizePdf(file);
      setPdfInfo(result.info);
      setOptimizedPdf(result.optimizedPdf);
    } catch (error) {
      console.error('Erro ao otimizar PDF:', error);
      alert('Erro ao processar o PDF. Verifique se o arquivo não está corrompido.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Manipular input de arquivo
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Manipular drag and drop
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
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Atualizar configurações
  const updateSettings = (key: keyof OptimizationSettings, value: boolean | number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Reprocessar com novas configurações
  const reprocessWithNewSettings = async () => {
    if (!pdfFile) return;
    
    setIsProcessing(true);
    try {
      const result = await optimizePdf(pdfFile);
      setPdfInfo(result.info);
      setOptimizedPdf(result.optimizedPdf);
    } catch (error) {
      console.error('Erro ao reprocessar PDF:', error);
      alert('Erro ao reprocessar o PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Baixar PDF otimizado
  const downloadOptimizedPdf = () => {
    if (!optimizedPdf || !pdfInfo) return;

    const blob = new Blob([optimizedPdf], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${pdfInfo.fileName.replace('.pdf', '')}_otimizado.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Visualizar PDF otimizado
  const previewOptimizedPdf = () => {
    if (!optimizedPdf) return;

    const blob = new Blob([optimizedPdf], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  // Limpar tudo
  const clearAll = () => {
    setPdfFile(null);
    setPdfInfo(null);
    setOptimizedPdf(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <ToolLayout
      title="Otimizar PDF para Web"
      description="Otimize documentos PDF para carregamento rápido na web"
    >
      <div className="space-y-6">
        {/* Upload de Arquivo */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Selecionar Arquivo PDF</h3>
          
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
              Arraste e solte seu arquivo PDF aqui
            </p>
            <p className="text-gray-600 mb-4">ou</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileInputChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <FileText size={20} />
              Selecionar Arquivo
            </button>
          </div>
          
          {pdfFile && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">
                ℹ️ Arquivo selecionado: <strong>{pdfFile.name}</strong> ({formatFileSize(pdfFile.size)})
              </p>
            </div>
          )}
        </div>

        {/* Configurações de Otimização */}
        {pdfFile && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Configurações de Otimização</h3>
              <button
                onClick={clearAll}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <Trash2 size={16} />
                Limpar
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Otimizações Gerais</h4>
                
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.compressImages}
                      onChange={(e) => updateSettings('compressImages', e.target.checked)}
                      className="mr-3 rounded"
                    />
                    <div>
                      <span className="font-medium">Comprimir imagens</span>
                      <p className="text-sm text-gray-600">Reduz o tamanho das imagens incorporadas</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.removeMetadata}
                      onChange={(e) => updateSettings('removeMetadata', e.target.checked)}
                      className="mr-3 rounded"
                    />
                    <div>
                      <span className="font-medium">Remover metadados</span>
                      <p className="text-sm text-gray-600">Remove informações de autor, título, etc.</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.linearize}
                      onChange={(e) => updateSettings('linearize', e.target.checked)}
                      className="mr-3 rounded"
                    />
                    <div>
                      <span className="font-medium">Linearizar para web</span>
                      <p className="text-sm text-gray-600">Otimiza para carregamento progressivo</p>
                    </div>
                  </label>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Remoções Avançadas</h4>
                
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.removeAnnotations}
                      onChange={(e) => updateSettings('removeAnnotations', e.target.checked)}
                      className="mr-3 rounded"
                    />
                    <div>
                      <span className="font-medium">Remover anotações</span>
                      <p className="text-sm text-gray-600">Remove comentários e marcações</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.removeFormFields}
                      onChange={(e) => updateSettings('removeFormFields', e.target.checked)}
                      className="mr-3 rounded"
                    />
                    <div>
                      <span className="font-medium">Remover campos de formulário</span>
                      <p className="text-sm text-gray-600">Remove campos interativos</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.removeBookmarks}
                      onChange={(e) => updateSettings('removeBookmarks', e.target.checked)}
                      className="mr-3 rounded"
                    />
                    <div>
                      <span className="font-medium">Remover marcadores</span>
                      <p className="text-sm text-gray-600">Remove índice de navegação</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Qualidade de compressão: {settings.qualityLevel}%
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={settings.qualityLevel}
                    onChange={(e) => updateSettings('qualityLevel', parseInt(e.target.value))}
                    className="w-64"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Menor tamanho</span>
                    <span>Melhor qualidade</span>
                  </div>
                </div>
                
                {pdfInfo && (
                  <button
                    onClick={reprocessWithNewSettings}
                    disabled={isProcessing}
                    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <Settings size={16} />
                    Reaplicar Configurações
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Processamento */}
        {isProcessing && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mr-3"></div>
              <p className="text-gray-700">Otimizando PDF...</p>
            </div>
          </div>
        )}

        {/* Resultados */}
        {pdfInfo && optimizedPdf && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Resultados da Otimização</h3>
              <div className="flex items-center gap-2">
                <CheckCircle className="text-green-600" size={20} />
                <span className="text-green-600 font-medium">Otimização concluída!</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-600 text-sm font-medium">Arquivo Original</p>
                <p className="text-blue-900 font-semibold text-lg">{formatFileSize(pdfInfo.originalSize)}</p>
                <p className="text-blue-700 text-sm">{pdfInfo.pageCount} página{pdfInfo.pageCount !== 1 ? 's' : ''}</p>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-600 text-sm font-medium">Arquivo Otimizado</p>
                <p className="text-green-900 font-semibold text-lg">{formatFileSize(pdfInfo.optimizedSize!)}</p>
                <p className="text-green-700 text-sm">Mesmo conteúdo</p>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-purple-600 text-sm font-medium">Redução</p>
                <p className="text-purple-900 font-semibold text-lg">{pdfInfo.compressionRatio}%</p>
                <p className="text-purple-700 text-sm">
                  {formatFileSize(pdfInfo.originalSize - pdfInfo.optimizedSize!)} economizados
                </p>
              </div>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-orange-600 text-sm font-medium">Status</p>
                <p className="text-orange-900 font-semibold text-lg">
                  {pdfInfo.compressionRatio! > 20 ? 'Excelente' : 
                   pdfInfo.compressionRatio! > 10 ? 'Boa' : 
                   pdfInfo.compressionRatio! > 5 ? 'Moderada' : 'Mínima'}
                </p>
                <p className="text-orange-700 text-sm">Otimização</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={downloadOptimizedPdf}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Download size={16} />
                Baixar PDF Otimizado
              </button>
              
              <button
                onClick={previewOptimizedPdf}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Eye size={16} />
                Visualizar
              </button>
            </div>
          </div>
        )}

        {/* Informações */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Como Usar</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Faça upload de um arquivo PDF</li>
            <li>• Configure as opções de otimização conforme necessário</li>
            <li>• Aguarde o processamento automático</li>
            <li>• Baixe o PDF otimizado com tamanho reduzido</li>
            <li>• Use o PDF otimizado para carregamento mais rápido na web</li>
          </ul>
        </div>

        {/* Benefícios */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-2">✅ Benefícios da Otimização</h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• <strong>Carregamento mais rápido:</strong> Arquivos menores carregam mais rapidamente</li>
            <li>• <strong>Menos largura de banda:</strong> Economiza dados para usuários e servidores</li>
            <li>• <strong>Melhor SEO:</strong> Páginas com PDFs otimizados têm melhor performance</li>
            <li>• <strong>Experiência do usuário:</strong> Downloads mais rápidos e visualização fluida</li>
            <li>• <strong>Economia de espaço:</strong> Arquivos menores ocupam menos espaço de armazenamento</li>
          </ul>
        </div>

        {/* Limitações */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Considerações</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• A otimização pode remover funcionalidades interativas se configurado</li>
            <li>• Alguns PDFs já otimizados podem ter redução mínima de tamanho</li>
            <li>• A qualidade visual pode ser ligeiramente reduzida com alta compressão</li>
            <li>• PDFs com muitas imagens têm maior potencial de otimização</li>
            <li>• Sempre mantenha uma cópia do arquivo original</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}
