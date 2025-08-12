'use client';

import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Upload, Download, FileText, Trash2 } from 'lucide-react';
import { saveAs } from 'file-saver';
import { getPdfPageCount, mergePdfFiles } from '@/lib/pdf';
import { generateId } from '@/lib/utils';

interface PDFFile {
  id: string;
  name: string;
  file: File;
  pages: number;
}

export default function JuntarPDFPage() {
  const [pdfFiles, setPdfFiles] = useState<PDFFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    const newFiles: PDFFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type === 'application/pdf') {
        try {
          const pageCount = await getPdfPageCount(file);
          newFiles.push({
            id: generateId(),
            name: file.name,
            file: file,
            pages: pageCount
          });
        } catch (error) {
          console.error('Erro ao ler PDF:', file.name, error);
        }
      }
    }
    
    setPdfFiles(prev => [...prev, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const removeFile = (id: string) => {
    setPdfFiles(prev => prev.filter(file => file.id !== id));
  };

  const moveFile = (id: string, direction: 'up' | 'down') => {
    setPdfFiles(prev => {
      const index = prev.findIndex(file => file.id === id);
      if (index === -1) return prev;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      
      const newFiles = [...prev];
      [newFiles[index], newFiles[newIndex]] = [newFiles[newIndex], newFiles[index]];
      return newFiles;
    });
  };

  const mergePDFs = async () => {
    if (pdfFiles.length < 2) {
      alert('Selecione pelo menos 2 PDFs para juntar');
      return;
    }

    setIsProcessing(true);
    try {
      const pdfBytes = await mergePdfFiles(pdfFiles.map(p => p.file));
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      saveAs(blob, 'documentos-unidos.pdf');
    } catch (error) {
      console.error('Erro ao juntar PDFs:', error);
      alert('Erro ao juntar os PDFs. Verifique se todos os arquivos são válidos.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Juntar PDF"
      description="Una múltiplos arquivos PDF em um único documento."
    >
      <div className="space-y-6">
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Arraste PDFs aqui ou clique para selecionar
          </h3>
          <p className="text-gray-500 mb-4">
            Selecione múltiplos arquivos PDF para unir em um único documento
          </p>
          <input
            type="file"
            multiple
            accept=".pdf"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            id="pdf-upload"
          />
          <label
            htmlFor="pdf-upload"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors cursor-pointer inline-block"
          >
            Selecionar PDFs
          </label>
        </div>

        {/* File List */}
        {pdfFiles.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">
              PDFs Selecionados ({pdfFiles.length})
            </h3>
            
            <div className="space-y-3">
              {pdfFiles.map((file, index) => (
                <div key={file.id} className="bg-white rounded-lg p-4 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <FileText className="text-red-500" size={24} />
                    <div>
                      <div className="font-medium">{file.name}</div>
                      <div className="text-sm text-gray-500">
                        {file.pages} página{file.pages !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 mr-4">
                      #{index + 1}
                    </span>
                    <button
                      onClick={() => moveFile(file.id, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveFile(file.id, 'down')}
                      disabled={index === pdfFiles.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-1 text-red-400 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Total de páginas: {pdfFiles.reduce((sum, file) => sum + file.pages, 0)}
              </div>
              
              <button
                onClick={mergePDFs}
                disabled={pdfFiles.length < 2 || isProcessing}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Download size={16} />
                {isProcessing ? 'Processando...' : 'Juntar PDFs'}
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Como usar:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>1. Selecione ou arraste múltiplos arquivos PDF</li>
            <li>2. Reorganize a ordem dos documentos usando as setas ↑↓</li>
            <li>3. Clique em "Juntar PDFs" para gerar o documento final</li>
            <li>4. O arquivo combinado será baixado automaticamente</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}
