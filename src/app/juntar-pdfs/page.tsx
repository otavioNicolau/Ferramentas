'use client';

import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { getTranslations } from '@/config/language';
import { Upload, Plus, Trash2, FileText, Download, ArrowUp, ArrowDown } from 'lucide-react';
import { saveAs } from 'file-saver';

interface PdfFile {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number;
}

export default function JuntarPdfsPage() {
  const t = getTranslations();
  const [selectedFiles, setSelectedFiles] = useState<PdfFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [currentFile, setCurrentFile] = useState<number>(0);
  const [totalFiles, setTotalFiles] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getPageCount = async (file: File): Promise<number> => {
    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      return pdf.numPages;
    } catch (error) {
      console.error('Erro ao contar páginas:', error);
      return 0;
    }
  };

  const handleFileSelect = async (files: FileList) => {
    const newFiles: PdfFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type === 'application/pdf') {
        const pageCount = await getPageCount(file);
        newFiles.push({
          id: Math.random().toString(36).substr(2, 9),
          file,
          name: file.name,
          size: file.size,
          pageCount
        });
      }
    }
    
    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setSelectedFiles(prev => prev.filter(file => file.id !== id));
  };

  const moveFile = (id: string, direction: 'up' | 'down') => {
    setSelectedFiles(prev => {
      const index = prev.findIndex(file => file.id === id);
      if (index === -1) return prev;
      
      const newFiles = [...prev];
      if (direction === 'up' && index > 0) {
        [newFiles[index], newFiles[index - 1]] = [newFiles[index - 1], newFiles[index]];
      } else if (direction === 'down' && index < newFiles.length - 1) {
        [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];
      }
      
      return newFiles;
    });
  };

  const mergePDFs = async () => {
    if (selectedFiles.length < 2) {
      alert('Selecione pelo menos 2 arquivos PDF para juntar.');
      return;
    }

    setIsProcessing(true);
    setTotalFiles(selectedFiles.length);
    setTotalPages(selectedFiles.reduce((sum, file) => sum + file.pageCount, 0));
    
    try {
      const pdfjsLib = await import('pdfjs-dist');
      const jsPDF = (await import('jspdf')).jsPDF;
      
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';

      console.log(`Iniciando junção de ${selectedFiles.length} arquivos PDF`);

      const mergedPDF = new jsPDF();
      let isFirstPage = true;
      let processedPages = 0;

      for (let fileIndex = 0; fileIndex < selectedFiles.length; fileIndex++) {
        const pdfFile = selectedFiles[fileIndex];
        setCurrentFile(fileIndex + 1);
        
        console.log(`Processando arquivo ${fileIndex + 1}/${selectedFiles.length}: ${pdfFile.name}`);

        const arrayBuffer = await pdfFile.file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        for (let pageIndex = 1; pageIndex <= pdf.numPages; pageIndex++) {
          setCurrentPage(pageIndex);
          processedPages++;
          setProgress((processedPages / totalPages) * 100);
          
          console.log(`Processando página ${pageIndex}/${pdf.numPages} do arquivo ${pdfFile.name}`);
          
          const page = await pdf.getPage(pageIndex);
          const viewport = page.getViewport({ scale: 1.5 });

          // Criar canvas
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          if (!context) {
            throw new Error('Não foi possível criar contexto do canvas');
          }
          
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          // Renderizar página no canvas
          const renderContext = {
            canvasContext: context,
            viewport: viewport,
            canvas: canvas
          };
          await page.render(renderContext).promise;

          // Converter canvas para imagem
          const imgData = canvas.toDataURL('image/jpeg', 0.9);

          // Calcular dimensões para o PDF
          const pdfWidth = 210; // A4 width em mm
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

          if (!isFirstPage) {
            mergedPDF.addPage();
          }
          isFirstPage = false;

          // Adicionar imagem ao PDF
          mergedPDF.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        }
      }

      // Gerar PDF final
      const mergedPdfBlob = mergedPDF.output('blob');
      
      // Download
      const fileName = `merged_${selectedFiles.length}_files_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.pdf`;
      saveAs(mergedPdfBlob, fileName);

      console.log(`Junção concluída: ${selectedFiles.length} arquivos unidos em ${fileName}`);
      
      // Reset progress
      setProgress(100);
      setTimeout(() => {
        setProgress(0);
        setCurrentFile(0);
        setCurrentPage(0);
        setTotalFiles(0);
        setTotalPages(0);
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao juntar PDFs:', error);
      alert('Erro ao juntar os PDFs. Verifique se todos os arquivos são válidos.');
    } finally {
      setIsProcessing(false);
    }
  };

  const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);
  const totalPagesCount = selectedFiles.reduce((sum, file) => sum + file.pageCount, 0);

  return (
    <ToolLayout
      title={t.mergePdfsTitle}
      description={t.mergePdfsDescription}
    >
      <div className="space-y-6">
        {/* Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Selecione múltiplos arquivos PDF
          </h3>
          <p className="text-gray-600 mb-4">
            Você pode selecionar vários arquivos de uma vez
          </p>
          <input
            type="file"
            accept=".pdf"
            multiple
            onChange={(e) => {
              const files = e.target.files;
              if (files) handleFileSelect(files);
            }}
            className="hidden"
            id="pdf-upload"
          />
          <label
            htmlFor="pdf-upload"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer inline-block"
          >
            Escolher PDFs
          </label>
        </div>

        {/* Lista de arquivos */}
        {selectedFiles.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Arquivos Selecionados ({selectedFiles.length})</h3>
              <label
                htmlFor="pdf-upload"
                className="text-blue-600 hover:text-blue-700 flex items-center gap-2 cursor-pointer"
              >
                <Plus size={16} />
                Adicionar mais arquivos
              </label>
            </div>
            
            <div className="space-y-2 mb-4">
              {selectedFiles.map((file, index) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-white rounded border hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-3">
                    <FileText className="text-red-500" size={20} />
                    <span className="text-gray-400 font-mono">{index + 1}.</span>
                    <div>
                      <div className="font-medium">{file.name}</div>
                      <div className="text-gray-500 text-sm">
                        {formatFileSize(file.size)} • {file.pageCount} página{file.pageCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => moveFile(file.id, 'up')}
                      disabled={index === 0}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed p-1"
                      title="Mover para cima"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      onClick={() => moveFile(file.id, 'down')}
                      disabled={index === selectedFiles.length - 1}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed p-1"
                      title="Mover para baixo"
                    >
                      <ArrowDown size={16} />
                    </button>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                      title="Remover arquivo"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm text-blue-800">
                <div className="font-medium mb-1">Resumo da junção:</div>
                <div>• {selectedFiles.length} arquivo{selectedFiles.length !== 1 ? 's' : ''}</div>
                <div>• {totalPagesCount} página{totalPagesCount !== 1 ? 's' : ''} no total</div>
                <div>• Tamanho total: {formatFileSize(totalSize)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Progress */}
        {isProcessing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-blue-800">
                Processando arquivo {currentFile} de {totalFiles} - Página {currentPage}
              </span>
              <span className="text-sm font-medium text-blue-800">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="text-xs text-blue-600 mt-2 text-center">
              Juntando arquivos PDF... Esta operação pode demorar alguns minutos.
            </div>
          </div>
        )}

        {/* Botão de juntar */}
        {selectedFiles.length > 0 && (
          <div className="text-center">
            <button
              onClick={mergePDFs}
              disabled={isProcessing || selectedFiles.length < 2}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Download size={20} />
              <span className="font-medium">
                {isProcessing ? 'Juntando PDFs...' : `Juntar ${selectedFiles.length} PDFs`}
              </span>
              {isProcessing && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              )}
            </button>
            {selectedFiles.length < 2 && (
              <p className="text-sm text-gray-500 mt-2">
                Selecione pelo menos 2 arquivos PDF para juntar
              </p>
            )}
          </div>
        )}

        {selectedFiles.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <p>Nenhum arquivo selecionado ainda</p>
            <p className="text-sm mt-1">Selecione múltiplos PDFs para começar</p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
