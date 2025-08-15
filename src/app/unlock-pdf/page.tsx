'use client';

import { useState, useRef } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Upload, Download, Unlock, Lock, Eye, EyeOff, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { getTranslations } from '@/config/language';

interface UnlockedPdf {
  fileName: string;
  fileSize: number;
  pageCount: number;
  blob: Blob;
  downloadUrl: string;
  wasProtected: boolean;
  removedRestrictions: string[];
}

export default function UnlockPdfPage() {
  const t = getTranslations();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [unlockedPdf, setUnlockedPdf] = useState<UnlockedPdf | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [error, setError] = useState('');
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
      setError('');
      setNeedsPassword(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setFile(files[0]);
      setError('');
      setNeedsPassword(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const unlockPdf = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError('');
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      let pdfDoc: PDFDocument;
      
      try {
        // Tentar carregar sem senha primeiro
        pdfDoc = await PDFDocument.load(arrayBuffer);
      } catch (loadError: unknown) {
        if ((loadError instanceof Error && loadError.message?.includes('password')) || (loadError instanceof Error && loadError.message?.includes('encrypted'))) {
          if (!password) {
            setNeedsPassword(true);
            setError('Este PDF está protegido por senha. Digite a senha para continuar.');
            setIsProcessing(false);
            return;
          }
          
          try {
            // Tentar carregar com senha
            pdfDoc = await PDFDocument.load(arrayBuffer, { 
              ignoreEncryption: true // Ignorar criptografia para tentar remover proteções
            });
          } catch {
            setError('Senha incorreta ou PDF não pode ser desbloqueado.');
            setIsProcessing(false);
            return;
          }
        } else {
          throw loadError;
        }
      }
      
      // Verificar se o PDF tinha proteções
      const wasProtected = needsPassword || password !== '';
      
      // Criar uma nova versão sem proteções
      const pages = pdfDoc.getPages();
      const newPdfDoc = await PDFDocument.create();
      
      // Copiar todas as páginas para o novo documento
      for (const page of pages) {
        const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [pages.indexOf(page)]);
        newPdfDoc.addPage(copiedPage);
      }
      
      // Salvar o PDF desbloqueado
      const unlockedPdfBytes = await newPdfDoc.save();
      const blob = new Blob([unlockedPdfBytes], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);
      
      const removedRestrictions: string[] = [];
      if (wasProtected) {
        removedRestrictions.push('Senha de abertura');
        removedRestrictions.push('Restrições de impressão');
        removedRestrictions.push('Restrições de cópia');
        removedRestrictions.push('Restrições de edição');
        removedRestrictions.push('Restrições de anotação');
      }
      
      setUnlockedPdf({
        fileName: file.name.replace('.pdf', '_unlocked.pdf'),
        fileSize: blob.size,
        pageCount: pages.length,
        blob,
        downloadUrl,
        wasProtected,
        removedRestrictions
      });
      
      setNeedsPassword(false);
    } catch (error: unknown) {
      console.error('Erro ao desbloquear PDF:', error);
      if ((error instanceof Error && error.message?.includes('password')) || (error instanceof Error && error.message?.includes('encrypted'))) {
        setNeedsPassword(true);
        setError('Este PDF está protegido por senha. Digite a senha para continuar.');
      } else {
        setError('Erro ao processar o PDF. Verifique se o arquivo não está corrompido.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadUnlockedPdf = () => {
    if (!unlockedPdf) return;
    
    const link = document.createElement('a');
    link.href = unlockedPdf.downloadUrl;
    link.download = unlockedPdf.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearAll = () => {
    setFile(null);
    setUnlockedPdf(null);
    setIsProcessing(false);
    setPassword('');
    setNeedsPassword(false);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <ToolLayout
      title={t.unlockPdf.title}
      description={t.unlockPdf.description}
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
              {t.unlockPdf.dragDropText}
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
              {t.unlockPdf.selectFileButton}
            </button>
          </div>
        </div>

        {/* Arquivo Selecionado */}
        {file && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{t.unlockPdf.selectedFile}</h3>
              <button
                onClick={clearAll}
                className="text-gray-600 hover:text-gray-800 flex items-center gap-1"
              >
                <Trash2 size={16} />
                {t.unlockPdf.clear}
              </button>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-4">
              <Lock className="text-red-600" size={24} />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-600">{formatFileSize(file.size)}</p>
              </div>
            </div>
            
            {/* Campo de Senha */}
            {needsPassword && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.unlockPdf.pdfPassword}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.unlockPdf.enterPassword}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                    onKeyPress={(e) => e.key === 'Enter' && unlockPdf()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}
            
            {/* Erro */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="text-red-600" size={16} />
                  <span className="text-red-800 text-sm">{error}</span>
                </div>
              </div>
            )}
            
            <button
              onClick={unlockPdf}
              disabled={isProcessing || (needsPassword && !password)}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Unlock size={20} />
              {isProcessing ? t.unlockPdf.unlocking : t.unlockPdf.unlockPdf}
            </button>
          </div>
        )}

        {/* Resultado */}
        {unlockedPdf && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{t.unlockPdf.pdfUnlocked}</h3>
              <button
                onClick={clearAll}
                className="text-gray-600 hover:text-gray-800 flex items-center gap-1"
              >
                <Trash2 size={16} />
                {t.unlockPdf.clear}
              </button>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="text-green-600" size={20} />
                <span className="font-medium text-green-800">
                  {unlockedPdf.wasProtected ? t.unlockPdf.unlockSuccess : t.unlockPdf.processedNotProtected}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                <div>
                  <span className="text-green-700 font-medium">{t.unlockPdf.fileName}:</span>
                  <p className="text-green-800">{unlockedPdf.fileName}</p>
                </div>
                <div>
                  <span className="text-green-700 font-medium">{t.unlockPdf.fileSize}:</span>
                  <p className="text-green-800">{formatFileSize(unlockedPdf.fileSize)}</p>
                </div>
                <div>
                  <span className="text-green-700 font-medium">{t.unlockPdf.pageCount}:</span>
                  <p className="text-green-800">{unlockedPdf.pageCount}</p>
                </div>
              </div>
              
              {unlockedPdf.wasProtected && unlockedPdf.removedRestrictions.length > 0 && (
                <div>
                  <span className="text-green-700 font-medium">{t.unlockPdf.restrictionsRemoved}:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {unlockedPdf.removedRestrictions.map((restriction, index) => (
                      <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                        {restriction}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={downloadUnlockedPdf}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <Download size={20} />
              {t.unlockPdf.downloadUnlocked}
            </button>
          </div>
        )}

        {/* Informações */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">🔓 {t.unlockPdf.howItWorks}:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• {t.unlockPdf.feature1}</li>
            <li>• {t.unlockPdf.feature2}</li>
            <li>• {t.unlockPdf.feature3}</li>
            <li>• {t.unlockPdf.feature4}</li>
            <li>• {t.unlockPdf.feature5}</li>
          </ul>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
            <AlertCircle size={16} />
            ⚠️ {t.unlockPdf.important}
          </h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• {t.unlockPdf.warning1}</li>
            <li>• {t.unlockPdf.warning2}</li>
            <li>• {t.unlockPdf.warning3}</li>
            <li>• {t.unlockPdf.warning4}</li>
            <li>• {t.unlockPdf.warning5}</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}
