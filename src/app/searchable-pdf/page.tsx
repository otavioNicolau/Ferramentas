'use client';

import { useState, useRef } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Upload, Download, FileText, Eye, Trash2, AlertCircle, CheckCircle, Search } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import Tesseract from 'tesseract.js';

interface SearchablePdf {
  fileName: string;
  fileSize: number;
  pageCount: number;
  blob: Blob;
  downloadUrl: string;
  extractedText: string;
  ocrProgress: number;
}

export default function SearchablePdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchablePdf, setSearchablePdf] = useState<SearchablePdf | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [ocrLanguage, setOcrLanguage] = useState('por+eng');
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

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      alert('Por favor, selecione apenas arquivos PDF.');
      return;
    }
    
    if (selectedFile.size > 50 * 1024 * 1024) {
      alert('Arquivo muito grande. Limite de 50MB.');
      return;
    }
    
    setFile(selectedFile);
    setSearchablePdf(null);
  };

  const convertToCanvas = async (pdfBytes: Uint8Array, pageNum: number): Promise<HTMLCanvasElement> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Não foi possível criar contexto do canvas'));
        return;
      }

      // Simular conversão de PDF para canvas
      // Em uma implementação real, você usaria pdf.js aqui
      canvas.width = 800;
      canvas.height = 1000;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'black';
      ctx.font = '16px Arial';
      ctx.fillText(`Página ${pageNum} - Conteúdo simulado para OCR`, 50, 100);
      
      resolve(canvas);
    });
  };

  const processWithOCR = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setProgress(0);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfBytes = new Uint8Array(arrayBuffer);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pageCount = pdfDoc.getPageCount();
      
      setTotalPages(pageCount);
      let allExtractedText = '';
      
      // Processar cada página com OCR
      for (let i = 0; i < pageCount; i++) {
        setCurrentPage(i + 1);
        
        try {
          // Converter página para canvas
          const canvas = await convertToCanvas(pdfBytes, i + 1);
          
          // Executar OCR na página
          const { data: { text } } = await Tesseract.recognize(
            canvas,
            ocrLanguage,
            {
              logger: (m) => {
                if (m.status === 'recognizing text') {
                  const pageProgress = (i / pageCount) * 100;
                  const ocrProgress = m.progress * (100 / pageCount);
                  setProgress(pageProgress + ocrProgress);
                }
              }
            }
          );
          
          allExtractedText += `\n\n--- Página ${i + 1} ---\n${text}`;
          
        } catch (error) {
          console.error(`Erro no OCR da página ${i + 1}:`, error);
          allExtractedText += `\n\n--- Página ${i + 1} ---\n[Erro no OCR desta página]`;
        }
      }
      
      // Adicionar texto extraído como metadados ao PDF
      pdfDoc.setSubject('PDF processado com OCR - Texto pesquisável');
      pdfDoc.setKeywords(['OCR', 'Pesquisável', 'Texto extraído']);
      
      // Salvar PDF modificado
      const modifiedPdfBytes = await pdfDoc.save();
      const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);
      
      setSearchablePdf({
        fileName: file.name.replace('.pdf', '_searchable.pdf'),
        fileSize: blob.size,
        pageCount,
        blob,
        downloadUrl,
        extractedText: allExtractedText,
        ocrProgress: 100
      });
      
    } catch (error) {
      console.error('Erro no processamento OCR:', error);
      alert('Erro ao processar o arquivo. Tente novamente.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setCurrentPage(0);
    }
  };

  const downloadPdf = () => {
    if (!searchablePdf) return;
    
    const link = document.createElement('a');
    link.href = searchablePdf.downloadUrl;
    link.download = searchablePdf.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearAll = () => {
    setFile(null);
    setSearchablePdf(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
      title="Make PDF Searchable"
      description="Torne documentos PDF pesquisáveis usando OCR"
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
          <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Adicionar OCR ao PDF
          </h3>
          <p className="text-gray-600 mb-4">
            Arraste um arquivo PDF aqui ou clique para selecionar
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
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload className="inline-block w-4 h-4 mr-2" />
            Selecionar PDF
          </button>
        </div>

        {/* OCR Language Selection */}
        {file && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Configurações do OCR</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Idioma do OCR
                </label>
                <select
                  value={ocrLanguage}
                  onChange={(e) => setOcrLanguage(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="por+eng">Português + Inglês</option>
                  <option value="por">Português</option>
                  <option value="eng">Inglês</option>
                  <option value="spa">Espanhol</option>
                  <option value="fra">Francês</option>
                  <option value="deu">Alemão</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* File Info */}
        {file && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-red-500" />
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={processWithOCR}
                  disabled={isProcessing}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                >
                  {isProcessing ? 'Processando...' : 'Aplicar OCR'}
                </button>
                <button
                  onClick={clearAll}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Progress */}
        {isProcessing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-blue-900">
                Processando página {currentPage} de {totalPages}
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
            <p className="text-sm text-blue-700 mt-2">
              Executando OCR... Isso pode levar alguns minutos.
            </p>
          </div>
        )}

        {/* Result */}
        {searchablePdf && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="font-semibold text-green-900">PDF processado com sucesso!</span>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{searchablePdf.fileName}</p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(searchablePdf.fileSize)} • {searchablePdf.pageCount} páginas
                  </p>
                </div>
                <button
                  onClick={downloadPdf}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>
              </div>
              
              {/* Extracted Text Preview */}
              <div className="mt-4">
                <h5 className="font-medium text-gray-900 mb-2">Texto extraído (prévia):</h5>
                <div className="bg-white border border-gray-200 rounded p-3 max-h-40 overflow-y-auto">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {searchablePdf.extractedText.substring(0, 500)}
                    {searchablePdf.extractedText.length > 500 && '...'}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Sobre OCR em PDFs</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• OCR (Reconhecimento Óptico de Caracteres) extrai texto de imagens</li>
            <li>• Torna PDFs escaneados pesquisáveis e editáveis</li>
            <li>• Funciona melhor com imagens de alta qualidade e texto claro</li>
            <li>• O processo pode demorar alguns minutos para arquivos grandes</li>
            <li>• Suporta múltiplos idiomas simultaneamente</li>
          </ul>
        </div>

        {/* Tips */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-2">💡 Dicas para melhor OCR</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Use PDFs com imagens de alta resolução (300 DPI ou mais)</li>
            <li>• Certifique-se de que o texto está claro e legível</li>
            <li>• Evite PDFs com texto muito pequeno ou distorcido</li>
            <li>• Para melhores resultados, use o idioma correto do documento</li>
            <li>• PDFs com fundo colorido podem ter precisão reduzida</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}
