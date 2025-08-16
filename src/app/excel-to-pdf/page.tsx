'use client';

import { useState, useRef } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { useI18n } from '@/i18n/client';
import { FileSpreadsheet, Download, FileText, X, Settings, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface SheetData {
  name: string;
  data: any[][];
  selected: boolean;
}

interface ConversionOptions {
  pageOrientation: 'portrait' | 'landscape';
  fontSize: number;
  includeHeaders: boolean;
  fitToPage: boolean;
  marginSize: 'small' | 'medium' | 'large';
  renderMode: 'simple' | 'table';
  tableStyle: 'grid' | 'striped' | 'plain';
}

export default function ExcelToPdfPage() {
  const { t } = useI18n();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sheets, setSheets] = useState<SheetData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<ConversionOptions>({
    pageOrientation: 'landscape',
    fontSize: 10,
    includeHeaders: true,
    fitToPage: true,
    marginSize: 'medium',
    renderMode: 'table',
    tableStyle: 'grid'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await processFile(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      setError('Por favor, selecione um arquivo Excel válido (.xlsx ou .xls)');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setSheets([]);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      const extractedSheets: SheetData[] = workbook.SheetNames.map(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
        
        return {
          name: sheetName,
          data: data as any[][],
          selected: true
        };
      });

      setSheets(extractedSheets);
    } catch (err) {
      setError('Erro ao ler o arquivo Excel. Verifique se o arquivo não está corrompido.');
      console.error('Erro ao processar Excel:', err);
    }
  };

  const toggleSheetSelection = (index: number) => {
    setSheets(prev => prev.map((sheet, i) => 
      i === index ? { ...sheet, selected: !sheet.selected } : sheet
    ));
  };

  const getMarginSize = (size: string) => {
    switch (size) {
      case 'small': return 10;
      case 'large': return 30;
      default: return 20;
    }
  };

  const convertToPdf = async () => {
    if (sheets.length === 0) return;

    const selectedSheets = sheets.filter(sheet => sheet.selected);
    if (selectedSheets.length === 0) {
      setError('Selecione pelo menos uma planilha para converter');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const pdf = new jsPDF({
        orientation: options.pageOrientation,
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = getMarginSize(options.marginSize);

      let isFirstPage = true;

      for (let sheetIndex = 0; sheetIndex < selectedSheets.length; sheetIndex++) {
        const sheet = selectedSheets[sheetIndex];
        setProgress(((sheetIndex + 1) / selectedSheets.length) * 100);

        if (!isFirstPage) {
          pdf.addPage();
        }
        isFirstPage = false;

        // Título da planilha
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(sheet.name, margin, margin + 10);

        if (sheet.data.length === 0) {
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'normal');
          pdf.text('Planilha vazia', margin, margin + 25);
          continue;
        }

        // Filtrar dados válidos (remover linhas totalmente vazias)
        const validData = sheet.data.filter(row => 
          row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== '')
        );

        if (validData.length === 0) {
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'normal');
          pdf.text('Planilha sem dados válidos', margin, margin + 25);
          continue;
        }

        // Preparar dados para autoTable
        const tableData: string[][] = [];
        let headers: string[] = [];

        // Processar cabeçalhos se estiver habilitado
        if (options.includeHeaders && validData.length > 0) {
          headers = validData[0].map((cell, index) => {
            const cellValue = String(cell || '').trim();
            return cellValue || `Coluna ${index + 1}`;
          });
          
          // Remover colunas vazias do final
          while (headers.length > 0 && headers[headers.length - 1] === `Coluna ${headers.length}`) {
            const hasDataInColumn = validData.slice(1).some(row => 
              row[headers.length - 1] && String(row[headers.length - 1]).trim()
            );
            if (!hasDataInColumn) {
              headers.pop();
            } else {
              break;
            }
          }
          
          // Processar dados (pular primeira linha se for cabeçalho)
          for (let i = 1; i < validData.length; i++) {
            const row = validData[i];
            const processedRow: string[] = [];
            
            for (let j = 0; j < headers.length; j++) {
              const cellValue = String(row[j] || '').trim();
              processedRow.push(cellValue);
            }
            
            // Só adicionar se a linha tem algum conteúdo
            if (processedRow.some(cell => cell !== '')) {
              tableData.push(processedRow);
            }
          }
        } else {
          // Sem cabeçalhos - processar todos os dados
          const maxCols = Math.max(...validData.map(row => {
            let lastNonEmptyIndex = -1;
            for (let i = row.length - 1; i >= 0; i--) {
              if (row[i] !== null && row[i] !== undefined && String(row[i]).trim() !== '') {
                lastNonEmptyIndex = i;
                break;
              }
            }
            return lastNonEmptyIndex + 1;
          }));

          headers = Array.from({ length: maxCols }, (_, i) => `Coluna ${i + 1}`);
          
          for (const row of validData) {
            const processedRow: string[] = [];
            
            for (let j = 0; j < maxCols; j++) {
              const cellValue = String(row[j] || '').trim();
              processedRow.push(cellValue);
            }
            
            if (processedRow.some(cell => cell !== '')) {
              tableData.push(processedRow);
            }
          }
        }

        // Configurar estilos da tabela
        const tableOptions: any = {
          startY: margin + 20,
          head: options.includeHeaders ? [headers] : undefined,
          body: tableData,
          theme: options.renderMode === 'table' ? options.tableStyle : 'plain',
          styles: {
            fontSize: options.fontSize,
            cellPadding: 3,
            overflow: 'linebreak',
            halign: 'left',
            valign: 'middle',
          },
          headStyles: {
            fillColor: options.tableStyle === 'grid' ? [66, 139, 202] as [number, number, number] : [52, 58, 64] as [number, number, number],
            textColor: [255, 255, 255] as [number, number, number],
            fontStyle: 'bold',
            fontSize: options.fontSize + 1,
            halign: 'center',
          },
          alternateRowStyles: options.tableStyle === 'striped' ? {
            fillColor: [248, 249, 250] as [number, number, number],
          } : {},
          margin: { 
            top: margin + 25, 
            right: margin, 
            bottom: margin, 
            left: margin 
          },
          tableWidth: 'auto',
          columnStyles: {} as any,
          didDrawPage: (data: any) => {
            // Adicionar rodapé com número da página
            const pageNumber = (pdf as any).internal.getNumberOfPages();
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'normal');
            pdf.text(
              `Página ${pageNumber}`,
              pageWidth / 2,
              pageHeight - 10,
              { align: 'center' }
            );
          },
        };

        // Ajustar largura das colunas se necessário
        if (options.fitToPage && headers.length > 0) {
          const availableWidth = pageWidth - (margin * 2);
          const columnWidth = availableWidth / headers.length;
          
          headers.forEach((_, index) => {
            tableOptions.columnStyles[index] = {
              cellWidth: columnWidth,
            };
          });
        }

        // Renderizar tabela
        autoTable(pdf, tableOptions);

        // Pequena pausa para não travar a UI
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Gerar e baixar o PDF
      const pdfBlob = pdf.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedFile?.name.replace(/\.[^/.]+$/, '') || 'planilha'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (err) {
      setError('Erro ao gerar PDF. Tente novamente.');
      console.error('Erro na conversão:', err);
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const clearAll = () => {
    setSelectedFile(null);
    setSheets([]);
    setError(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <ToolLayout
      title={t.excelToPdfTitle}
      description={t.excelToPdfDescription}
    >
      <div className="space-y-6">
        {/* Upload Area */}
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
        >
          <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            Selecione um arquivo Excel
          </h3>
          <p className="text-gray-600 mb-4">
            Arraste e solte ou clique para selecionar um arquivo .xlsx ou .xls
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="text-xs text-gray-500">
            Suporte: Excel (.xlsx, .xls) • Máximo: 50MB
          </div>
        </div>

        {/* Arquivo selecionado */}
        {selectedFile && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileSpreadsheet size={20} className="text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">{selectedFile.name}</p>
                  <p className="text-sm text-blue-700">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {sheets.length} planilha{sheets.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={clearAll}
                className="text-red-600 hover:text-red-700 p-2"
                title="Remover arquivo"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Seleção de planilhas */}
        {sheets.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Planilhas Encontradas</h3>
            <div className="space-y-3">
              {sheets.map((sheet, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                  <input
                    type="checkbox"
                    checked={sheet.selected}
                    onChange={() => toggleSheetSelection(index)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{sheet.name}</div>
                    <div className="text-sm text-gray-500">
                      {sheet.data.length} linha{sheet.data.length !== 1 ? 's' : ''} • 
                      {sheet.data[0]?.length || 0} coluna{(sheet.data[0]?.length || 0) !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Opções de conversão */}
        {sheets.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings size={20} className="text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-800">Opções de Conversão</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modo de Renderização
                </label>
                <select
                  value={options.renderMode}
                  onChange={(e) => setOptions({...options, renderMode: e.target.value as 'simple' | 'table'})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="table">Tabela (recomendado)</option>
                  <option value="simple">Simples</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estilo da Tabela
                </label>
                <select
                  value={options.tableStyle}
                  onChange={(e) => setOptions({...options, tableStyle: e.target.value as 'grid' | 'striped' | 'plain'})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={options.renderMode === 'simple'}
                >
                  <option value="grid">Grade (com bordas)</option>
                  <option value="striped">Listrado</option>
                  <option value="plain">Simples</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Orientação da Página
                </label>
                <select
                  value={options.pageOrientation}
                  onChange={(e) => setOptions({...options, pageOrientation: e.target.value as 'portrait' | 'landscape'})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="landscape">Paisagem (recomendado)</option>
                  <option value="portrait">Retrato</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tamanho da Fonte
                </label>
                <select
                  value={options.fontSize}
                  onChange={(e) => setOptions({...options, fontSize: parseInt(e.target.value)})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="8">8pt (Muito pequeno)</option>
                  <option value="10">10pt (Pequeno)</option>
                  <option value="12">12pt (Normal)</option>
                  <option value="14">14pt (Grande)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Margens
                </label>
                <select
                  value={options.marginSize}
                  onChange={(e) => setOptions({...options, marginSize: e.target.value as 'small' | 'medium' | 'large'})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="small">Pequenas</option>
                  <option value="medium">Médias</option>
                  <option value="large">Grandes</option>
                </select>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.includeHeaders}
                  onChange={(e) => setOptions({...options, includeHeaders: e.target.checked})}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                />
                <span className="text-sm text-gray-700">Destacar primeira linha como cabeçalho</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.fitToPage}
                  onChange={(e) => setOptions({...options, fitToPage: e.target.checked})}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                />
                <span className="text-sm text-gray-700">Ajustar colunas à largura da página</span>
              </label>
            </div>
          </div>
        )}

        {/* Erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Progresso */}
        {isProcessing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-blue-900">
                Convertendo Excel para PDF...
              </span>
              <span className="text-sm font-bold text-blue-900">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Botão de conversão */}
        {sheets.length > 0 && (
          <div className="text-center">
            <button
              onClick={convertToPdf}
              disabled={isProcessing || sheets.filter(s => s.selected).length === 0}
              className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-3 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Download size={20} />
              <span className="font-medium">
                {isProcessing ? 'Convertendo...' : `Converter para PDF (${sheets.filter(s => s.selected).length} planilha${sheets.filter(s => s.selected).length !== 1 ? 's' : ''})`}
              </span>
              {isProcessing && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              )}
            </button>
          </div>
        )}

        {/* Estado vazio */}
        {!selectedFile && (
          <div className="text-center py-12 text-gray-600">
            <FileSpreadsheet className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="font-medium text-gray-700">Nenhum arquivo Excel selecionado</p>
            <p className="text-sm mt-1 text-gray-500">Selecione um arquivo .xlsx ou .xls para começar</p>
          </div>
        )}

        {/* Informações */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">💡 Dicas de Uso:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use modo "Tabela" com estilo "Grade" para melhor formatação profissional</li>
            <li>• Estilo "Listrado" alterna cores das linhas para melhor leitura</li>
            <li>• Use orientação paisagem para planilhas com muitas colunas</li>
            <li>• Ajuste o tamanho da fonte conforme necessário</li>
            <li>• O PDF incluirá numeração automática de páginas</li>
            <li>• Recomendado para planilhas com até 1000 linhas</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}
