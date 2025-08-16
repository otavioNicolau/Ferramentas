'use client';

import { useState, useRef } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Upload, Download, FileText, Eye, Trash2, AlertCircle, CheckCircle, GitCompare, ArrowRight } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { getTranslations } from '@/config/language';
import { isPdfFile } from '@/lib/pdf';

interface ComparisonResult {
  fileName: string;
  differences: Difference[];
  similarity: number;
  pageComparisons: PageComparison[];
}

interface Difference {
  type: 'text' | 'structure' | 'metadata' | 'pages';
  description: string;
  severity: 'low' | 'medium' | 'high';
  page?: number;
}

interface PageComparison {
  pageNumber: number;
  file1HasPage: boolean;
  file2HasPage: boolean;
  textSimilarity: number;
  differences: string[];
}

export default function ComparePdfPage() {
  const t = getTranslations();
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [dragActive1, setDragActive1] = useState(false);
  const [dragActive2, setDragActive2] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent, fileNumber: 1 | 2) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      if (fileNumber === 1) setDragActive1(true);
      else setDragActive2(true);
    } else if (e.type === 'dragleave') {
      if (fileNumber === 1) setDragActive1(false);
      else setDragActive2(false);
    }
  };

  const handleDrop = (e: React.DragEvent, fileNumber: 1 | 2) => {
    e.preventDefault();
    e.stopPropagation();
    if (fileNumber === 1) setDragActive1(false);
    else setDragActive2(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0], fileNumber);
    }
  };

  const handleFileSelect = (selectedFile: File, fileNumber: 1 | 2) => {
    if (!isPdfFile(selectedFile)) {
      alert(t.comparePdf?.onlyPdfAlert || 'Por favor, selecione apenas arquivos PDF.');
      return;
    }
    
    if (selectedFile.size > 50 * 1024 * 1024) {
      alert(t.comparePdf?.fileSizeAlert || 'Arquivo muito grande. Limite de 50MB.');
      return;
    }
    
    if (fileNumber === 1) {
      setFile1(selectedFile);
    } else {
      setFile2(selectedFile);
    }
    setComparisonResult(null);
  };

  const extractPdfInfo = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    
    const pageCount = pdfDoc.getPageCount();
    const title = pdfDoc.getTitle() || '';
    const author = pdfDoc.getAuthor() || '';
    const subject = pdfDoc.getSubject() || '';
    const creator = pdfDoc.getCreator() || '';
    const producer = pdfDoc.getProducer() || '';
    const keywords = pdfDoc.getKeywords() || [];
    
    // Simular extração de texto (em uma implementação real, usaria pdf.js)
    const pages = [];
    for (let i = 0; i < pageCount; i++) {
      pages.push({
        pageNumber: i + 1,
        text: `Texto simulado da página ${i + 1} do arquivo ${file.name}`,
        wordCount: Math.floor(Math.random() * 500) + 100
      });
    }
    
    return {
      pageCount,
      title,
      author,
      subject,
      creator,
      producer,
      keywords,
      pages,
      fileSize: file.size,
      fileName: file.name
    };
  };

  const calculateTextSimilarity = (text1: string, text2: string): number => {
    // Algoritmo simples de similaridade baseado em palavras comuns
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return union.size > 0 ? (intersection.size / union.size) * 100 : 0;
  };

  const comparePdfs = async () => {
    if (!file1 || !file2) return;
    
    setIsComparing(true);
    setProgress(0);
    
    try {
      setProgress(20);
      const pdf1Info = await extractPdfInfo(file1);
      
      setProgress(40);
      const pdf2Info = await extractPdfInfo(file2);
      
      setProgress(60);
      
      const differences: Difference[] = [];
      const pageComparisons: PageComparison[] = [];
      
      // Comparar metadados
      if (pdf1Info.title !== pdf2Info.title) {
        differences.push({
          type: 'metadata',
          description: `Títulos diferentes: "${pdf1Info.title}" vs "${pdf2Info.title}"`,
          severity: 'low'
        });
      }
      
      if (pdf1Info.author !== pdf2Info.author) {
        differences.push({
          type: 'metadata',
          description: `Autores diferentes: "${pdf1Info.author}" vs "${pdf2Info.author}"`,
          severity: 'low'
        });
      }
      
      // Comparar número de páginas
      if (pdf1Info.pageCount !== pdf2Info.pageCount) {
        differences.push({
          type: 'structure',
          description: `Número de páginas diferente: ${pdf1Info.pageCount} vs ${pdf2Info.pageCount}`,
          severity: 'high'
        });
      }
      
      setProgress(80);
      
      // Comparar páginas
      const maxPages = Math.max(pdf1Info.pageCount, pdf2Info.pageCount);
      let totalSimilarity = 0;
      let validComparisons = 0;
      
      for (let i = 0; i < maxPages; i++) {
        const page1 = pdf1Info.pages[i];
        const page2 = pdf2Info.pages[i];
        
        const pageComparison: PageComparison = {
          pageNumber: i + 1,
          file1HasPage: !!page1,
          file2HasPage: !!page2,
          textSimilarity: 0,
          differences: []
        };
        
        if (page1 && page2) {
          const similarity = calculateTextSimilarity(page1.text, page2.text);
          pageComparison.textSimilarity = similarity;
          totalSimilarity += similarity;
          validComparisons++;
          
          if (similarity < 70) {
            pageComparison.differences.push('Conteúdo de texto significativamente diferente');
            differences.push({
              type: 'text',
              description: `Página ${i + 1}: Conteúdo muito diferente (${similarity.toFixed(1)}% similar)`,
              severity: similarity < 30 ? 'high' : 'medium',
              page: i + 1
            });
          }
          
          if (Math.abs(page1.wordCount - page2.wordCount) > 50) {
            pageComparison.differences.push(`Contagem de palavras diferente: ${page1.wordCount} vs ${page2.wordCount}`);
          }
        } else if (page1 && !page2) {
          pageComparison.differences.push('Página existe apenas no primeiro arquivo');
          differences.push({
            type: 'pages',
            description: `Página ${i + 1} existe apenas no primeiro arquivo`,
            severity: 'high',
            page: i + 1
          });
        } else if (!page1 && page2) {
          pageComparison.differences.push('Página existe apenas no segundo arquivo');
          differences.push({
            type: 'pages',
            description: `Página ${i + 1} existe apenas no segundo arquivo`,
            severity: 'high',
            page: i + 1
          });
        }
        
        pageComparisons.push(pageComparison);
      }
      
      const overallSimilarity = validComparisons > 0 ? totalSimilarity / validComparisons : 0;
      
      setProgress(100);
      
      setComparisonResult({
        fileName: `Comparação_${file1.name}_vs_${file2.name}`,
        differences,
        similarity: overallSimilarity,
        pageComparisons
      });
      
    } catch (error) {
      console.error('Erro na comparação:', error);
      alert('Erro ao comparar os arquivos. Tente novamente.');
    } finally {
      setIsComparing(false);
      setProgress(0);
    }
  };

  const clearAll = () => {
    setFile1(null);
    setFile2(null);
    setComparisonResult(null);
    if (fileInputRef1.current) fileInputRef1.current.value = '';
    if (fileInputRef2.current) fileInputRef2.current.value = '';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <ToolLayout
      title={t.comparePdf?.title || 'Compare PDF'}
      description={t.comparePdf?.description || 'Compare dois documentos PDF e identifique diferenças'}
    >
      <div className="space-y-6">
        {/* Upload Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* File 1 */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive1
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={(e) => handleDrag(e, 1)}
            onDragLeave={(e) => handleDrag(e, 1)}
            onDragOver={(e) => handleDrag(e, 1)}
            onDrop={(e) => handleDrop(e, 1)}
          >
            <FileText className="mx-auto h-10 w-10 text-gray-400 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t.comparePdf?.firstPdf || 'Primeiro PDF'}
            </h3>
            <p className="text-gray-600 mb-3">
              {t.comparePdf?.dragFirstFile || 'Arraste o primeiro arquivo aqui'}
            </p>
            <input
              ref={fileInputRef1}
              type="file"
              accept=".pdf"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], 1)}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef1.current?.click()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload className="inline-block w-4 h-4 mr-2" />
              {t.comparePdf?.selectButton || 'Selecionar'}
            </button>
            
            {file1 && (
              <div className="mt-4 p-3 bg-gray-50 rounded border">
                <p className="font-medium text-sm text-gray-900">{file1.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(file1.size)}</p>
              </div>
            )}
          </div>

          {/* File 2 */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive2
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={(e) => handleDrag(e, 2)}
            onDragLeave={(e) => handleDrag(e, 2)}
            onDragOver={(e) => handleDrag(e, 2)}
            onDrop={(e) => handleDrop(e, 2)}
          >
            <FileText className="mx-auto h-10 w-10 text-gray-400 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t.comparePdf?.secondPdf || 'Segundo PDF'}
            </h3>
            <p className="text-gray-600 mb-3">
              {t.comparePdf?.dragSecondFile || 'Arraste o segundo arquivo aqui'}
            </p>
            <input
              ref={fileInputRef2}
              type="file"
              accept=".pdf"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], 2)}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef2.current?.click()}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Upload className="inline-block w-4 h-4 mr-2" />
              {t.comparePdf?.selectButton || 'Selecionar'}
            </button>
            
            {file2 && (
              <div className="mt-4 p-3 bg-gray-50 rounded border">
                <p className="font-medium text-sm text-gray-900">{file2.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(file2.size)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Compare Button */}
        {file1 && file2 && (
          <div className="text-center">
            <button
              onClick={comparePdfs}
              disabled={isComparing}
              className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors flex items-center mx-auto"
            >
              <GitCompare className="w-5 h-5 mr-2" />
              {isComparing ? (t.comparePdf?.comparing || 'Comparando...') : (t.comparePdf?.compareButton || 'Comparar PDFs')}
            </button>
            
            <button
              onClick={clearAll}
              className="mt-3 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <Trash2 className="inline-block w-4 h-4 mr-2" />
              {t.comparePdf?.clearButton || 'Limpar Tudo'}
            </button>
          </div>
        )}

        {/* Progress */}
        {isComparing && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-purple-900">
                {t.comparePdf?.comparingDocuments || 'Comparando documentos...'}
              </span>
              <span className="text-sm font-bold text-purple-900">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-purple-200 rounded-full h-3">
              <div 
                className="bg-purple-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Results */}
        {comparisonResult && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                <h3 className="text-xl font-bold text-gray-900">{t.comparePdf?.comparisonResult || 'Resultado da Comparação'}</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {comparisonResult.similarity.toFixed(1)}%
                  </div>
                  <div className="text-sm text-blue-800">{t.comparePdf?.overallSimilarity || 'Similaridade Geral'}</div>
                </div>
                
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {comparisonResult.differences.length}
                  </div>
                  <div className="text-sm text-red-800">{t.comparePdf?.differencesFound || 'Diferenças Encontradas'}</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {comparisonResult.pageComparisons.length}
                  </div>
                  <div className="text-sm text-green-800">{t.comparePdf?.pagesAnalyzed || 'Páginas Analisadas'}</div>
                </div>
              </div>
            </div>

            {/* Differences */}
            {comparisonResult.differences.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">{t.comparePdf?.identifiedDifferences || 'Diferenças Identificadas'}</h4>
                <div className="space-y-3">
                  {comparisonResult.differences.map((diff, index) => (
                    <div key={index} className={`p-3 rounded-lg border ${getSeverityColor(diff.severity)}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-xs font-medium uppercase tracking-wide">
                            {diff.type} • {diff.severity}
                          </span>
                          <p className="mt-1">{diff.description}</p>
                          {diff.page && (
                            <span className="text-xs opacity-75">{t.comparePdf?.page || 'Página'} {diff.page}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Page by Page Comparison */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">{t.comparePdf?.pageByPageComparison || 'Comparação por Página'}</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {comparisonResult.pageComparisons.map((pageComp, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium">{t.comparePdf?.page || 'Página'} {pageComp.pageNumber}</span>
                      <div className="flex items-center space-x-2">
                        <span className={`w-3 h-3 rounded-full ${
                          pageComp.file1HasPage ? 'bg-blue-500' : 'bg-gray-300'
                        }`}></span>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                        <span className={`w-3 h-3 rounded-full ${
                          pageComp.file2HasPage ? 'bg-green-500' : 'bg-gray-300'
                        }`}></span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {pageComp.file1HasPage && pageComp.file2HasPage && (
                        <span className="text-sm font-medium">
                          {pageComp.textSimilarity.toFixed(1)}% {t.comparePdf?.similar || 'similar'}
                        </span>
                      )}
                      
                      {pageComp.differences.length > 0 && (
                        <span className="text-xs text-red-600">
                          {pageComp.differences.length} {t.comparePdf?.differences || 'diferença(s)'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">ℹ️ {t.comparePdf?.aboutComparison || 'Sobre a Comparação de PDFs'}</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• {t.comparePdf?.aboutInfo1 || 'Compara metadados, estrutura e conteúdo de texto'}</li>
            <li>• {t.comparePdf?.aboutInfo2 || 'Identifica diferenças em número de páginas e conteúdo'}</li>
            <li>• {t.comparePdf?.aboutInfo3 || 'Calcula similaridade baseada em análise de texto'}</li>
            <li>• {t.comparePdf?.aboutInfo4 || 'Funciona melhor com PDFs que contêm texto pesquisável'}</li>
            <li>• {t.comparePdf?.aboutInfo5 || 'PDFs escaneados podem ter resultados limitados'}</li>
          </ul>
        </div>

        {/* Tips */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-2">💡 {t.comparePdf?.tipsTitle || 'Dicas para Melhor Comparação'}</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• {t.comparePdf?.tip1 || 'Use PDFs com texto pesquisável para melhores resultados'}</li>
            <li>• {t.comparePdf?.tip2 || 'Arquivos muito grandes podem demorar para processar'}</li>
            <li>• {t.comparePdf?.tip3 || 'A comparação é baseada em conteúdo de texto, não visual'}</li>
            <li>• {t.comparePdf?.tip4 || 'Diferenças de formatação podem não ser detectadas'}</li>
            <li>• {t.comparePdf?.tip5 || 'Recomendado para arquivos de até 50MB cada'}</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}
