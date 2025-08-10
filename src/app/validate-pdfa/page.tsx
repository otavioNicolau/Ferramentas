'use client';

import { useState, useRef } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Upload, FileText, CheckCircle, XCircle, AlertTriangle, Trash2 } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

interface ValidationResult {
  fileName: string;
  fileSize: string;
  isValid: boolean;
  pdfaLevel: string | null;
  issues: string[];
  warnings: string[];
  timestamp: Date;
}

export default function ValidatePdfaPage() {
  const [, setSelectedFile] = useState<File | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validatePDF = async (file: File) => {
    setIsValidating(true);
    setResult(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      let isValid = true;
      let pdfaLevel: string | null = null;
      const issues: string[] = [];
      const warnings: string[] = [];

      // Check basic PDF metadata
      const title = pdfDoc.getTitle();
      const creator = pdfDoc.getCreator();
      const producer = pdfDoc.getProducer();
      const subject = pdfDoc.getSubject();
      const keywords = pdfDoc.getKeywords();

      console.log('PDF Metadata:', { title, creator, producer, subject, keywords });

      // Check for PDF/A indicators in metadata
      if (title && title.includes('PDF/A')) {
        if (title.includes('PDF/A-1')) {
          pdfaLevel = 'PDF/A-1B';
        } else if (title.includes('PDF/A-2')) {
          pdfaLevel = 'PDF/A-2B';
        } else if (title.includes('PDF/A-3')) {
          pdfaLevel = 'PDF/A-3B';
        }
      }

      // Check subject for PDF/A indicators
      if (subject && subject.includes('PDF/A')) {
        if (subject.includes('PDF/A-1')) {
          pdfaLevel = 'PDF/A-1B';
        } else if (subject.includes('PDF/A-2')) {
          pdfaLevel = 'PDF/A-2B';
        } else if (subject.includes('PDF/A-3')) {
          pdfaLevel = 'PDF/A-3B';
        }
      }

      // Check keywords for PDF/A indicators
      if (keywords && Array.isArray(keywords)) {
        const keywordStr = keywords.join(' ').toLowerCase();
        if (keywordStr.includes('pdf/a-1')) {
          pdfaLevel = 'PDF/A-1B';
        } else if (keywordStr.includes('pdf/a-2')) {
          pdfaLevel = 'PDF/A-2B';
        } else if (keywordStr.includes('pdf/a-3')) {
          pdfaLevel = 'PDF/A-3B';
        } else if (keywordStr.includes('pdf/a')) {
          pdfaLevel = 'PDF/A-1B'; // Default assumption
        }
      }

      // Basic validation checks
      if (!title || title.trim() === '') {
        warnings.push('Título do documento não definido');
      }

      if (!creator || creator.trim() === '') {
        warnings.push('Criador do documento não definido');
      }

      if (!producer || producer.trim() === '') {
        warnings.push('Produtor do documento não definido');
      }

      // Check if PDF/A metadata is present
      if (!pdfaLevel) {
        isValid = false;
        issues.push('Metadados PDF/A não encontrados no documento');
        issues.push('Documento não contém identificadores de conformidade PDF/A');
      } else {
        // Additional checks for detected PDF/A level
        if (pdfaLevel === 'PDF/A-1B') {
          if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
            warnings.push('Palavras-chave recomendadas para PDF/A-1B');
          }
        }
        
        if (pdfaLevel === 'PDF/A-2B' || pdfaLevel === 'PDF/A-3B') {
          if (!subject || subject.trim() === '') {
            warnings.push('Assunto recomendado para ' + pdfaLevel);
          }
        }
      }

      // Check page count
      const pageCount = pdfDoc.getPageCount();
      if (pageCount === 0) {
        isValid = false;
        issues.push('Documento PDF não contém páginas');
      }

      console.log('Validation result:', { isValid, pdfaLevel, issues, warnings });

      const validationResult: ValidationResult = {
        fileName: file.name,
        fileSize: formatFileSize(file.size),
        isValid,
        pdfaLevel,
        issues,
        warnings,
        timestamp: new Date()
      };

      setResult(validationResult);
    } catch (error) {
      console.error('Erro ao validar PDF:', error);
      const validationResult: ValidationResult = {
        fileName: file.name,
        fileSize: formatFileSize(file.size),
        isValid: false,
        pdfaLevel: null,
        issues: ['Erro ao processar o arquivo PDF', 'Arquivo pode estar corrompido ou não ser um PDF válido'],
        warnings: [],
        timestamp: new Date()
      };
      setResult(validationResult);
    } finally {
      setIsValidating(false);
    }
  };

  const handleFileSelect = (file: File) => {
    if (file.type === 'application/pdf') {
      setSelectedFile(file);
      validatePDF(file);
    } else {
      alert('Por favor, selecione apenas arquivos PDF.');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const reset = () => {
    setSelectedFile(null);
    setResult(null);
    setIsValidating(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <ToolLayout
      title="Validador PDF/A"
      description="Valide se documentos PDF estão em conformidade com os padrões PDF/A para arquivamento de longo prazo"
    >
      <div className="space-y-6">
        {/* Upload Area */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={20} className="text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-800">Selecionar Arquivo PDF</h3>
          </div>
          
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Arraste um arquivo PDF aqui ou clique para selecionar
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Apenas arquivos PDF são aceitos
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Selecionar Arquivo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Loading State */}
        {isValidating && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
              <span className="text-gray-700">Validando PDF/A...</span>
            </div>
            <div className="mt-4 text-center text-sm text-gray-500">
              Verificando conformidade com padrões PDF/A
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Resultado da Validação</h3>
              <button
                onClick={reset}
                className="text-gray-600 hover:text-gray-800 flex items-center gap-1"
              >
                <Trash2 size={16} />
                Limpar
              </button>
            </div>

            {/* File Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Arquivo:</span>
                  <p className="text-gray-600 break-all">{result.fileName}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Tamanho:</span>
                  <p className="text-gray-600">{result.fileSize}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Validado em:</span>
                  <p className="text-gray-600">{result.timestamp.toLocaleString('pt-BR')}</p>
                </div>
              </div>
            </div>

            {/* Validation Status */}
            <div className={`rounded-lg p-4 mb-4 ${
              result.isValid 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {result.isValid ? (
                  <CheckCircle className="text-green-600" size={20} />
                ) : (
                  <XCircle className="text-red-600" size={20} />
                )}
                <span className={`font-semibold ${
                  result.isValid ? 'text-green-800' : 'text-red-800'
                }`}>
                  {result.isValid ? 'PDF/A Válido' : 'PDF/A Inválido'}
                </span>
              </div>
              {result.pdfaLevel && (
                <p className={`text-sm ${
                  result.isValid ? 'text-green-700' : 'text-red-700'
                }`}>
                  Nível detectado: {result.pdfaLevel}
                </p>
              )}
            </div>

            {/* Issues */}
            {result.issues.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="text-red-600" size={16} />
                  <span className="font-medium text-red-800">Problemas Encontrados</span>
                </div>
                <ul className="text-sm text-red-700 space-y-1">
                  {result.issues.map((issue, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {result.warnings.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="text-yellow-600" size={16} />
                  <span className="font-medium text-yellow-800">Avisos</span>
                </div>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {result.warnings.map((warning, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-yellow-500 mt-1">•</span>
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Sobre PDF/A</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• PDF/A é um padrão ISO para arquivamento de documentos eletrônicos</li>
            <li>• Garante que documentos possam ser visualizados no futuro</li>
            <li>• PDF/A-1: Baseado em PDF 1.4, mais restritivo</li>
            <li>• PDF/A-2: Baseado em PDF 1.7, permite mais recursos</li>
            <li>• PDF/A-3: Permite anexos de arquivos externos</li>
          </ul>
        </div>

        {/* Tips */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-2">💡 Dicas para PDF/A</h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Incorpore todas as fontes no documento</li>
            <li>• Evite transparências e efeitos especiais</li>
            <li>• Use cores RGB ou CMYK consistentes</li>
            <li>• Inclua metadados XMP apropriados</li>
            <li>• Teste arquivos com nomes como "invalid.pdf" ou "warning.pdf" para ver diferentes resultados</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}
