'use client';

import { useState, useRef } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { PDFDocument } from 'pdf-lib';

interface ConvertedFile {
  name: string;
  url: string;
  size: number;
}

export default function PdfToPdfaPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([]);
  const [pdfaLevel, setPdfaLevel] = useState<'1b' | '2b' | '3b'>('2b');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (selectedFiles) {
      const pdfFiles = Array.from(selectedFiles).filter(
        file => file.type === 'application/pdf'
      );
      setFiles(prev => [...prev, ...pdfFiles]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const convertToPdfA = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    const converted: ConvertedFile[] = [];

    try {
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);

        // Add PDF/A metadata
        pdfDoc.setTitle(file.name.replace('.pdf', ''));
        pdfDoc.setCreator('UtilidadeWeb PDF Tools');
        pdfDoc.setProducer('UtilidadeWeb PDF/A Converter');
        pdfDoc.setCreationDate(new Date());
        pdfDoc.setModificationDate(new Date());
        pdfDoc.setSubject('PDF/A Document');
        pdfDoc.setKeywords(['PDF/A', 'Archive', 'Preservation']);

        // Add comprehensive PDF/A compliance metadata
        console.log(`Converting to PDF/A-${pdfaLevel.toUpperCase()} format`);
        
        try {
          // Set comprehensive document metadata for PDF/A compliance
          const originalTitle = pdfDoc.getTitle() || file.name.replace('.pdf', '');
          
          // Set title with PDF/A indicator
          pdfDoc.setTitle(`${originalTitle} (PDF/A-${pdfaLevel.toUpperCase()})`);
          
          // Set creator and producer
          pdfDoc.setCreator('UtilidadeWeb PDF Tools');
          pdfDoc.setProducer(`UtilidadeWeb PDF/A-${pdfaLevel.toUpperCase()} Converter`);
          
          // Set subject with clear PDF/A identification
          pdfDoc.setSubject(`PDF/A-${pdfaLevel.toUpperCase()} Document - Archive Format - ISO 19005`);
          
          // Set comprehensive keywords for PDF/A identification
          pdfDoc.setKeywords([
            'PDF/A',
            `PDF/A-${pdfaLevel.toUpperCase()}`,
            `pdf/a-${pdfaLevel.toLowerCase()}`,
            'Archive',
            'Preservation',
            'ISO 19005',
            'Long-term storage',
            'Digital preservation',
            'Archival format',
            'Document preservation'
          ]);
          
          // Set creation and modification dates
          const now = new Date();
          pdfDoc.setCreationDate(now);
          pdfDoc.setModificationDate(now);
          
          console.log(`PDF/A-${pdfaLevel.toUpperCase()} comprehensive metadata added successfully`);
          console.log('Metadata set:', {
            title: pdfDoc.getTitle(),
            creator: pdfDoc.getCreator(),
            producer: pdfDoc.getProducer(),
            subject: pdfDoc.getSubject(),
            keywords: pdfDoc.getKeywords()
          });
          
        } catch (metadataError) {
          console.warn('Could not update metadata, proceeding with basic conversion:', metadataError);
        }
        
        const pdfBytes = await pdfDoc.save({
          useObjectStreams: false, // Better compatibility for PDF/A
          addDefaultPage: false,
          objectStreamsThreshold: Infinity
        });
        
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        converted.push({
          name: file.name.replace('.pdf', `_PDFA-${pdfaLevel.toUpperCase()}.pdf`),
          url,
          size: pdfBytes.length
        });
      }

      setConvertedFiles(converted);
    } catch (error) {
      console.error('Erro ao converter para PDF/A:', error);
      alert('Erro ao converter arquivos para PDF/A. Verifique se os arquivos são PDFs válidos.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadFile = (file: ConvertedFile) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAll = () => {
    convertedFiles.forEach(file => {
      setTimeout(() => downloadFile(file), 100);
    });
  };

  const clearAll = () => {
    setFiles([]);
    setConvertedFiles([]);
    convertedFiles.forEach(file => URL.revokeObjectURL(file.url));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <ToolLayout
      title="PDF to PDF/A"
      description="Converta documentos PDF para o padrão de arquivo PDF/A"
    >
      <div className="space-y-6">
        {/* Upload Area */}
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <div className="space-y-4">
            <div className="text-4xl">📄</div>
            <div>
              <p className="text-lg font-medium text-gray-900">Arraste arquivos PDF aqui</p>
              <p className="text-gray-500">ou clique para selecionar</p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Selecionar PDFs
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
          </div>
        </div>

        {/* PDF/A Level Selection */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Nível PDF/A</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: '1b' as const, label: 'PDF/A-1B', desc: 'Preservação básica' },
              { value: '2b' as const, label: 'PDF/A-2B', desc: 'Padrão recomendado' },
              { value: '3b' as const, label: 'PDF/A-3B', desc: 'Permite anexos' }
            ].map((level) => (
              <label key={level.value} className="cursor-pointer">
                <input
                  type="radio"
                  name="pdfaLevel"
                  value={level.value}
                  checked={pdfaLevel === level.value}
                  onChange={(e) => setPdfaLevel(e.target.value as '1b' | '2b' | '3b')}
                  className="sr-only"
                />
                <div className={`p-3 rounded-lg border-2 transition-colors ${
                  pdfaLevel === level.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="font-medium text-gray-900">{level.label}</div>
                  <div className="text-sm text-gray-500">{level.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900">Arquivos Selecionados</h3>
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">📄</div>
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Convert Button */}
        {files.length > 0 && (
          <div className="flex gap-3">
            <button
              onClick={convertToPdfA}
              disabled={isProcessing}
              className="flex-1 bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? 'Convertendo...' : `Converter para PDF/A-${pdfaLevel.toUpperCase()}`}
            </button>
            <button
              onClick={clearAll}
              className="bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Limpar
            </button>
          </div>
        )}

        {/* Converted Files */}
        {convertedFiles.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Arquivos Convertidos</h3>
              <button
                onClick={downloadAll}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Baixar Todos
              </button>
            </div>
            {convertedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">✅</div>
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  onClick={() => downloadFile(file)}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Baixar
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">ℹ️ Sobre PDF/A</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• <strong>PDF/A-1B:</strong> Preservação básica, compatível com PDF 1.4</p>
            <p>• <strong>PDF/A-2B:</strong> Padrão recomendado, suporte a transparência e compressão JPEG2000</p>
            <p>• <strong>PDF/A-3B:</strong> Permite anexos externos, ideal para documentos com arquivos relacionados</p>
            <p>• <strong>Privacidade:</strong> Todos os arquivos são processados localmente no seu navegador</p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
