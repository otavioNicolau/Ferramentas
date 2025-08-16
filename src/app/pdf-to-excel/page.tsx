'use client';

import { useState, useRef } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { useI18n } from '@/i18n/client';
import { Upload, FileText, Download, Table, Trash2, Eye, Settings, AlertCircle } from 'lucide-react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import * as XLSX from 'xlsx';

// Configurar o worker do PDF.js
if (typeof window !== 'undefined') {
  GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
}

interface TableData {
  id: string;
  pageNumber: number;
  rows: string[][];
  headers?: string[];
  rowCount: number;
  columnCount: number;
}

interface PdfInfo {
  fileName: string;
  fileSize: string;
  pageCount: number;
  tables: TableData[];
}

export default function PdfToExcelPage() {
  const { t } = useI18n();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfInfo, setPdfInfo] = useState<PdfInfo | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [separateSheets, setSeparateSheets] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Formatar tamanho do arquivo
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Detectar tabelas no texto (simulação básica)
  const detectTablesInText = (text: string): string[][] => {
    const lines = text.split('\n').filter(line => line.trim());
    const tables: string[][] = [];
    let currentTable: string[] = [];
    
    for (const line of lines) {
      // Detectar linhas que parecem ter dados tabulares
      // Critérios: múltiplos espaços, tabs, ou caracteres separadores
      const hasMultipleSpaces = /\s{2,}/.test(line);
      const hasTabs = line.includes('\t');
      const hasNumbers = /\d/.test(line);
      const hasCommonSeparators = /[|;,]/.test(line);
      
      if (hasMultipleSpaces || hasTabs || (hasNumbers && hasCommonSeparators)) {
        currentTable.push(line.trim());
      } else {
        if (currentTable.length >= 2) {
          tables.push([...currentTable]);
        }
        currentTable = [];
      }
    }
    
    // Adicionar última tabela se existir
    if (currentTable.length >= 2) {
      tables.push(currentTable);
    }
    
    return tables;
  };

  // Processar linha da tabela para colunas
  const processTableRow = (line: string): string[] => {
    // Tentar diferentes separadores
    if (line.includes('\t')) {
      return line.split('\t').map(cell => cell.trim());
    } else if (line.includes('|')) {
      return line.split('|').map(cell => cell.trim()).filter(cell => cell);
    } else if (line.includes(';')) {
      return line.split(';').map(cell => cell.trim());
    } else if (line.includes(',')) {
      return line.split(',').map(cell => cell.trim());
    } else {
      // Dividir por múltiplos espaços
      return line.split(/\s{2,}/).map(cell => cell.trim()).filter(cell => cell);
    }
  };

  // Extrair tabelas do PDF
  const extractTablesFromPdf = async (file: File): Promise<PdfInfo> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: arrayBuffer }).promise;
    const pageCount = pdf.numPages;
    
    const allTables: TableData[] = [];
    
    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ')
        .replace(/\s+/g, ' ');
      
      // Detectar tabelas na página
      const rawTables = detectTablesInText(pageText);
      
      rawTables.forEach((rawTable, tableIndex) => {
        const processedRows = rawTable.map(row => processTableRow(row));
        
        // Filtrar linhas vazias e garantir consistência de colunas
        const validRows = processedRows.filter(row => row.length > 1);
        
        if (validRows.length >= 2) {
          const maxColumns = Math.max(...validRows.map(row => row.length));
          
          // Normalizar todas as linhas para ter o mesmo número de colunas
          const normalizedRows = validRows.map(row => {
            while (row.length < maxColumns) {
              row.push('');
            }
            return row.slice(0, maxColumns);
          });
          
          const tableData: TableData = {
            id: `page${pageNum}_table${tableIndex + 1}`,
            pageNumber: pageNum,
            rows: normalizedRows,
            headers: includeHeaders ? normalizedRows[0] : undefined,
            rowCount: normalizedRows.length,
            columnCount: maxColumns
          };
          
          allTables.push(tableData);
        }
      });
    }
    
    return {
      fileName: file.name,
      fileSize: formatFileSize(file.size),
      pageCount,
      tables: allTables
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
    setSelectedTables([]);

    try {
      const info = await extractTablesFromPdf(file);
      setPdfInfo(info);
      // Selecionar todas as tabelas por padrão
      setSelectedTables(info.tables.map(table => table.id));
    } catch (error) {
      console.error('Erro ao extrair tabelas do PDF:', error);
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

  // Alternar seleção de tabela
  const toggleTableSelection = (tableId: string) => {
    setSelectedTables(prev => 
      prev.includes(tableId)
        ? prev.filter(id => id !== tableId)
        : [...prev, tableId]
    );
  };

  // Selecionar/deselecionar todas as tabelas
  const toggleAllTables = () => {
    if (!pdfInfo) return;
    
    if (selectedTables.length === pdfInfo.tables.length) {
      setSelectedTables([]);
    } else {
      setSelectedTables(pdfInfo.tables.map(table => table.id));
    }
  };

  // Gerar e baixar Excel
  const generateExcel = () => {
    if (!pdfInfo || selectedTables.length === 0) {
      alert('Selecione pelo menos uma tabela para exportar.');
      return;
    }

    const workbook = XLSX.utils.book_new();
    const selectedTableData = pdfInfo.tables.filter(table => selectedTables.includes(table.id));

    if (separateSheets) {
      // Criar uma planilha para cada tabela
      selectedTableData.forEach((table, index) => {
        const worksheetData = includeHeaders && table.headers 
          ? [table.headers, ...table.rows.slice(1)]
          : table.rows;
        
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        const sheetName = `Página ${table.pageNumber} - Tabela ${index + 1}`;
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      });
    } else {
      // Combinar todas as tabelas em uma planilha
      const combinedData: string[][] = [];
      
      selectedTableData.forEach((table, index) => {
        if (index > 0) {
          combinedData.push([]); // Linha vazia entre tabelas
          combinedData.push([`=== Página ${table.pageNumber} - Tabela ${index + 1} ===`]);
          combinedData.push([]);
        }
        
        const tableData = includeHeaders && table.headers 
          ? [table.headers, ...table.rows.slice(1)]
          : table.rows;
        
        combinedData.push(...tableData);
      });
      
      const worksheet = XLSX.utils.aoa_to_sheet(combinedData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Tabelas Combinadas');
    }

    // Baixar o arquivo
    const fileName = `${pdfInfo.fileName.replace('.pdf', '')}_tabelas.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // Visualizar tabela
  const previewTable = (table: TableData) => {
    const previewData = table.rows.slice(0, 5); // Mostrar apenas 5 linhas
    const headers = includeHeaders && table.headers ? table.headers : [];
    
    let preview = '';
    if (headers.length > 0) {
      preview += headers.join('\t') + '\n';
    }
    preview += previewData.map(row => row.join('\t')).join('\n');
    
    if (table.rows.length > 5) {
      preview += '\n... (mais ' + (table.rows.length - 5) + ' linhas)';
    }
    
    alert(`Prévia da Tabela:\n\n${preview}`);
  };

  // Limpar tudo
  const clearAll = () => {
    setPdfFile(null);
    setPdfInfo(null);
    setSelectedTables([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <ToolLayout
      title={t.pdfToExcelTitle}
      description={t.pdfToExcelDescription}
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
              <p className="text-gray-700">Analisando PDF e detectando tabelas...</p>
            </div>
          </div>
        )}

        {/* Configurações */}
        {pdfInfo && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Configurações de Exportação</h3>
              <button
                onClick={clearAll}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <Trash2 size={16} />
                Limpar
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
                <p className="text-purple-600 text-sm font-medium">Tabelas Detectadas</p>
                <p className="text-purple-900 font-semibold text-2xl">{pdfInfo.tables.length}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeHeaders}
                    onChange={(e) => setIncludeHeaders(e.target.checked)}
                    className="mr-2"
                  />
                  Incluir primeira linha como cabeçalho
                </label>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={separateSheets}
                    onChange={(e) => setSeparateSheets(e.target.checked)}
                    className="mr-2"
                  />
                  Criar planilhas separadas para cada tabela
                </label>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={generateExcel}
                disabled={selectedTables.length === 0}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Download size={16} />
                Baixar Excel ({selectedTables.length} tabela{selectedTables.length !== 1 ? 's' : ''})
              </button>
              <button
                onClick={toggleAllTables}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Table size={16} />
                {selectedTables.length === pdfInfo.tables.length ? 'Deselecionar Todas' : 'Selecionar Todas'}
              </button>
            </div>
          </div>
        )}

        {/* Lista de Tabelas */}
        {pdfInfo && pdfInfo.tables.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Tabelas Detectadas ({pdfInfo.tables.length})
            </h3>
            
            <div className="space-y-4">
              {pdfInfo.tables.map((table, index) => (
                <div key={table.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedTables.includes(table.id)}
                        onChange={() => toggleTableSelection(table.id)}
                        className="rounded"
                      />
                      <Table className="text-blue-600" size={24} />
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Página {table.pageNumber} - Tabela {index + 1}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {table.rowCount} linha{table.rowCount !== 1 ? 's' : ''} × {table.columnCount} coluna{table.columnCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => previewTable(table)}
                      className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1 text-sm"
                    >
                      <Eye size={14} />
                      Prévia
                    </button>
                  </div>
                  
                  {/* Prévia da tabela */}
                  <div className="bg-gray-50 border border-gray-200 rounded p-3 overflow-x-auto">
                    <table className="min-w-full text-xs">
                      <thead>
                        {includeHeaders && table.headers && (
                          <tr className="bg-gray-100">
                            {table.headers.map((header, colIndex) => (
                              <th key={colIndex} className="px-2 py-1 text-left font-medium text-gray-700 border-r border-gray-300 last:border-r-0">
                                {header || `Col ${colIndex + 1}`}
                              </th>
                            ))}
                          </tr>
                        )}
                      </thead>
                      <tbody>
                        {table.rows.slice(includeHeaders ? 1 : 0, 3).map((row, rowIndex) => (
                          <tr key={rowIndex} className="border-b border-gray-200">
                            {row.map((cell, colIndex) => (
                              <td key={colIndex} className="px-2 py-1 text-gray-600 border-r border-gray-300 last:border-r-0">
                                {cell || '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {table.rows.length > 3 && (
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        ... e mais {table.rows.length - 3} linha{table.rows.length - 3 !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nenhuma tabela encontrada */}
        {pdfInfo && pdfInfo.tables.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-yellow-600" size={24} />
              <div>
                <h3 className="font-semibold text-yellow-900">Nenhuma tabela detectada</h3>
                <p className="text-yellow-800 text-sm">
                  Não foi possível detectar tabelas estruturadas neste PDF. 
                  Verifique se o documento contém dados tabulares com formatação clara.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Informações */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Como Usar</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Faça upload de um arquivo PDF que contenha tabelas</li>
            <li>• As tabelas serão detectadas automaticamente</li>
            <li>• Selecione quais tabelas deseja exportar</li>
            <li>• Configure as opções de exportação</li>
            <li>• Baixe o arquivo Excel com as tabelas convertidas</li>
          </ul>
        </div>

        {/* Limitações */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Limitações</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• A detecção de tabelas é baseada em padrões de texto</li>
            <li>• Funciona melhor com tabelas bem estruturadas</li>
            <li>• Tabelas complexas ou mal formatadas podem não ser detectadas corretamente</li>
            <li>• PDFs escaneados (imagens) podem ter resultados limitados</li>
            <li>• A formatação original pode não ser preservada completamente</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}
