'use client';

import { useState, useEffect } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { FileEdit, Save, Download, Trash2 } from 'lucide-react';
import { getTranslations } from '@/config/language';

export default function BlocoNotasPage() {
  const t = getTranslations();
  const [content, setContent] = useState('');
  const [saved, setSaved] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Carregar conteúdo do localStorage ao inicializar
  useEffect(() => {
    const savedContent = localStorage.getItem('utilidadeweb-notes');
    const savedTime = localStorage.getItem('utilidadeweb-notes-time');
    
    if (savedContent) {
      setContent(savedContent);
    }
    if (savedTime) {
      setLastSaved(new Date(savedTime));
    }
  }, []);

  // Auto-save a cada 2 segundos quando há mudanças
  useEffect(() => {
    const autoSaveTimer = setTimeout(() => {
      if (content !== localStorage.getItem('utilidadeweb-notes')) {
        saveToLocal();
      }
    }, 2000);

    return () => clearTimeout(autoSaveTimer);
  }, [content]);

  const saveToLocal = () => {
    localStorage.setItem('utilidadeweb-notes', content);
    localStorage.setItem('utilidadeweb-notes-time', new Date().toISOString());
    setLastSaved(new Date());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const downloadAsFile = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `notas-${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearNotes = () => {
    if (confirm(t.notebook.confirmClear)) {
      setContent('');
      localStorage.removeItem('utilidadeweb-notes');
      localStorage.removeItem('utilidadeweb-notes-time');
      setLastSaved(null);
    }
  };

  const formatLastSaved = () => {
    if (!lastSaved) return '';
    return lastSaved.toLocaleString('pt-BR');
  };
  return (
    <ToolLayout
      title={t.notebookTitle}
      description={t.notebookDescription}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h3 className="text-lg font-semibold">{t.notebook?.yourNotes || 'Suas Notas'}</h3>
            {lastSaved && (
              <p className="text-sm text-gray-500">
                {t.notebook?.lastModified || 'Última alteração'}: {formatLastSaved()}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={saveToLocal}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                saved ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Save size={16} />
              {saved ? t.notebook.saved : t.notebook.save}
            </button>
            <button 
              onClick={downloadAsFile}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Download size={16} />
              {t.notebook.download}
            </button>
            <button 
              onClick={clearNotes}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <Trash2 size={16} />
              {t.notebook.clear}
            </button>
          </div>
        </div>

        <div className="relative">
          <textarea
            placeholder={t.notebook.placeholder}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-96 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none font-mono"
          />
          
          <div className="absolute bottom-4 right-4 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded">
            {content.length} {t.notebook.characterCount}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">💾 {t.notebook.autoSaveTitle}</h4>
            <p className="text-green-700">
              {t.notebook.autoSaveDescription}
            </p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">🔒 {t.notebook.privacyTitle}</h4>
            <p className="text-blue-700">
              {t.notebook.privacyDescription}
            </p>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-semibold text-purple-800 mb-2">📁 {t.notebook.exportTitle}</h4>
            <p className="text-purple-700">
              {t.notebook.exportDescription}
            </p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
