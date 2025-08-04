'use client';

import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Upload, FileText, Scissors, Download, Split, Grid3X3 } from 'lucide-react';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

interface SplitMode {
  value: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

// Função auxiliar para debug e log detalhado
const debugLog = (message: string, data?: any) => {
  console.log(`[DividirPDF] ${message}`, data || '');
};

export default function DividirPDFPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [splitMode, setSplitMode] = useState<string>('individual');
  const [customRange, setCustomRange] = useState<string>('');
  const [pagesPerGroup, setPagesPerGroup] = useState<number>(2);
  const [progress, setProgress] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalFiles, setTotalFiles] = useState<number>(0);

  const splitModes: SplitMode[] = [
    {
      value: 'individual',
      label: 'Páginas Individuais',
      description: 'Cada página vira um arquivo separado',
      icon: <FileText size={18} />,
      color: 'text-blue-600'
    },
    {
      value: 'group',
      label: 'Agrupar Páginas',
      description: 'Dividir em grupos de N páginas',
      icon: <Grid3X3 size={18} />,
      color: 'text-green-600'
    },
    {
      value: 'range',
      label: 'Intervalo Personalizado',
      description: 'Extrair páginas específicas',
      icon: <Split size={18} />,
      color: 'text-purple-600'
    }
  ];

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

  const handleFileSelect = async (file: File) => {
    if (file.type === 'application/pdf') {
      setSelectedFile(file);
      const pages = await getPageCount(file);
      setPageCount(pages);
      setProgress(0);
      setCurrentPage(0);
      setTotalFiles(0);
    } else {
      alert('Por favor, selecione um arquivo PDF válido.');
    }
  };

  const parseRange = (range: string): number[][] => {
    const ranges: number[][] = [];
    
    if (!range.trim()) {
      return ranges;
    }
    
    const parts = range.split(',');
    
    for (const part of parts) {
      const trimmed = part.trim();
      
      if (!trimmed) continue;
      
      if (trimmed.includes('-')) {
        const rangeParts = trimmed.split('-');
        if (rangeParts.length !== 2) {
          console.warn(`Intervalo inválido: ${trimmed}`);
          continue;
        }
        
        const start = parseInt(rangeParts[0].trim());
        const end = parseInt(rangeParts[1].trim());
        
        if (isNaN(start) || isNaN(end) || start <= 0 || end <= 0 || start > end || start > pageCount || end > pageCount) {
          console.warn(`Intervalo inválido: ${trimmed} (páginas devem estar entre 1 e ${pageCount})`);
          continue;
        }
        
        const pages = [];
        for (let i = start; i <= end; i++) {
          pages.push(i);
        }
        ranges.push(pages);
      } else {
        const pageNum = parseInt(trimmed);
        if (isNaN(pageNum) || pageNum <= 0 || pageNum > pageCount) {
          console.warn(`Página inválida: ${trimmed} (deve estar entre 1 e ${pageCount})`);
          continue;
        }
        ranges.push([pageNum]);
      }
    }
    
    return ranges;
  };

  const calculateSplitInfo = () => {
    switch (splitMode) {
      case 'individual':
        return {
          filesCount: pageCount,
          description: `${pageCount} arquivo${pageCount !== 1 ? 's' : ''} (1 página cada)`
        };
      case 'group':
        const groupCount = Math.ceil(pageCount / pagesPerGroup);
        return {
          filesCount: groupCount,
          description: `${groupCount} arquivo${groupCount !== 1 ? 's' : ''} (${pagesPerGroup} páginas cada, exceto o último)`
        };
      case 'range':
        const ranges = parseRange(customRange);
        return {
          filesCount: ranges.length,
          description: `${ranges.length} arquivo${ranges.length !== 1 ? 's' : ''} baseado no intervalo especificado`
        };
      default:
        return { filesCount: 0, description: '' };
    }
  };

  const splitPDF = async () => {
    if (!selectedFile) return;

    // Validações antes de iniciar
    if (splitMode === 'range') {
      const ranges = parseRange(customRange);
      if (ranges.length === 0) {
        alert('Por favor, insira um intervalo válido de páginas. Exemplo: 1-3, 5, 7-10');
        return;
      }
    }

    if (splitMode === 'group' && (pagesPerGroup < 1 || pagesPerGroup > pageCount)) {
      alert(`O número de páginas por grupo deve estar entre 1 e ${pageCount}.`);
      return;
    }

    setIsProcessing(true);
    
    try {
      debugLog(`Iniciando divisão do PDF: ${selectedFile.name}`);

      // Testar carregamento do pdf-lib primeiro
      debugLog('Carregando biblioteca pdf-lib...');
      let PDFDocument;
      try {
        const pdfLib = await import('pdf-lib');
        PDFDocument = pdfLib.PDFDocument;
        debugLog('✓ pdf-lib carregado com sucesso');
      } catch (libError) {
        debugLog('❌ Erro ao carregar pdf-lib:', libError);
        throw new Error('Falha ao carregar biblioteca PDF. Recarregue a página e tente novamente.');
      }
      
      // Carregar PDF original
      debugLog('Carregando PDF original...');
      let originalPdf;
      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        debugLog(`✓ ArrayBuffer criado: ${arrayBuffer.byteLength} bytes`);
        originalPdf = await PDFDocument.load(arrayBuffer);
        debugLog('✓ PDF carregado com pdf-lib');
      } catch (loadError) {
        debugLog('❌ Erro ao carregar PDF:', loadError);
        throw new Error('Falha ao carregar o PDF. Verifique se o arquivo não está corrompido.');
      }

      let pagesToSplit: number[][] = [];
      
      // Definir como dividir baseado no modo selecionado
      debugLog(`Modo de divisão: ${splitMode}`);
      switch (splitMode) {
        case 'individual':
          for (let i = 0; i < pageCount; i++) {
            pagesToSplit.push([i]); // pdf-lib usa índice 0
          }
          break;
        case 'group':
          for (let i = 0; i < pageCount; i += pagesPerGroup) {
            const group = [];
            for (let j = i; j < Math.min(i + pagesPerGroup, pageCount); j++) {
              group.push(j);
            }
            pagesToSplit.push(group);
          }
          break;
        case 'range':
          const ranges = parseRange(customRange);
          pagesToSplit = ranges.map(range => range.map(pageNum => pageNum - 1)); // Converter para índice 0
          break;
      }

      debugLog(`Total de arquivos a gerar: ${pagesToSplit.length}`);
      setTotalFiles(pagesToSplit.length);
      
      const baseName = selectedFile.name.replace('.pdf', '');

      // ESTRATÉGIA: Sempre usar ZIP para manter organização
      debugLog(`Gerando ZIP com ${pagesToSplit.length} arquivos`);
      
      // Usar ZIP com configurações otimizadas para Windows
      let zip;
      try {
        zip = new JSZip();
        debugLog('✓ JSZip inicializado');
      } catch (zipError) {
        debugLog('❌ Erro ao inicializar JSZip:', zipError);
        throw new Error('Falha ao inicializar sistema de arquivos ZIP');
      }

      for (let fileIndex = 0; fileIndex < pagesToSplit.length; fileIndex++) {
        const pageIndices = pagesToSplit[fileIndex];
        setCurrentPage(fileIndex + 1);
        setProgress(((fileIndex + 1) / pagesToSplit.length) * 100);

        debugLog(`[${fileIndex + 1}/${pagesToSplit.length}] Processando páginas: ${pageIndices.map(i => i + 1).join(', ')}`);

        try {
          // Criar novo PDF usando pdf-lib
          const newPdf = await PDFDocument.create();
          
          // Copiar páginas
          const copiedPages = await newPdf.copyPages(originalPdf, pageIndices);
          copiedPages.forEach((page) => newPdf.addPage(page));

          // Gerar nome do arquivo
          let fileName: string;
          if (splitMode === 'individual') {
            fileName = `${baseName}_pagina_${pageIndices[0] + 1}.pdf`;
          } else if (splitMode === 'group') {
            fileName = `${baseName}_grupo_${fileIndex + 1}_paginas_${pageIndices[0] + 1}-${pageIndices[pageIndices.length - 1] + 1}.pdf`;
          } else {
            // Para intervalos personalizados
            if (pageIndices.length === 1) {
              fileName = `${baseName}_pagina_${pageIndices[0] + 1}.pdf`;
            } else {
              fileName = `${baseName}_intervalo_${fileIndex + 1}_paginas_${pageIndices[0] + 1}-${pageIndices[pageIndices.length - 1] + 1}.pdf`;
            }
          }

          // Gerar PDF como bytes
          const pdfBytes = await newPdf.save();
          
          // Validar se o PDF foi criado
          if (!pdfBytes || pdfBytes.length === 0) {
            throw new Error(`PDF vazio gerado para páginas ${pageIndices.map(i => i + 1).join(', ')}`);
          }
          
          // Adicionar ao ZIP da forma mais simples possível
          zip.file(fileName, pdfBytes);
          
          debugLog(`✓ [${fileIndex + 1}] ${fileName} adicionado ao ZIP (${pdfBytes.length} bytes)`);
          
        } catch (pageError) {
          debugLog(`❌ [${fileIndex + 1}] Erro ao processar páginas ${pageIndices.map(i => i + 1).join(', ')}:`, pageError);
          throw new Error(`Falha no arquivo ${fileIndex + 1}: ${pageError instanceof Error ? pageError.message : 'Erro desconhecido'}`);
        }

        // Pausa para evitar sobrecarga de memória
        if (fileIndex % 3 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Gerar ZIP da forma mais básica possível
      debugLog('Gerando ZIP final...');
      debugLog(`Arquivos no ZIP: ${Object.keys(zip.files).length}`);
      
      try {
        // Tentar diferentes métodos de ZIP para máxima compatibilidade
        let zipBlob;
        
        try {
          // Método 1: Sem compressão (mais compatível)
          debugLog('Tentando ZIP sem compressão...');
          zipBlob = await zip.generateAsync({ 
            type: 'blob',
            compression: 'STORE',
            compressionOptions: {
              level: 0
            }
          });
          debugLog(`✓ ZIP sem compressão gerado: ${zipBlob.size} bytes`);
        } catch (method1Error) {
          debugLog('❌ Método 1 falhou, tentando método 2...', method1Error);
          
          try {
            // Método 2: Configuração básica
            debugLog('Tentando ZIP básico...');
            zipBlob = await zip.generateAsync({ 
              type: 'blob'
            });
            debugLog(`✓ ZIP básico gerado: ${zipBlob.size} bytes`);
          } catch (method2Error) {
            debugLog('❌ Método 2 falhou, tentando método 3...', method2Error);
            
            // Método 3: Com configurações específicas para Windows
            debugLog('Tentando ZIP com configurações Windows...');
            zipBlob = await zip.generateAsync({ 
              type: 'blob',
              platform: 'DOS',
              streamFiles: false
            });
            debugLog(`✓ ZIP Windows gerado: ${zipBlob.size} bytes`);
          }
        }
        
        if (!zipBlob || zipBlob.size === 0) {
          throw new Error('Arquivo ZIP gerado está vazio');
        }
        
        const zipFileName = `${baseName}_dividido_${pagesToSplit.length}_arquivos.zip`;
        debugLog(`Iniciando download: ${zipFileName}`);
        
        saveAs(zipBlob, zipFileName);
        debugLog(`✅ Download do ZIP iniciado com sucesso`);
        
      } catch (zipGenError) {
        debugLog('❌ Todos os métodos de ZIP falharam:', zipGenError);
        throw new Error('Falha ao gerar arquivo ZIP. Tente com um PDF menor, menos páginas, ou recarregue a página.');
      }
      
      // Reset progress
      setTimeout(() => {
        setProgress(0);
        setCurrentPage(0);
        setTotalFiles(0);
      }, 2000);
      
    } catch (error) {
      debugLog('❌ ERRO PRINCIPAL:', error);
      
      let errorMessage = 'Erro ao dividir o PDF: ';
      
      if (error instanceof Error) {
        debugLog('Tipo de erro:', error.name);
        debugLog('Mensagem do erro:', error.message);
        debugLog('Stack trace:', error.stack);
        
        if (error.message.includes('ZIP') || error.message.includes('zip')) {
          errorMessage += 'Problema na criação do arquivo ZIP. Tente com menos páginas ou use o modo de download individual.';
        } else if (error.message.includes('memory') || error.message.includes('allocation') || error.message.includes('Maximum call stack')) {
          errorMessage += 'PDF muito grande ou muitas páginas. Tente dividir em grupos menores.';
        } else if (error.message.includes('Failed to parse') || error.message.includes('Invalid PDF') || error.message.includes('corrupted')) {
          errorMessage += 'PDF corrompido ou formato inválido. Tente com outro arquivo.';
        } else if (error.message.includes('pdf-lib') || error.message.includes('biblioteca')) {
          errorMessage += 'Problema ao carregar bibliotecas. Recarregue a página e tente novamente.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage += 'Problema de conexão. Verifique sua internet e tente novamente.';
        } else {
          errorMessage += `${error.message}`;
        }
      } else {
        debugLog('Erro não é instância de Error:', typeof error);
        errorMessage += 'Erro inesperado. Recarregue a página e tente novamente.';
      }
      
      // Mostrar erro detalhado para debug
      console.error('=== ERRO DETALHADO ===');
      console.error('Arquivo:', selectedFile?.name);
      console.error('Modo:', splitMode);
      console.error('Páginas:', pageCount);
      console.error('Erro completo:', error);
      console.error('=====================');
      
      alert(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const splitInfo = calculateSplitInfo();

  return (
    <ToolLayout
      title="Dividir PDF"
      description="Divida arquivos PDF em páginas individuais, grupos ou intervalos personalizados."
    >
      <div className="space-y-6">
        {/* Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            Selecione um arquivo PDF
          </h3>
          <p className="text-gray-600 mb-4">
            Escolha o PDF que deseja dividir
          </p>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
            className="hidden"
            id="pdf-upload"
          />
          <label
            htmlFor="pdf-upload"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer inline-block"
          >
            Escolher Arquivo PDF
          </label>
        </div>

        {selectedFile && (
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Arquivo Selecionado</h3>
            
            {/* Info do arquivo */}
            <div className="bg-white rounded-lg p-4 flex items-center mb-6">
              <FileText className="text-red-500 mr-3" size={32} />
              <div>
                <div className="font-semibold text-gray-900">{selectedFile.name}</div>
                <div className="text-sm text-gray-600">
                  {formatFileSize(selectedFile.size)} • {pageCount} página{pageCount !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            {/* Modos de divisão */}
            <div className="space-y-4 mb-6">
              <h4 className="text-lg font-bold text-gray-900">Modo de Divisão</h4>
              <div className="space-y-3">
                {splitModes.map((mode) => (
                  <label key={mode.value} className="flex items-start gap-3 cursor-pointer p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="splitMode"
                      value={mode.value}
                      checked={splitMode === mode.value}
                      onChange={(e) => setSplitMode(e.target.value)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={mode.color}>{mode.icon}</span>
                        <div className={`font-semibold ${mode.color}`}>{mode.label}</div>
                      </div>
                      <div className="text-sm text-gray-700">{mode.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Configurações específicas */}
            {splitMode === 'group' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <label className="block text-sm font-semibold text-green-900 mb-2">
                  Páginas por grupo:
                </label>
                <input
                  type="number"
                  min="1"
                  max={pageCount}
                  value={pagesPerGroup}
                  onChange={(e) => setPagesPerGroup(parseInt(e.target.value) || 1)}
                  className="w-24 px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                />
                <div className="text-xs text-green-800 mt-1">
                  Cada arquivo terá {pagesPerGroup} página{pagesPerGroup !== 1 ? 's' : ''}
                </div>
              </div>
            )}

            {splitMode === 'range' && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                <label className="block text-sm font-semibold text-purple-900 mb-2">
                  Intervalos de páginas (ex: 1-3, 5, 7-10):
                </label>
                <input
                  type="text"
                  value={customRange}
                  onChange={(e) => setCustomRange(e.target.value)}
                  placeholder="1-3, 5, 7-10"
                  className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder-gray-500"
                />
                <div className="text-xs text-purple-800 mt-1">
                  Use vírgulas para separar intervalos. Ex: "1-3, 5, 7-10" criará 3 arquivos
                </div>
              </div>
            )}

            {/* Resumo da divisão */}
            {splitInfo.filesCount > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="text-sm text-blue-900">
                  <div className="font-semibold mb-1">Resumo da divisão:</div>
                  <div>• {splitInfo.description}</div>
                  <div>• Arquivos serão baixados em um arquivo ZIP</div>
                  <div className="text-xs mt-2 text-blue-800">
                    📦 Todos os arquivos serão organizados em um único ZIP para download
                  </div>
                </div>
              </div>
            )}

            {/* Progress */}
            {isProcessing && (
              <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-orange-900">
                    Processando arquivo {currentPage} de {totalFiles}
                  </span>
                  <span className="text-sm font-bold text-orange-900">
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="w-full bg-orange-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="text-xs text-orange-800 mt-2 text-center font-medium">
                  Dividindo PDF... Os arquivos serão empacotados em um ZIP.
                </div>
              </div>
            )}

            {/* Botão de dividir */}
            <div className="text-center">
              <button
                onClick={splitPDF}
                disabled={isProcessing || splitInfo.filesCount === 0}
                className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-8 py-3 rounded-lg hover:from-red-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Scissors size={20} />
                <span className="font-medium">
                  {isProcessing ? 'Dividindo PDF...' : `Dividir em ${splitInfo.filesCount} arquivo${splitInfo.filesCount !== 1 ? 's' : ''}`}
                </span>
                {isProcessing && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                )}
              </button>
              {splitInfo.filesCount === 0 && splitMode === 'range' && (
                <p className="text-sm text-red-600 mt-2 font-medium">
                  Insira um intervalo válido de páginas
                </p>
              )}
            </div>
          </div>
        )}

        {!selectedFile && (
          <div className="text-center py-8 text-gray-600">
            <Scissors className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="font-medium text-gray-700">Nenhum arquivo selecionado ainda</p>
            <p className="text-sm mt-1 text-gray-500">Selecione um PDF para começar a dividir</p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
