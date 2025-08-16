'use client';

import { useState, useRef } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Upload, PenTool, Type, Image as ImageIcon, Download, X } from 'lucide-react';
import { saveAs } from 'file-saver';
import { getTranslations } from '@/config/language';
import Image from 'next/image';

interface Signature {
  id: string;
  type: 'draw' | 'text' | 'image';
  data: string; // base64 para draw/image, texto para text
  x: number;
  y: number;
  width: number;
  height: number;
  font?: string;
  fontSize?: number;
  color?: string;
}

interface PDFPage {
  pageNumber: number;
  canvas: HTMLCanvasElement;
  signatures: Signature[];
}

export default function AssinarPdfPage() {
  const t = getTranslations();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pdfPages, setPdfPages] = useState<PDFPage[]>([]);
  
  // Modos de assinatura
  const [signatureMode, setSignatureMode] = useState<'draw' | 'text' | 'image' | null>(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  
  // Assinatura por desenho
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingData, setDrawingData] = useState<string>('');
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // Assinatura por texto
  const [textSignature, setTextSignature] = useState('');
  const [textFont, setTextFont] = useState('Arial');
  const [textSize, setTextSize] = useState(24);
  const [textColor, setTextColor] = useState('#000000');
  
  // Assinatura por imagem
  const [imageSignature, setImageSignature] = useState<string>('');
  
  // Preview e posicionamento
  const [isPositioning, setIsPositioning] = useState(false);
  const [previewSignature, setPreviewSignature] = useState<Omit<Signature, 'id'> | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      await loadPDF(file);
    } else {
      alert(t.pdfSignature?.invalidFile || 'Por favor, selecione um arquivo PDF válido.');
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      await loadPDF(file);
    }
  };

  const loadPDF = async (file: File) => {
    setIsLoading(true);
    try {
      const pdfjsLib = await import('pdfjs-dist');
      
      // Configurar worker
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
      }
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setPageCount(pdf.numPages);
      
      // Renderizar todas as páginas
      const pages: PDFPage[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        }).promise;
        
        pages.push({
          pageNumber: i,
          canvas,
          signatures: []
        });
      }
      
      setPdfPages(pages);
      setCurrentPage(1);
    } catch (error) {
      console.error('Erro ao carregar PDF:', error);
      alert(t.pdfSignature?.loadError || 'Erro ao carregar PDF. Verifique se o arquivo não está corrompido.');
    } finally {
      setIsLoading(false);
    }
  };

  // Funções para desenhar assinatura
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d')!;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d')!;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = drawCanvasRef.current;
    if (canvas) {
      setDrawingData(canvas.toDataURL());
    }
  };

  const clearDrawing = () => {
    const canvas = drawCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setDrawingData('');
    }
  };

  // Gerar assinatura de texto
  const generateTextSignature = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    ctx.font = `${textSize}px ${textFont}`;
    const metrics = ctx.measureText(textSignature);
    
    canvas.width = metrics.width + 20;
    canvas.height = textSize + 10;
    
    ctx.font = `${textSize}px ${textFont}`;
    ctx.fillStyle = textColor;
    ctx.textBaseline = 'middle';
    ctx.fillText(textSignature, 10, canvas.height / 2);
    
    return canvas.toDataURL();
  };

  // Função para adicionar assinatura
  const addSignature = () => {
    if (!previewSignature) return;
    
    const currentPdfPage = pdfPages.find(p => p.pageNumber === currentPage);
    if (!currentPdfPage) return;
    
    const newSignature: Signature = {
      ...previewSignature,
      id: Math.random().toString(36).substr(2, 9)
    };
    
    currentPdfPage.signatures.push(newSignature);
    setPdfPages([...pdfPages]);
    setPreviewSignature(null);
    setIsPositioning(false);
    setShowSignatureModal(false);
  };

  // Função para posicionar assinatura
  const positionSignature = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!previewSignature) return;
    
    const canvas = pdfCanvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setPreviewSignature({
      ...previewSignature,
      x,
      y
    });
  };

  // Salvar PDF com assinaturas
  const savePDF = async () => {
    if (!selectedFile || pdfPages.length === 0) return;

    try {
      const { PDFDocument } = await import('pdf-lib');
      
      const existingPdfBytes = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      
      for (let i = 0; i < pdfPages.length; i++) {
        const pdfPage = pdfPages[i];
        const page = pdfDoc.getPage(i);
        
        for (const signature of pdfPage.signatures) {
          try {
            const imageBytes = Uint8Array.from(atob(signature.data.split(',')[1]), c => c.charCodeAt(0));
            const image = await pdfDoc.embedPng(imageBytes);
            
            const { width: pageWidth, height: pageHeight } = page.getSize();
            const scale = pageWidth / pdfPage.canvas.width;
            
            page.drawImage(image, {
              x: signature.x * scale,
              y: pageHeight - (signature.y + signature.height) * scale,
              width: signature.width * scale,
              height: signature.height * scale,
            });
          } catch (error) {
            console.error('Erro ao adicionar assinatura:', error);
          }
        }
      }
      
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const fileName = selectedFile.name.replace('.pdf', '_assinado.pdf');
      saveAs(blob, fileName);
      
      alert('PDF assinado salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar PDF:', error);
      alert('Erro ao salvar PDF assinado.');
    }
  };

  // Preparar assinatura para posicionamento
  const prepareSignature = (type: 'draw' | 'text' | 'image') => {
    let data = '';
    const width = 100;
    const height = 50;
    
    if (type === 'draw' && drawingData) {
      data = drawingData;
    } else if (type === 'text' && textSignature) {
      data = generateTextSignature();
    } else if (type === 'image' && imageSignature) {
      data = imageSignature;
    } else {
      alert('Por favor, crie uma assinatura primeiro.');
      return;
    }
    
    setPreviewSignature({
      type,
      data,
      x: 100,
      y: 100,
      width,
      height
    });
    setIsPositioning(true);
    setShowSignatureModal(false);
  };

  // Renderizar página atual com assinaturas
  const renderCurrentPage = () => {
    const currentPdfPage = pdfPages.find(p => p.pageNumber === currentPage);
    if (!currentPdfPage) return null;
    
    return (
      <div className="relative">
        <canvas
          ref={pdfCanvasRef}
          width={currentPdfPage.canvas.width}
          height={currentPdfPage.canvas.height}
          className="border border-gray-300 cursor-crosshair"
          style={{
            backgroundImage: `url(${currentPdfPage.canvas.toDataURL()})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat'
          }}
          onClick={isPositioning ? positionSignature : undefined}
        />
        
        {/* Renderizar assinaturas existentes */}
        {currentPdfPage.signatures.map((signature) => (
          <div
            key={signature.id}
            className="absolute border-2 border-blue-500 bg-blue-100 bg-opacity-50"
            style={{
              left: signature.x,
              top: signature.y,
              width: signature.width,
              height: signature.height
            }}
          >
            <Image src={signature.data} alt="Assinatura" className="w-full h-full object-contain" fill style={{objectFit: 'contain'}} />
          </div>
        ))}
        
        {/* Preview da assinatura sendo posicionada */}
        {previewSignature && isPositioning && (
          <div
            className="absolute border-2 border-green-500 bg-green-100 bg-opacity-50"
            style={{
              left: previewSignature.x,
              top: previewSignature.y,
              width: previewSignature.width,
              height: previewSignature.height
            }}
          >
            <Image src={previewSignature.data} alt="Preview" className="w-full h-full object-contain" fill style={{objectFit: 'contain'}} />
          </div>
        )}
      </div>
    );
  };

  return (
    <ToolLayout
      title={t.pdfSignature?.title || "Assinar PDF"}
      description={t.pdfSignature?.description || "Adicione assinatura digital aos seus documentos PDF de forma segura e profissional."}
    >
      <div className="space-y-6">
        {/* Upload Area */}
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            {t.pdfSignature?.selectFile || "Selecione ou arraste um arquivo PDF"}
          </h3>
          <p className="text-gray-600 mb-4">
            {t.pdfSignature?.addSignatures || "Adicione assinaturas digitais ao seu documento"}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Upload size={20} className="text-blue-600" />
            <span className="text-blue-600 font-medium">{t.pdfSignature?.choosePdf || "Escolher PDF"}</span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Informações do arquivo */}
        {selectedFile && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-blue-900">{selectedFile.name}</h4>
                <p className="text-sm text-blue-700">{pageCount} {pageCount !== 1 ? (t.pdfSignature?.pages || 'páginas') : (t.pdfSignature?.page || 'página')}</p>
              </div>
              <button
                onClick={() => setShowSignatureModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <PenTool size={16} />
                {t.pdfSignature?.addSignature || "Adicionar Assinatura"}
              </button>
            </div>
          </div>
        )}

        {/* Visualização do PDF */}
        {pdfPages.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {t.pdfSignature?.pageOf || "Página"} {currentPage} {t.pdfSignature?.of || "de"} {pageCount}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded disabled:opacity-50"
                >
                  ←
                </button>
                <span className="px-3 py-1 bg-gray-100 rounded">
                  {currentPage}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(pageCount, currentPage + 1))}
                  disabled={currentPage === pageCount}
                  className="p-2 border border-gray-300 rounded disabled:opacity-50"
                >
                  →
                </button>
              </div>
            </div>

            {isPositioning && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm">
                  📍 {t.pdfSignature?.clickPosition || "Clique na posição onde deseja adicionar a assinatura"}
                </p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={addSignature}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                  >
                    {t.pdfSignature?.confirmPosition || "Confirmar Posição"}
                  </button>
                  <button
                    onClick={() => setIsPositioning(false)}
                    className="bg-gray-600 text-white px-3 py-1 rounded text-sm"
                  >
                    {t.pdfSignature?.cancel || "Cancelar"}
                  </button>
                </div>
              </div>
            )}

            <div className="overflow-auto">
              {renderCurrentPage()}
            </div>

            {/* Botão de salvar */}
            {pdfPages.some(p => p.signatures.length > 0) && (
              <div className="text-center mt-6">
                <button
                  onClick={savePDF}
                  className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-3 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 flex items-center gap-3 mx-auto shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Download size={20} />
                  <span className="font-medium">{t.pdfSignature?.savePdf || "Salvar PDF Assinado"}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Modal de Assinatura */}
        {showSignatureModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">{t.pdfSignature?.createSignature || "Criar Assinatura"}</h3>
                <button
                  onClick={() => setShowSignatureModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Métodos de assinatura */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <button
                  onClick={() => setSignatureMode('draw')}
                  className={`p-4 border-2 rounded-lg transition-colors ${
                    signatureMode === 'draw' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}
                >
                  <PenTool className="mx-auto mb-2" size={24} />
                  <div>{t.pdfSignature?.draw || "Desenhar"}</div>
                </button>
                <button
                  onClick={() => setSignatureMode('text')}
                  className={`p-4 border-2 rounded-lg transition-colors ${
                    signatureMode === 'text' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}
                >
                  <Type className="mx-auto mb-2" size={24} />
                  <div>{t.pdfSignature?.type || "Digitar"}</div>
                </button>
                <button
                  onClick={() => setSignatureMode('image')}
                  className={`p-4 border-2 rounded-lg transition-colors ${
                    signatureMode === 'image' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}
                >
                  <ImageIcon className="mx-auto mb-2" size={24} />
                  <div>{t.pdfSignature?.upload || "Upload"}</div>
                </button>
              </div>

              {/* Interface para desenhar */}
              {signatureMode === 'draw' && (
                <div className="space-y-4">
                  <h4 className="font-semibold">{t.pdfSignature?.drawSignature || "Desenhe sua assinatura:"}</h4>
                  <canvas
                    ref={drawCanvasRef}
                    width={500}
                    height={200}
                    className="border border-gray-300 cursor-crosshair w-full"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={clearDrawing}
                      className="bg-red-600 text-white px-4 py-2 rounded"
                    >
                      {t.pdfSignature?.clear || "Limpar"}
                    </button>
                    <button
                      onClick={() => prepareSignature('draw')}
                      disabled={!drawingData}
                      className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                    >
                      {t.pdfSignature?.useSignature || "Usar Assinatura"}
                    </button>
                  </div>
                </div>
              )}

              {/* Interface para texto */}
              {signatureMode === 'text' && (
                <div className="space-y-4">
                  <h4 className="font-semibold">{t.pdfSignature?.typeSignature || "Digite sua assinatura:"}</h4>
                  <input
                    type="text"
                    value={textSignature}
                    onChange={(e) => setTextSignature(e.target.value)}
                    placeholder={t.pdfSignature?.typeName || "Digite seu nome"}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                  <div className="grid grid-cols-3 gap-4">
                    <select
                      value={textFont}
                      onChange={(e) => setTextFont(e.target.value)}
                      className="p-2 border border-gray-300 rounded"
                    >
                      <option value="Arial">Arial</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Courier New">Courier New</option>
                    </select>
                    <input
                      type="range"
                      min="16"
                      max="48"
                      value={textSize}
                      onChange={(e) => setTextSize(parseInt(e.target.value))}
                      className="p-2"
                    />
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="p-1 border border-gray-300 rounded"
                    />
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div
                      style={{
                        fontFamily: textFont,
                        fontSize: `${textSize}px`,
                        color: textColor
                      }}
                    >
                      {textSignature || (t.pdfSignature?.signaturePreview || 'Preview da assinatura')}
                    </div>
                  </div>
                  <button
                    onClick={() => prepareSignature('text')}
                    disabled={!textSignature}
                    className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                  >
                    {t.pdfSignature?.useSignature || "Usar Assinatura"}
                  </button>
                </div>
              )}

              {/* Interface para upload */}
              {signatureMode === 'image' && (
                <div className="space-y-4">
                  <h4 className="font-semibold">{t.pdfSignature?.uploadImage || "Faça upload de uma imagem:"}</h4>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          setImageSignature(e.target?.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                  {imageSignature && (
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <Image src={imageSignature} alt="Preview" className="max-h-32 mx-auto" width={200} height={128} style={{objectFit: 'contain'}} />
                    </div>
                  )}
                  <button
                    onClick={() => prepareSignature('image')}
                    disabled={!imageSignature}
                    className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                  >
                    {t.pdfSignature?.useSignature || "Usar Assinatura"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Estado vazio */}
        {!selectedFile && (
          <div className="text-center py-8 text-gray-600">
            <PenTool className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="font-medium text-gray-700">{t.pdfSignature?.noPdfSelected || "Nenhum PDF selecionado"}</p>
            <p className="text-sm mt-1 text-gray-500">{t.pdfSignature?.selectPdfToSign || "Selecione um arquivo PDF para adicionar assinaturas"}</p>
          </div>
        )}

        {/* Informações */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">💡 {t.pdfSignature?.usageTips || "Dicas de Uso:"}:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• {t.pdfSignature?.drawTip || "Desenhe: Use o mouse ou touch para criar uma assinatura à mão livre"}</li>
            <li>• {t.pdfSignature?.typeTip || "Digite: Crie uma assinatura tipográfica personalizada"}</li>
            <li>• {t.pdfSignature?.uploadTip || "Upload: Use uma imagem existente da sua assinatura"}</li>
            <li>• {t.pdfSignature?.clickTip || "Clique na posição desejada para adicionar a assinatura"}</li>
            <li>• {t.pdfSignature?.multipleTip || "Você pode adicionar múltiplas assinaturas em diferentes páginas"}</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}
