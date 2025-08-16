'use client';

import { useState, useRef } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Upload, FileText, Download, Copy, Trash2, Eye, Search, Type } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import { useI18n } from '@/i18n/client';

// Configurar o worker do PDF.js
if (typeof window !== 'undefined') {
  GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
}

interface ExtractedText {
  pageNumber: number;
  text: string;
  wordCount: number;
  charCount: number;
}

interface PdfInfo {
  fileName: string;
  fileSize: string;
  pageCount: number;
  extractedPages: ExtractedText[];
  fullText: string;
  totalWords: number;
  totalChars: number;
}

export default function PdfToTextPage() {
  const { t } = useI18n();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfInfo, setPdfInfo] = useState<PdfInfo | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [extractionMode, setExtractionMode] = useState<'all' | 'selected'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Formatar tamanho do arquivo
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Contar palavras
  const countWords = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  // Extrair texto do PDF usando PDF.js
  const extractTextFromPdf = async (file: File): Promise<PdfInfo> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: arrayBuffer }).promise;
    const pageCount = pdf.numPages;
    
    const extractedPages: ExtractedText[] = [];
    let fullText = '';
    
    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      const wordCount = countWords(pageText);
      const charCount = pageText.length;
      
      extractedPages.push({
        pageNumber: pageNum,
        text: pageText,
        wordCount,
        charCount
      });
      
      fullText += pageText + '\n\n';
    }
    
    const totalWords = countWords(fullText);
    const totalChars = fullText.length;
    
    return {
      fileName: file.name,
      fileSize: formatFileSize(file.size),
      pageCount,
      extractedPages,
      fullText: fullText.trim(),
      totalWords,
      totalChars
    };
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
    setSelectedPages([]);
    setSearchTerm('');

    try {
      const info = await extractTextFromPdf(file);
      setPdfInfo(info);
    } catch (error) {
      console.error('Erro ao extrair texto do PDF:', error);
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

  // Copiar texto para clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Texto copiado para a área de transferência!');
    } catch (error) {
      console.error('Erro ao copiar texto:', error);
      alert('Erro ao copiar texto.');
    }
  };

  // Baixar texto como arquivo
  const downloadText = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Filtrar páginas por termo de busca
  const filteredPages = pdfInfo?.extractedPages.filter(page => 
    searchTerm === '' || page.text.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Obter texto das páginas selecionadas
  const getSelectedText = (): string => {
    if (!pdfInfo) return '';
    
    if (extractionMode === 'all') {
      return pdfInfo.fullText;
    } else {
      return pdfInfo.extractedPages
        .filter(page => selectedPages.includes(page.pageNumber))
        .map(page => `=== Página ${page.pageNumber} ===\n${page.text}`)
        .join('\n\n');
    }
  };

  // Alternar seleção de página
  const togglePageSelection = (pageNumber: number) => {
    setSelectedPages(prev => 
      prev.includes(pageNumber)
        ? prev.filter(p => p !== pageNumber)
        : [...prev, pageNumber]
    );
  };

  // Selecionar/deselecionar todas as páginas
  const toggleAllPages = () => {
    if (!pdfInfo) return;
    
    if (selectedPages.length === pdfInfo.pageCount) {
      setSelectedPages([]);
    } else {
      setSelectedPages(pdfInfo.extractedPages.map(page => page.pageNumber));
    }
  };

  // Limpar tudo
  const clearAll = () => {
    setPdfFile(null);
    setPdfInfo(null);
    setSelectedPages([]);
    setSearchTerm('');
    setExtractionMode('all');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <ToolLayout
      title={t.pdfToTextTitle}
      description={t.pdfToTextDescription}
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

        {/* Processamento */}
        {isProcessing && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mr-3"></div>
              <p className="text-gray-700">Extraindo texto do PDF...</p>
            </div>
          </div>
        )}

        {/* Informações do PDF */}
        {pdfInfo && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Informações do Documento</h3>
              <button
                onClick={clearAll}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <Trash2 size={16} />
                Limpar
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-600 text-sm font-medium">Arquivo</p>
                <p className="text-blue-900 font-semibold">{pdfInfo.fileName}</p>
                <p className="text-blue-700 text-sm">{pdfInfo.fileSize}</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-600 text-sm font-medium">Páginas</p>
                <p className="text-green-900 font-semibold text-2xl">{pdfInfo.pageCount}</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-purple-600 text-sm font-medium">Palavras</p>
                <p className="text-purple-900 font-semibold text-2xl">{pdfInfo.totalWords.toLocaleString()}</p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-orange-600 text-sm font-medium">Caracteres</p>
                <p className="text-orange-900 font-semibold text-2xl">{pdfInfo.totalChars.toLocaleString()}</p>
              </div>
            </div>

            {/* Modo de Extração */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Modo de Extração</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="all"
                    checked={extractionMode === 'all'}
                    onChange={(e) => setExtractionMode(e.target.value as 'all' | 'selected')}
                    className="mr-2"
                  />
                  Todas as páginas
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="selected"
                    checked={extractionMode === 'selected'}
                    onChange={(e) => setExtractionMode(e.target.value as 'all' | 'selected')}
                    className="mr-2"
                  />
                  Páginas selecionadas
                </label>
              </div>
            </div>

            {/* Busca */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar no Texto</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t.searchPlaceholderText}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Ações */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => copyToClipboard(getSelectedText())}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Copy size={16} />
                Copiar Texto
              </button>
              <button
                onClick={() => downloadText(getSelectedText(), `${pdfInfo.fileName.replace('.pdf', '')}_texto.txt`)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Download size={16} />
                Baixar TXT
              </button>
              {extractionMode === 'selected' && (
                <button
                  onClick={toggleAllPages}
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <Type size={16} />
                  {selectedPages.length === pdfInfo.pageCount ? 'Deselecionar Todas' : 'Selecionar Todas'}
                </button>
              )}
            </div>

            {extractionMode === 'selected' && selectedPages.length > 0 && (
              <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-purple-800 text-sm">
                  📄 {selectedPages.length} página{selectedPages.length !== 1 ? 's' : ''} selecionada{selectedPages.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Lista de Páginas */}
        {pdfInfo && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Texto Extraído por Página
              {searchTerm && (
                <span className="text-sm font-normal text-gray-600 ml-2">
                  ({filteredPages.length} de {pdfInfo.pageCount} páginas encontradas)
                </span>
              )}
            </h3>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredPages.map((page) => (
                <div key={page.pageNumber} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {extractionMode === 'selected' && (
                        <input
                          type="checkbox"
                          checked={selectedPages.includes(page.pageNumber)}
                          onChange={() => togglePageSelection(page.pageNumber)}
                          className="rounded"
                        />
                      )}
                      <h4 className="font-medium text-gray-900">Página {page.pageNumber}</h4>
                      <span className="text-sm text-gray-600">
                        {page.wordCount} palavras • {page.charCount} caracteres
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(page.text)}
                      className="bg-gray-100 text-gray-600 px-3 py-1 rounded-md hover:bg-gray-200 transition-colors flex items-center gap-1 text-sm"
                    >
                      <Copy size={14} />
                      Copiar
                    </button>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded p-3 max-h-32 overflow-y-auto">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {searchTerm ? (
                        page.text.split(new RegExp(`(${searchTerm})`, 'gi')).map((part, index) => 
                          part.toLowerCase() === searchTerm.toLowerCase() ? (
                            <mark key={index} className="bg-yellow-200">{part}</mark>
                          ) : (
                            part
                          )
                        )
                      ) : (
                        page.text.length > 200 ? `${page.text.substring(0, 200)}...` : page.text
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredPages.length === 0 && searchTerm && (
              <div className="text-center py-8">
                <p className="text-gray-600">Nenhuma página encontrada com o termo "<strong>{searchTerm}</strong>"</p>
              </div>
            )}
          </div>
        )}

        {/* Informações */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Como Usar</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Faça upload de um arquivo PDF</li>
            <li>• O texto será extraído automaticamente de todas as páginas</li>
            <li>• Use a busca para encontrar conteúdo específico</li>
            <li>• Selecione páginas específicas ou extraia todo o texto</li>
            <li>• Copie o texto ou baixe como arquivo TXT</li>
          </ul>
        </div>

        {/* Limitações */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Limitações</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Funciona melhor com PDFs que contêm texto selecionável</li>
            <li>• PDFs escaneados (imagens) podem não ter texto extraível</li>
            <li>• A formatação original pode não ser preservada</li>
            <li>• Processamento realizado localmente no navegador</li>
            <li>• Arquivos muito grandes podem demorar para processar</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}
