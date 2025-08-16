'use client';

import { useState, useRef } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { useI18n } from '@/i18n/client';
import { Upload, Download, FileText, Trash2, Eye, AlertCircle } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

// Configurar o worker do PDF.js
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
}

interface ConvertedDocument {
  fileName: string;
  fileSize: number;
  pageCount: number;
  wordCount: number;
  blob: Blob;
  downloadUrl: string;
}

export default function PdfToWordPage() {
  const { t } = useI18n();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [convertedDoc, setConvertedDoc] = useState<ConvertedDocument | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(0);
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
    if (files && files[0] && files[0].type === 'application/pdf') {
      setFile(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setFile(files[0]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const extractTextFromPdf = async (file: File): Promise<{ text: string; pageCount: number }> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pageCount = pdf.numPages;
    let fullText = '';

    for (let i = 1; i <= pageCount; i++) {
      setProgress((i / pageCount) * 50); // Primeira metade do progresso
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      let pageText = '';
      textContent.items.forEach((item: any) => {
        if (item.str) {
          pageText += item.str + ' ';
        }
      });
      
      fullText += `\n\n=== PÁGINA ${i} ===\n\n${pageText.trim()}`;
    }

    return { text: fullText.trim(), pageCount };
  };

  const createWordDocument = async (text: string, fileName: string): Promise<Blob> => {
    const paragraphs: Paragraph[] = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('=== PÁGINA') && trimmedLine.endsWith('===')) {
        // Cabeçalho de página
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: trimmedLine,
                bold: true,
                size: 28,
                color: '2563eb'
              })
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
          })
        );
      } else if (trimmedLine) {
        // Texto normal
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: trimmedLine,
                size: 24
              })
            ],
            spacing: { after: 120 }
          })
        );
      } else {
        // Linha vazia
        paragraphs.push(
          new Paragraph({
            children: [new TextRun({ text: '' })],
            spacing: { after: 120 }
          })
        );
      }
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: `Documento convertido de: ${fileName}`,
                  bold: true,
                  size: 32,
                  color: '1f2937'
                })
              ],
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 400 }
            }),
            ...paragraphs
          ]
        }
      ]
    });

    return await Packer.toBlob(doc);
  };

  const convertToWord = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    
    try {
      // Extrair texto do PDF
      const { text, pageCount } = await extractTextFromPdf(file);
      
      setProgress(75);
      
      // Criar documento Word
      const wordBlob = await createWordDocument(text, file.name);
      
      setProgress(90);
      
      const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
      const downloadUrl = URL.createObjectURL(wordBlob);
      
      setConvertedDoc({
        fileName: file.name.replace('.pdf', '.docx'),
        fileSize: wordBlob.size,
        pageCount,
        wordCount,
        blob: wordBlob,
        downloadUrl
      });
      
      setProgress(100);
    } catch (error) {
      console.error('Erro ao converter PDF:', error);
      alert('Erro ao converter o PDF. Verifique se o arquivo não está corrompido.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const downloadWord = () => {
    if (!convertedDoc) return;
    
    const link = document.createElement('a');
    link.href = convertedDoc.downloadUrl;
    link.download = convertedDoc.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearAll = () => {
    setFile(null);
    setConvertedDoc(null);
    setIsProcessing(false);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <ToolLayout
      title={t.pdfToWordTitle}
      description={t.pdfToWordDescription}
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
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Selecionar Arquivo
            </button>
          </div>
        </div>

        {/* Arquivo Selecionado */}
        {file && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Arquivo Selecionado</h3>
              <button
                onClick={clearAll}
                className="text-gray-600 hover:text-gray-800 flex items-center gap-1"
              >
                <Trash2 size={16} />
                Limpar
              </button>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <FileText className="text-red-600" size={24} />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-600">{formatFileSize(file.size)}</p>
              </div>
            </div>
            
            <div className="mt-4">
              <button
                onClick={convertToWord}
                disabled={isProcessing}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <FileText size={20} />
                {isProcessing ? 'Convertendo...' : 'Converter para Word'}
              </button>
            </div>
          </div>
        )}

        {/* Progresso */}
        {isProcessing && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700">
                Convertendo PDF para Word...
              </span>
              <span className="text-sm font-bold text-blue-600">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-600 mt-2 text-center">
              Extraindo texto e formatando documento...
            </div>
          </div>
        )}

        {/* Resultado */}
        {convertedDoc && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Documento Convertido</h3>
              <button
                onClick={clearAll}
                className="text-gray-600 hover:text-gray-800 flex items-center gap-1"
              >
                <Trash2 size={16} />
                Limpar
              </button>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="text-green-600" size={20} />
                <span className="font-medium text-green-800">Conversão concluída!</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-green-700 font-medium">Arquivo:</span>
                  <p className="text-green-800">{convertedDoc.fileName}</p>
                </div>
                <div>
                  <span className="text-green-700 font-medium">Tamanho:</span>
                  <p className="text-green-800">{formatFileSize(convertedDoc.fileSize)}</p>
                </div>
                <div>
                  <span className="text-green-700 font-medium">Páginas:</span>
                  <p className="text-green-800">{convertedDoc.pageCount}</p>
                </div>
                <div>
                  <span className="text-green-700 font-medium">Palavras:</span>
                  <p className="text-green-800">{convertedDoc.wordCount.toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={downloadWord}
                className="flex-1 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Download size={20} />
                Baixar Word (.docx)
              </button>
            </div>
          </div>
        )}

        {/* Informações */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">💡 Como funciona:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Extrai todo o texto do PDF preservando a estrutura por páginas</li>
            <li>• Converte para formato Word (.docx) com formatação básica</li>
            <li>• Mantém a separação entre páginas com cabeçalhos</li>
            <li>• Processamento realizado localmente no navegador</li>
            <li>• Compatível com Microsoft Word e LibreOffice</li>
          </ul>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
            <AlertCircle size={16} />
            ⚠️ Limitações
          </h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Funciona melhor com PDFs que contêm texto selecionável</li>
            <li>• PDFs escaneados (imagens) podem não ter texto extraível</li>
            <li>• Formatação complexa (tabelas, imagens) pode ser perdida</li>
            <li>• PDFs protegidos por senha não são suportados</li>
            <li>• Recomendado para arquivos de até 50MB</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}
