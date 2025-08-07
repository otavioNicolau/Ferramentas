'use client';

import { useState, useRef } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Upload, FileText, Download, Scissors, Trash2, Eye, AlertCircle } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

interface SplitResult {
  id: string;
  name: string;
  pages: string;
  size: string;
  blob: Blob;
  pageCount: number;
}

interface PageRange {
  id: string;
  name: string;
  start: number;
  end: number;
}

export default function SplitPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [splitResults, setSplitResults] = useState<SplitResult[]>([]);
  const [splitMode, setSplitMode] = useState<'individual' | 'ranges'>('individual');
  const [pageRanges, setPageRanges] = useState<PageRange[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manipular upload de arquivo
  const handleFileUpload = async (uploadedFile: File) => {
    if (!uploadedFile.type.includes('pdf')) {
      alert('Por favor, selecione um arquivo PDF válido.');
      return;
    }

    setFile(uploadedFile);
    setSplitResults([]);
    setPageRanges([]);

    try {
      // Ler o PDF para obter informações
      const arrayBuffer = await uploadedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pageCount = pdfDoc.getPageCount();
      setTotalPages(pageCount);

      // Adicionar range padrão se estiver no modo ranges
      if (splitMode === 'ranges' && pageCount > 0) {
        setPageRanges([{
          id: Date.now().toString(),
          name: 'Seção 1',
          start: 1,
          end: Math.min(5, pageCount)
        }]);
      }
    } catch (error) {
      console.error('Erro ao ler PDF:', error);
      alert('Erro ao processar o arquivo PDF. Verifique se o arquivo não está corrompido.');
      setFile(null);
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
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  // Adicionar novo range
  const addPageRange = () => {
    const newRange: PageRange = {
      id: Date.now().toString(),
      name: `Seção ${pageRanges.length + 1}`,
      start: 1,
      end: Math.min(5, totalPages)
    };
    setPageRanges([...pageRanges, newRange]);
  };

  // Atualizar range
  const updatePageRange = (id: string, field: keyof PageRange, value: string | number) => {
    setPageRanges(pageRanges.map(range => 
      range.id === id ? { ...range, [field]: value } : range
    ));
  };

  // Remover range
  const removePageRange = (id: string) => {
    setPageRanges(pageRanges.filter(range => range.id !== id));
  };

  // Dividir PDF
  const splitPdf = async () => {
    if (!file) return;

    setIsProcessing(true);
    setSplitResults([]);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const originalPdf = await PDFDocument.load(arrayBuffer);
      const results: SplitResult[] = [];

      if (splitMode === 'individual') {
        // Dividir em páginas individuais
        for (let i = 0; i < totalPages; i++) {
          const newPdf = await PDFDocument.create();
          const [copiedPage] = await newPdf.copyPages(originalPdf, [i]);
          newPdf.addPage(copiedPage);

          const pdfBytes = await newPdf.save();
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          
          results.push({
            id: `page-${i + 1}`,
            name: `Página ${i + 1}`,
            pages: `${i + 1}`,
            size: formatFileSize(blob.size),
            blob,
            pageCount: 1
          });
        }
      } else {
        // Dividir por ranges
        for (const range of pageRanges) {
          if (range.start > 0 && range.end <= totalPages && range.start <= range.end) {
            const newPdf = await PDFDocument.create();
            const pageIndices = [];
            
            for (let i = range.start - 1; i < range.end; i++) {
              pageIndices.push(i);
            }
            
            const copiedPages = await newPdf.copyPages(originalPdf, pageIndices);
            copiedPages.forEach(page => newPdf.addPage(page));

            const pdfBytes = await newPdf.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            
            results.push({
              id: range.id,
              name: range.name,
              pages: range.start === range.end ? `${range.start}` : `${range.start}-${range.end}`,
              size: formatFileSize(blob.size),
              blob,
              pageCount: range.end - range.start + 1
            });
          }
        }
      }

      setSplitResults(results);
    } catch (error) {
      console.error('Erro ao dividir PDF:', error);
      alert('Erro ao dividir o PDF. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Baixar arquivo dividido
  const downloadSplitFile = (result: SplitResult) => {
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file?.name.replace('.pdf', '')}_${result.name.toLowerCase().replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Baixar todos os arquivos
  const downloadAllFiles = () => {
    splitResults.forEach((result, index) => {
      setTimeout(() => {
        downloadSplitFile(result);
      }, index * 500); // Delay para evitar problemas no navegador
    });
  };

  // Visualizar PDF
  const previewPdf = (result: SplitResult) => {
    const url = URL.createObjectURL(result.blob);
    window.open(url, '_blank');
  };

  // Formatar tamanho do arquivo
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Limpar tudo
  const clearAll = () => {
    setFile(null);
    setSplitResults([]);
    setPageRanges([]);
    setTotalPages(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <ToolLayout
      title="Dividir PDF"
      description="Divida documentos PDF em páginas individuais ou seções específicas"
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
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Selecionar Arquivo
            </button>
          </div>
          
          {file && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="text-green-600" size={20} />
                <div>
                  <p className="font-medium text-green-900">{file.name}</p>
                  <p className="text-sm text-green-700">
                    {formatFileSize(file.size)} • {totalPages} páginas
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Configurações de Divisão */}
        {file && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Configurações de Divisão</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modo de Divisão
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="individual"
                      checked={splitMode === 'individual'}
                      onChange={(e) => setSplitMode(e.target.value as 'individual' | 'ranges')}
                      className="mr-2"
                    />
                    <span>Páginas Individuais</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="ranges"
                      checked={splitMode === 'ranges'}
                      onChange={(e) => setSplitMode(e.target.value as 'individual' | 'ranges')}
                      className="mr-2"
                    />
                    <span>Intervalos Personalizados</span>
                  </label>
                </div>
              </div>

              {splitMode === 'individual' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 text-sm">
                    ℹ️ O PDF será dividido em {totalPages} arquivos, um para cada página.
                  </p>
                </div>
              )}

              {splitMode === 'ranges' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-800">Intervalos de Páginas</h4>
                    <button
                      onClick={addPageRange}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
                    >
                      Adicionar Intervalo
                    </button>
                  </div>
                  
                  {pageRanges.map((range) => (
                    <div key={range.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nome da Seção
                          </label>
                          <input
                            type="text"
                            value={range.name}
                            onChange={(e) => updatePageRange(range.id, 'name', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Página Inicial
                          </label>
                          <input
                            type="number"
                            min="1"
                            max={totalPages}
                            value={range.start}
                            onChange={(e) => updatePageRange(range.id, 'start', parseInt(e.target.value) || 1)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Página Final
                          </label>
                          <input
                            type="number"
                            min={range.start}
                            max={totalPages}
                            value={range.end}
                            onChange={(e) => updatePageRange(range.id, 'end', parseInt(e.target.value) || range.start)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                          />
                        </div>
                        <div>
                          <button
                            onClick={() => removePageRange(range.id)}
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                            title="Remover intervalo"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      
                      {(range.start > totalPages || range.end > totalPages || range.start > range.end) && (
                        <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                          <AlertCircle size={16} />
                          <span>Intervalo inválido. Verifique os números das páginas.</span>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {pageRanges.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      <p>Nenhum intervalo definido. Clique em "Adicionar Intervalo" para começar.</p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={splitPdf}
                  disabled={isProcessing || (splitMode === 'ranges' && pageRanges.length === 0)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Processando...
                    </>
                  ) : (
                    <>
                      <Scissors size={20} />
                      Dividir PDF
                    </>
                  )}
                </button>
                
                <button
                  onClick={clearAll}
                  className="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <Trash2 size={20} />
                  Limpar Tudo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Resultados */}
        {splitResults.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Arquivos Gerados ({splitResults.length})
              </h3>
              <button
                onClick={downloadAllFiles}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Download size={16} />
                Baixar Todos
              </button>
            </div>
            
            <div className="space-y-3">
              {splitResults.map((result) => (
                <div key={result.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="text-red-600" size={24} />
                      <div>
                        <h4 className="font-medium text-gray-900">{result.name}</h4>
                        <p className="text-sm text-gray-600">
                          Páginas: {result.pages} • {result.size} • {result.pageCount} página{result.pageCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => previewPdf(result)}
                        className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1"
                        title="Visualizar"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => downloadSplitFile(result)}
                        className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center gap-1"
                        title="Baixar"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Informações */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Como Usar</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Faça upload de um arquivo PDF</li>
            <li>• Escolha entre dividir em páginas individuais ou intervalos personalizados</li>
            <li>• Para intervalos personalizados, defina os ranges de páginas desejados</li>
            <li>• Clique em "Dividir PDF" para processar o arquivo</li>
            <li>• Baixe os arquivos gerados individualmente ou todos de uma vez</li>
          </ul>
        </div>

        {/* Limitações */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Limitações</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Processamento realizado localmente no navegador</li>
            <li>• Arquivos muito grandes podem demorar para processar</li>
            <li>• PDFs protegidos por senha não são suportados</li>
            <li>• Recomendado para arquivos de até 50MB</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}
