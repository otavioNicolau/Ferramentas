'use client';

import { useState, useRef } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Upload, Download, FileText, ArrowUp, ArrowDown, Trash2, RotateCcw, Move, CheckCircle } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { isPdfFile } from '@/lib/pdf';

interface PageInfo {
  pageNumber: number;
  originalIndex: number;
  thumbnail?: string;
}

export default function SortPagesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
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
      alert('Por favor, selecione apenas arquivos PDF.');
      return;
    }
    
    if (selectedFile.size > 50 * 1024 * 1024) {
      alert('Arquivo muito grande. Limite de 50MB.');
      return;
    }
    
    setFile(selectedFile);
    setPages([]);
    setResultUrl(null);
    
    // Carregar páginas do PDF
    try {
      setIsProcessing(true);
      setProgress(20);
      
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pageCount = pdfDoc.getPageCount();
      
      setProgress(60);
      
      // Criar lista de páginas
      const pageList: PageInfo[] = [];
      for (let i = 0; i < pageCount; i++) {
        pageList.push({
          pageNumber: i + 1,
          originalIndex: i
        });
      }
      
      setPages(pageList);
      setProgress(100);
      
    } catch (error) {
      console.error('Erro ao carregar PDF:', error);
      alert('Erro ao carregar o arquivo PDF.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const movePageUp = (index: number) => {
    if (index > 0) {
      const newPages = [...pages];
      [newPages[index], newPages[index - 1]] = [newPages[index - 1], newPages[index]];
      setPages(newPages);
    }
  };

  const movePageDown = (index: number) => {
    if (index < pages.length - 1) {
      const newPages = [...pages];
      [newPages[index], newPages[index + 1]] = [newPages[index + 1], newPages[index]];
      setPages(newPages);
    }
  };

  const removePage = (index: number) => {
    const newPages = pages.filter((_, i) => i !== index);
    setPages(newPages);
  };

  const resetOrder = () => {
    const resetPages = [...pages].sort((a, b) => a.originalIndex - b.originalIndex);
    setPages(resetPages);
  };

  const reverseOrder = () => {
    const reversedPages = [...pages].reverse();
    setPages(reversedPages);
  };

  const sortAlphabetically = () => {
    const sortedPages = [...pages].sort((a, b) => a.pageNumber - b.pageNumber);
    setPages(sortedPages);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropPage = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      const newPages = [...pages];
      const draggedPage = newPages[draggedIndex];
      
      // Remove o item da posição original
      newPages.splice(draggedIndex, 1);
      
      // Insere na nova posição
      newPages.splice(dropIndex, 0, draggedPage);
      
      setPages(newPages);
    }
    
    setDraggedIndex(null);
  };

  const generateSortedPdf = async () => {
    if (!file || pages.length === 0) return;
    
    setIsProcessing(true);
    setProgress(0);
    
    try {
      setProgress(20);
      const arrayBuffer = await file.arrayBuffer();
      const originalPdf = await PDFDocument.load(arrayBuffer);
      
      setProgress(40);
      
      // Criar novo PDF
      const newPdf = await PDFDocument.create();
      
      setProgress(60);
      
      // Copiar páginas na nova ordem
      for (let i = 0; i < pages.length; i++) {
        const pageInfo = pages[i];
        const [copiedPage] = await newPdf.copyPages(originalPdf, [pageInfo.originalIndex]);
        newPdf.addPage(copiedPage);
        
        setProgress(60 + (i / pages.length) * 30);
      }
      
      // Adicionar metadados
      newPdf.setTitle(originalPdf.getTitle() || 'Documento Reordenado');
      newPdf.setAuthor(originalPdf.getAuthor() || 'Sistema de Ordenação');
      newPdf.setSubject('PDF com páginas reordenadas');
      newPdf.setCreator('PDF Page Sorter');
      newPdf.setProducer('PDF Tools');
      newPdf.setCreationDate(new Date());
      newPdf.setModificationDate(new Date());
      
      setProgress(95);
      
      // Gerar PDF final
      const pdfBytes = await newPdf.save();
      
      // Criar URL para download
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      
      setProgress(100);
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar o PDF reordenado.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const clearAll = () => {
    setFile(null);
    setPages([]);
    setResultUrl(null);
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
      title="Ordenar Páginas"
      description="Reordene as páginas do seu PDF"
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
          <Move className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Selecione o PDF para Reordenar
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
              <p className="text-sm text-gray-500 mt-1">{formatFileSize(file.size)}</p>
              <p className="text-sm text-blue-600 mt-1">{pages.length} páginas carregadas</p>
            </div>
          )}
        </div>

        {/* Control Buttons */}
        {pages.length > 0 && !resultUrl && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={resetOrder}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Ordem Original
              </button>
              
              <button
                onClick={reverseOrder}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
              >
                <ArrowUp className="w-4 h-4 mr-2" />
                Inverter Ordem
              </button>
              
              <button
                onClick={sortAlphabetically}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Move className="w-4 h-4 mr-2" />
                Ordem Numérica
              </button>
              
              <button
                onClick={clearAll}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Limpar Tudo
              </button>
            </div>
          </div>
        )}

        {/* Pages List */}
        {pages.length > 0 && !resultUrl && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Páginas ({pages.length} total)
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Arraste as páginas para reordená-las ou use os botões de controle
            </p>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {pages.map((page, index) => (
                <div
                  key={`${page.originalIndex}-${index}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDropPage(e, index)}
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-move hover:bg-gray-50 transition-colors ${
                    draggedIndex === index ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center text-sm font-medium text-blue-800">
                      {index + 1}
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">
                        Página {page.pageNumber}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        (Original: {page.originalIndex + 1})
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => movePageUp(index)}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Mover para cima"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => movePageDown(index)}
                      disabled={index === pages.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Mover para baixo"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => removePage(index)}
                      className="p-1 text-red-400 hover:text-red-600"
                      title="Remover página"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generate Button */}
        {pages.length > 0 && !resultUrl && (
          <div className="text-center">
            <button
              onClick={generateSortedPdf}
              disabled={isProcessing}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center mx-auto"
            >
              <Move className="w-5 h-5 mr-2" />
              {isProcessing ? 'Gerando PDF...' : 'Gerar PDF Reordenado'}
            </button>
          </div>
        )}

        {/* Progress */}
        {isProcessing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-blue-900">
                {pages.length === 0 ? 'Carregando páginas...' : 'Gerando PDF reordenado...'}
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
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
              <h3 className="text-xl font-bold text-gray-900">PDF Reordenado com Sucesso!</h3>
            </div>
            
            <div className="text-center space-y-4">
              <p className="text-gray-600">
                Seu PDF foi reordenado com {pages.length} páginas na nova sequência.
              </p>
              
              <div className="flex justify-center space-x-4">
                <a
                  href={resultUrl}
                  download={file?.name.replace('.pdf', '_reordenado.pdf')}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Baixar PDF Reordenado
                </a>
                
                <button
                  onClick={clearAll}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Reordenar Outro PDF
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Como Usar</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Carregue um arquivo PDF para ver suas páginas</li>
            <li>• Arraste e solte as páginas para reordená-las</li>
            <li>• Use os botões de seta para mover páginas individualmente</li>
            <li>• Remova páginas indesejadas com o botão de lixeira</li>
            <li>• Use as ações rápidas para ordenações comuns</li>
          </ul>
        </div>

        {/* Tips */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-2">💡 Dicas</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• A ordem original é preservada para referência</li>
            <li>• Você pode remover páginas durante a reordenação</li>
            <li>• Use "Ordem Original" para desfazer todas as mudanças</li>
            <li>• O arquivo original não é modificado</li>
            <li>• Funciona com PDFs de até 50MB</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}
