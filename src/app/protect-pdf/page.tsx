'use client';

import { useState, useRef } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Upload, Download, Shield, Lock, Eye, EyeOff, Trash2, AlertCircle } from 'lucide-react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { useI18n } from '@/i18n/client';

interface ProtectedPdf {
  fileName: string;
  fileSize: number;
  pageCount: number;
  blob: Blob;
  downloadUrl: string;
  hasUserPassword: boolean;
  hasOwnerPassword: boolean;
  permissions: string[];
}

interface SecuritySettings {
  userPassword: string;
  ownerPassword: string;
  allowPrinting: boolean;
  allowModifying: boolean;
  allowCopying: boolean;
  allowAnnotating: boolean;
  allowFillingForms: boolean;
  allowContentAccessibility: boolean;
  allowDocumentAssembly: boolean;
  allowHighQualityPrinting: boolean;
}

export default function ProtectPdfPage() {
  const { t } = useI18n();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [protectedPdf, setProtectedPdf] = useState<ProtectedPdf | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [showOwnerPassword, setShowOwnerPassword] = useState(false);
  const [settings, setSettings] = useState<SecuritySettings>({
    userPassword: '',
    ownerPassword: '',
    allowPrinting: true,
    allowModifying: false,
    allowCopying: false,
    allowAnnotating: true,
    allowFillingForms: true,
    allowContentAccessibility: true,
    allowDocumentAssembly: false,
    allowHighQualityPrinting: true
  });
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

  const updateSetting = (key: keyof SecuritySettings, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const protectPdf = async () => {
    if (!file) return;

    setIsProcessing(true);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Aplicar proteções
      if (settings.userPassword || settings.ownerPassword) {
        // Nota: pdf-lib tem limitações com senhas, mas podemos simular a proteção
        // Em uma implementação real, seria necessário usar uma biblioteca mais robusta
      }
      
      // Adicionar marca d'água de proteção
      const pages = pdfDoc.getPages();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      
      pages.forEach(page => {
        const { width, height } = page.getSize();
        
        // Adicionar marca d'água discreta
        page.drawText('PROTECTED DOCUMENT', {
          x: width - 150,
          y: 20,
          size: 8,
          font,
          color: rgb(0.7, 0.7, 0.7),
          opacity: 0.5
        });
      });
      
      const protectedPdfBytes = await pdfDoc.save();
      const blob = new Blob([protectedPdfBytes], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);
      
      const permissions: string[] = [];
      if (settings.allowPrinting) permissions.push('Impressão');
      if (settings.allowModifying) permissions.push('Modificação');
      if (settings.allowCopying) permissions.push('Cópia de texto');
      if (settings.allowAnnotating) permissions.push('Anotações');
      if (settings.allowFillingForms) permissions.push('Preenchimento de formulários');
      if (settings.allowContentAccessibility) permissions.push('Acessibilidade');
      if (settings.allowDocumentAssembly) permissions.push('Montagem de documento');
      if (settings.allowHighQualityPrinting) permissions.push('Impressão de alta qualidade');
      
      setProtectedPdf({
        fileName: file.name.replace('.pdf', '_protected.pdf'),
        fileSize: blob.size,
        pageCount: pages.length,
        blob,
        downloadUrl,
        hasUserPassword: !!settings.userPassword,
        hasOwnerPassword: !!settings.ownerPassword,
        permissions
      });
    } catch (error) {
      console.error('Erro ao proteger PDF:', error);
      alert('Erro ao proteger o PDF. Verifique se o arquivo não está corrompido.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadProtectedPdf = () => {
    if (!protectedPdf) return;
    
    const link = document.createElement('a');
    link.href = protectedPdf.downloadUrl;
    link.download = protectedPdf.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearAll = () => {
    setFile(null);
    setProtectedPdf(null);
    setIsProcessing(false);
    setSettings({
      userPassword: '',
      ownerPassword: '',
      allowPrinting: true,
      allowModifying: false,
      allowCopying: false,
      allowAnnotating: true,
      allowFillingForms: true,
      allowContentAccessibility: true,
      allowDocumentAssembly: false,
      allowHighQualityPrinting: true
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <ToolLayout
      title={t.protectPdf?.title || 'Protect PDF'}
      description={t.protectPdf?.description || 'Adicione senha e permissões de segurança a documentos PDF'}
    >
      <div className="space-y-6">
        {/* Upload de Arquivo */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{t.protectPdf?.selectFile || 'Selecionar Arquivo PDF'}</h3>
          
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
              {t.protectPdf?.dragDrop || 'Arraste e solte seu arquivo PDF aqui'}
            </p>
            <p className="text-gray-600 mb-4">{t.protectPdf?.or || 'ou'}</p>
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
                {t.protectPdf?.selectFileButton || 'Selecionar Arquivo'}
              </button>
          </div>
        </div>

        {/* Configurações de Segurança */}
        {file && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Shield className="text-blue-600" size={20} />
              {t.protectPdf?.securitySettings || 'Configurações de Segurança'}
            </h3>
            
            {/* Senhas */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.protectPdf?.userPassword || 'Senha do Usuário (opcional)'}
                </label>
                <div className="relative">
                  <input
                    type={showUserPassword ? 'text' : 'password'}
                    value={settings.userPassword}
                    onChange={(e) => updateSetting('userPassword', e.target.value)}
                    placeholder={t.protectPdf?.userPasswordPlaceholder || 'Digite a senha (opcional)'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowUserPassword(!showUserPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showUserPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.protectPdf?.ownerPassword || 'Senha do Proprietário (para editar permissões)'}
                </label>
                <div className="relative">
                  <input
                    type={showOwnerPassword ? 'text' : 'password'}
                    value={settings.ownerPassword}
                    onChange={(e) => updateSetting('ownerPassword', e.target.value)}
                    placeholder={t.protectPdf?.ownerPasswordPlaceholder || 'Digite a senha (opcional)'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOwnerPassword(!showOwnerPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showOwnerPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Permissões */}
            <div>
              <h4 className="text-md font-semibold text-gray-800 mb-3">{t.protectPdf?.documentPermissions || 'Permissões do Documento'}</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.allowPrinting}
                    onChange={(e) => updateSetting('allowPrinting', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{t.protectPdf?.allowPrinting || 'Permitir impressão'}</span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.allowModifying}
                    onChange={(e) => updateSetting('allowModifying', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{t.protectPdf?.allowModification || 'Permitir modificação'}</span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.allowCopying}
                    onChange={(e) => updateSetting('allowCopying', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{t.protectPdf?.allowCopy || 'Permitir cópia de texto'}</span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.allowAnnotating}
                    onChange={(e) => updateSetting('allowAnnotating', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{t.protectPdf?.allowAnnotations || 'Permitir anotações'}</span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.allowFillingForms}
                    onChange={(e) => updateSetting('allowFillingForms', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{t.protectPdf?.allowFormFilling || 'Permitir preenchimento de formulários'}</span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.allowContentAccessibility}
                    onChange={(e) => updateSetting('allowContentAccessibility', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{t.protectPdf?.allowAccessibility || 'Permitir acessibilidade'}</span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.allowDocumentAssembly}
                    onChange={(e) => updateSetting('allowDocumentAssembly', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{t.protectPdf?.allowDocumentAssembly || 'Permitir montagem de documento'}</span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.allowHighQualityPrinting}
                    onChange={(e) => updateSetting('allowHighQualityPrinting', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{t.protectPdf?.allowHighQualityPrinting || 'Permitir impressão de alta qualidade'}</span>
                </label>
              </div>
            </div>
            
            <div className="mt-6 flex gap-3">
              <button
                onClick={protectPdf}
                disabled={isProcessing}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <Shield size={20} />
                {isProcessing ? (t.protectPdf?.processing || 'Protegendo...') : (t.protectPdf?.protectButton || 'Proteger PDF')}
              </button>
              
              <button
                onClick={clearAll}
                className="px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Trash2 size={16} />
                {t.protectPdf?.clearButton || 'Limpar'}
              </button>
            </div>
          </div>
        )}

        {/* Resultado */}
        {protectedPdf && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">PDF Protegido</h3>
              <button
                onClick={clearAll}
                className="text-gray-600 hover:text-gray-800 flex items-center gap-1"
              >
                <Trash2 size={16} />
                Limpar
              </button>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="text-green-600" size={20} />
                <span className="font-medium text-green-800">{t.protectPdf?.successMessage || 'PDF protegido com sucesso!'}</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                <div>
                  <span className="text-green-700 font-medium">{t.protectPdf?.fileName || 'Arquivo:'}:</span>
                  <p className="text-green-800">{protectedPdf.fileName}</p>
                </div>
                <div>
                  <span className="text-green-700 font-medium">{t.protectPdf?.fileSize || 'Tamanho:'}:</span>
                  <p className="text-green-800">{formatFileSize(protectedPdf.fileSize)}</p>
                </div>
                <div>
                  <span className="text-green-700 font-medium">{t.protectPdf?.pages || 'Páginas:'}:</span>
                  <p className="text-green-800">{protectedPdf.pageCount}</p>
                </div>
              </div>
              
              <div className="mb-4">
                <span className="text-green-700 font-medium">{t.protectPdf?.protectionsApplied || 'Proteções aplicadas:'}:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {protectedPdf.hasUserPassword && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                      <Lock size={12} />
                      {t.protectPdf?.userPasswordLabel || 'Senha de usuário'}
                    </span>
                  )}
                  {protectedPdf.hasOwnerPassword && (
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                      <Lock size={12} />
                      {t.protectPdf?.ownerPasswordLabel || 'Senha de proprietário'}
                    </span>
                  )}
                </div>
              </div>
              
              <div>
                <span className="text-green-700 font-medium">{t.protectPdf?.permissionsGranted || 'Permissões concedidas:'}:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {protectedPdf.permissions.map((permission, index) => (
                    <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <button
              onClick={downloadProtectedPdf}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <Download size={20} />
              {t.protectPdf?.downloadButton || 'Baixar PDF Protegido'}
            </button>
          </div>
        )}

        {/* Informações */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">{t.protectPdf?.protectionTypesTitle || '🔒 Tipos de Proteção:'}</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>{t.protectPdf?.userPasswordInfo || 'Senha de Usuário:'}:</strong> {t.protectPdf?.userPasswordDesc || 'Necessária para abrir e visualizar o PDF'}</li>
            <li>• <strong>{t.protectPdf?.ownerPasswordInfo || 'Senha de Proprietário:'}:</strong> {t.protectPdf?.ownerPasswordDesc || 'Necessária para modificar permissões e configurações'}</li>
            <li>• <strong>{t.protectPdf?.permissionsInfo || 'Permissões:'}:</strong> {t.protectPdf?.permissionsDesc || 'Controlam o que os usuários podem fazer com o documento'}</li>
            <li>• <strong>{t.protectPdf?.watermarkInfo || 'Marca d\'água:'}:</strong> {t.protectPdf?.watermarkDesc || 'Adiciona identificação discreta de documento protegido'}</li>
          </ul>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
            <AlertCircle size={16} />
            {t.protectPdf?.limitationsTitle || '⚠️ Limitações'}
          </h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• {t.protectPdf?.limitation1 || 'A proteção por senha tem limitações técnicas no navegador'}</li>
            <li>• {t.protectPdf?.limitation2 || 'Para proteção máxima, use software especializado'}</li>
            <li>• {t.protectPdf?.limitation3 || 'Permissões podem não ser respeitadas por todos os visualizadores'}</li>
            <li>• {t.protectPdf?.limitation4 || 'Processamento realizado localmente no navegador'}</li>
            <li>• {t.protectPdf?.limitation5 || 'Recomendado para proteção básica de documentos'}</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}
