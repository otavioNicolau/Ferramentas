'use client';

import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { useI18n } from '@/i18n/client';
import { Upload, FileText, Minimize2 } from 'lucide-react';
import { saveAs } from 'file-saver';

export default function CompactarPDFPage() {
  const { t } = useI18n();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [compressionLevel, setCompressionLevel] = useState<string>('medium');
  const [progress, setProgress] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  const compressionOptions = [
    { value: 'light', label: 'Leve (90% qualidade)', description: 'Compressão suave', quality: 0.9, color: 'text-blue-600' },
    { value: 'medium', label: 'Médio (70% qualidade)', description: 'Equilibrio qualidade/tamanho', quality: 0.7, color: 'text-green-600' },
    { value: 'high', label: 'Alto (50% qualidade)', description: 'Mais compressão', quality: 0.5, color: 'text-orange-600' },
    { value: 'maximum', label: 'Máximo (30% qualidade)', description: 'Máxima compressão', quality: 0.3, color: 'text-red-600' },
  ];

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (file: File) => {
    if (file.type === 'application/pdf') {
      setSelectedFile(file);
      setOriginalSize(file.size);
      setCompressedSize(0);
      setProgress(0);
      setCurrentPage(0);
      setTotalPages(0);
    } else {
      alert('Por favor, selecione um arquivo PDF válido.');
    }
  };

  // Função de compressão usando Canvas (funciona para todos os tipos de PDF)
  const canvasPDFCompression = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);

    try {
      // Importar pdfjsLib dinamicamente
      const pdfjsLib = await import('pdfjs-dist');
      const jsPDF = (await import('jspdf')).jsPDF;
      
      // Configurar worker
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';

      const selectedOption = compressionOptions.find(opt => opt.value === compressionLevel);
      const quality = selectedOption?.quality || 0.7;

      console.log(`Iniciando compressão com qualidade ${quality}`);

      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      setTotalPages(pdf.numPages);
      console.log(`PDF carregado: ${pdf.numPages} páginas`);

      // Criar novo PDF
      const newPDF = new jsPDF();
      let isFirstPage = true;

      for (let i = 1; i <= pdf.numPages; i++) {
        setCurrentPage(i);
        setProgress((i / pdf.numPages) * 100);
        console.log(`Processando página ${i}/${pdf.numPages}`);
        
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });

        // Criar canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) {
          throw new Error('Não foi possível criar contexto do canvas');
        }
        
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Renderizar página no canvas
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
          canvas: canvas
        };
        await page.render(renderContext).promise;

        // Converter canvas para imagem comprimida
        const imgData = canvas.toDataURL('image/jpeg', quality);

        // Calcular dimensões para o PDF
        const pdfWidth = 210; // A4 width em mm
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        if (!isFirstPage) {
          newPDF.addPage();
        }
        isFirstPage = false;

        // Adicionar imagem comprimida ao PDF
        newPDF.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      }

      // Gerar PDF comprimido
      const compressedPdfBlob = newPDF.output('blob');
      setCompressedSize(compressedPdfBlob.size);

      // Download
      saveAs(compressedPdfBlob, `compressed_${selectedFile.name}`);

      console.log(`Compressão concluída: ${originalSize} -> ${compressedPdfBlob.size} bytes`);
      console.log(`Redução: ${((originalSize - compressedPdfBlob.size) / originalSize * 100).toFixed(1)}%`);
      
      // Reset progress
      setProgress(100);
      setTimeout(() => {
        setProgress(0);
        setCurrentPage(0);
        setTotalPages(0);
      }, 1000);
      
    } catch (error) {
      console.error('Erro ao comprimir PDF:', error);
      alert('Erro ao comprimir o PDF. Verifique se o arquivo é válido.');
    } finally {
      setIsProcessing(false);
    }
  };

  const compressionRatio = originalSize && compressedSize 
    ? parseFloat(((originalSize - compressedSize) / originalSize * 100).toFixed(1))
    : 0;

  return (
    <ToolLayout
      title={t.compressPdfTitle}
      description={t.compressPdfDescription}
    >
      <div className="space-y-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Selecione um arquivo PDF
          </h3>
          <p className="text-gray-500 mb-4">
            Clique para selecionar ou arraste um arquivo PDF aqui
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
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 cursor-pointer inline-block transition-colors"
          >
            Escolher Arquivo PDF
          </label>
        </div>

        {selectedFile && (
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Arquivo Selecionado</h3>
            
            <div className="bg-white rounded-lg p-4 flex items-center mb-6">
              <FileText className="text-red-500 mr-3" size={32} />
              <div>
                <div className="font-medium">{selectedFile.name}</div>
                <div className="text-sm text-gray-500">
                  Tamanho: {formatFileSize(originalSize)}
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <h4 className="text-lg font-semibold text-gray-800">Nível de Compressão</h4>
              <div className="space-y-3">
                {compressionOptions.map((option) => (
                  <label key={option.value} className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="compression"
                      value={option.value}
                      checked={compressionLevel === option.value}
                      onChange={(e) => setCompressionLevel(e.target.value)}
                      className="mt-1"
                    />
                    <div>
                      <div className={`font-medium ${option.color}`}>{option.label}</div>
                      <div className="text-sm text-gray-600">{option.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {isProcessing && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-blue-800">
                    Processando página {currentPage} de {totalPages}
                  </span>
                  <span className="text-sm font-medium text-blue-800">
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="text-xs text-blue-600 mt-2 text-center">
                  Comprimindo arquivo com qualidade {compressionOptions.find(opt => opt.value === compressionLevel)?.quality}...
                </div>
              </div>
            )}

            {compressedSize > 0 && (
              <div className="mt-4 p-4 border rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <h4 className="font-semibold mb-3 text-green-800 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Compressão realizada com sucesso!
                </h4>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between items-center p-2 bg-white rounded">
                    <span className="text-gray-700">Original:</span>
                    <span className="font-medium text-gray-900">{formatFileSize(originalSize)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded">
                    <span className="text-gray-700">Compactado:</span>
                    <span className="font-medium text-gray-900">{formatFileSize(compressedSize)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-green-100 rounded border-t-2 border-green-300">
                    <span className="font-medium text-green-800">Redução:</span>
                    <span className="font-bold text-green-700 text-lg">
                      {compressionRatio > 0 ? `-${compressionRatio}%` : 'Sem redução'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 text-center">
              <button
                onClick={canvasPDFCompression}
                disabled={isProcessing}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Minimize2 size={20} />
                <span className="font-medium">
                  {isProcessing ? 'Compactando...' : 'Compactar PDF'}
                </span>
                {isProcessing && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
