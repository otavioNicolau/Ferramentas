'use client';

import { useState, useRef } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Upload, FileText, Download, Merge, Trash2, Eye, ArrowUp, ArrowDown, Plus } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

interface PdfFile {
  id: string;
  file: File;
  name: string;
  size: string;
  pageCount: number;
  order: number;
}

export default function MergePdfPage() {
  const [pdfFiles, setPdfFiles] = useState<PdfFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mergedPdf, setMergedPdf] = useState<Blob | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Formatar tamanho do arquivo
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Adicionar arquivos PDF
  const addPdfFiles = async (files: FileList) => {
    const newFiles: PdfFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!file.type.includes('pdf')) {
        alert(`${file.name} não é um arquivo PDF válido.`);
        continue;
      }

      try {
        // Ler o PDF para obter informações
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pageCount = pdfDoc.getPageCount();

        const pdfFile: PdfFile = {
          id: Date.now().toString() + i,
          file,
          name: file.name,
          size: formatFileSize(file.size),
          pageCount,
          order: pdfFiles.length + newFiles.length
        };

        newFiles.push(pdfFile);
      } catch (error) {
        console.error(`Erro ao processar ${file.name}:`, error);
        alert(`Erro ao processar ${file.name}. Verifique se o arquivo não está corrompido.`);
      }
    }

    setPdfFiles(prev => [...prev, ...newFiles]);
    setMergedPdf(null);
  };

  // Manipular upload de arquivos
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      addPdfFiles(files);
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
    if (files && files.length > 0) {
      addPdfFiles(files);
    }
  };

  // Remover arquivo
  const removePdfFile = (id: string) => {
    setPdfFiles(prev => prev.filter(file => file.id !== id));
    setMergedPdf(null);
  };

  // Mover arquivo para cima
  const moveFileUp = (id: string) => {
    setPdfFiles(prev => {
      const index = prev.findIndex(file => file.id === id);
      if (index > 0) {
        const newFiles = [...prev];
        [newFiles[index], newFiles[index - 1]] = [newFiles[index - 1], newFiles[index]];
        return newFiles.map((file, i) => ({ ...file, order: i }));
      }
      return prev;
    });
    setMergedPdf(null);
  };

  // Mover arquivo para baixo
  const moveFileDown = (id: string) => {
    setPdfFiles(prev => {
      const index = prev.findIndex(file => file.id === id);
      if (index < prev.length - 1) {
        const newFiles = [...prev];
        [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];
        return newFiles.map((file, i) => ({ ...file, order: i }));
      }
      return prev;
    });
    setMergedPdf(null);
  };

  // Combinar PDFs
  const mergePdfs = async () => {
    if (pdfFiles.length < 2) {
      alert('Adicione pelo menos 2 arquivos PDF para combinar.');
      return;
    }

    setIsProcessing(true);
    setMergedPdf(null);

    try {
      const mergedPdfDoc = await PDFDocument.create();

      // Processar arquivos na ordem
      for (const pdfFile of pdfFiles) {
        const arrayBuffer = await pdfFile.file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pageIndices = pdfDoc.getPageIndices();
        
        // Copiar todas as páginas do PDF atual
        const copiedPages = await mergedPdfDoc.copyPages(pdfDoc, pageIndices);
        copiedPages.forEach(page => mergedPdfDoc.addPage(page));
      }

      // Gerar o PDF combinado
      const pdfBytes = await mergedPdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setMergedPdf(blob);

    } catch (error) {
      console.error('Erro ao combinar PDFs:', error);
      alert('Erro ao combinar os PDFs. Verifique se todos os arquivos são válidos.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Baixar PDF combinado
  const downloadMergedPdf = () => {
    if (!mergedPdf) return;

    const url = URL.createObjectURL(mergedPdf);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'documento_combinado.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Visualizar PDF combinado
  const previewMergedPdf = () => {
    if (!mergedPdf) return;

    const url = URL.createObjectURL(mergedPdf);
    window.open(url, '_blank');
  };

  // Limpar tudo
  const clearAll = () => {
    setPdfFiles([]);
    setMergedPdf(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Calcular estatísticas
  const totalPages = pdfFiles.reduce((sum, file) => sum + file.pageCount, 0);
  const totalSize = pdfFiles.reduce((sum, file) => sum + file.file.size, 0);

  return (
    <ToolLayout
      title="Combinar PDF"
      description="Combine múltiplos arquivos PDF em um único documento"
    >
      <div className="space-y-6">
        {/* Upload de Arquivos */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Adicionar Arquivos PDF</h3>
          
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
              Arraste e solte seus arquivos PDF aqui
            </p>
            <p className="text-gray-600 mb-4">ou</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <Plus size={20} />
              Selecionar Arquivos
            </button>
          </div>
          
          {pdfFiles.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">
                ℹ️ {pdfFiles.length} arquivo{pdfFiles.length !== 1 ? 's' : ''} adicionado{pdfFiles.length !== 1 ? 's' : ''} • 
                {totalPages} página{totalPages !== 1 ? 's' : ''} total • {formatFileSize(totalSize)}
              </p>
            </div>
          )}
        </div>

        {/* Lista de Arquivos */}
        {pdfFiles.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Arquivos para Combinar ({pdfFiles.length})
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={mergePdfs}
                  disabled={isProcessing || pdfFiles.length < 2}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Combinando...
                    </>
                  ) : (
                    <>
                      <Merge size={16} />
                      Combinar PDFs
                    </>
                  )}
                </button>
                <button
                  onClick={clearAll}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Limpar Tudo
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              {pdfFiles.map((pdfFile, index) => (
                <div key={pdfFile.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                        #{index + 1}
                      </div>
                      <FileText className="text-red-600" size={24} />
                      <div>
                        <h4 className="font-medium text-gray-900">{pdfFile.name}</h4>
                        <p className="text-sm text-gray-600">
                          {pdfFile.pageCount} página{pdfFile.pageCount !== 1 ? 's' : ''} • {pdfFile.size}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => moveFileUp(pdfFile.id)}
                        disabled={index === 0}
                        className="bg-gray-100 text-gray-600 px-2 py-2 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Mover para cima"
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        onClick={() => moveFileDown(pdfFile.id)}
                        disabled={index === pdfFiles.length - 1}
                        className="bg-gray-100 text-gray-600 px-2 py-2 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Mover para baixo"
                      >
                        <ArrowDown size={16} />
                      </button>
                      <button
                        onClick={() => removePdfFile(pdfFile.id)}
                        className="bg-red-600 text-white px-2 py-2 rounded-md hover:bg-red-700 transition-colors"
                        title="Remover arquivo"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {pdfFiles.length < 2 && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  ⚠️ Adicione pelo menos 2 arquivos PDF para poder combiná-los.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Resultado */}
        {mergedPdf && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">PDF Combinado</h3>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="text-green-600" size={24} />
                  <div>
                    <h4 className="font-medium text-gray-900">documento_combinado.pdf</h4>
                    <p className="text-sm text-gray-600">
                      {totalPages} página{totalPages !== 1 ? 's' : ''} • {formatFileSize(mergedPdf.size)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={previewMergedPdf}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Eye size={16} />
                    Visualizar
                  </button>
                  <button
                    onClick={downloadMergedPdf}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <Download size={16} />
                    Baixar
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">
                ✅ PDF combinado com sucesso! {pdfFiles.length} arquivo{pdfFiles.length !== 1 ? 's' : ''} foram unidos em um único documento.
              </p>
            </div>
          </div>
        )}

        {/* Informações */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Como Usar</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Adicione múltiplos arquivos PDF (mínimo 2)</li>
            <li>• Organize a ordem dos arquivos usando os botões de seta</li>
            <li>• Clique em "Combinar PDFs" para unir todos os documentos</li>
            <li>• Baixe ou visualize o arquivo combinado</li>
            <li>• A ordem dos arquivos na lista será mantida no documento final</li>
          </ul>
        </div>

        {/* Limitações */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Limitações</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Processamento realizado localmente no navegador</li>
            <li>• Arquivos muito grandes podem demorar para processar</li>
            <li>• PDFs protegidos por senha não são suportados</li>
            <li>• Recomendado para arquivos de até 50MB cada</li>
            <li>• Máximo recomendado de 20 arquivos por vez</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}
