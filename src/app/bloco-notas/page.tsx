'use client';

import { useState, useEffect } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { FileEdit, Save, Download, Trash2 } from 'lucide-react';

export default function BlocoNotasPage() {
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
    if (confirm('Tem certeza que deseja limpar todas as notas? Esta ação não pode ser desfeita.')) {
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
      title="Bloco de Notas"
      description="Editor de texto simples para notas rápidas no navegador. Suas notas são salvas localmente."
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h3 className="text-lg font-semibold">Suas Notas</h3>
            {lastSaved && (
              <p className="text-sm text-gray-500">
                Última alteração: {formatLastSaved()}
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
              {saved ? 'Salvo!' : 'Salvar'}
            </button>
            <button 
              onClick={downloadAsFile}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Download size={16} />
              Baixar
            </button>
            <button 
              onClick={clearNotes}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <Trash2 size={16} />
              Limpar
            </button>
          </div>
        </div>

        <div className="relative">
          <textarea
            placeholder="Digite suas notas aqui... 

📝 Suas notas são salvas automaticamente no navegador
💾 Use o botão 'Baixar' para salvar como arquivo .txt
🔄 O conteúdo é recuperado automaticamente quando você voltar"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-96 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none font-mono"
          />
          
          <div className="absolute bottom-4 right-4 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded">
            {content.length} caracteres
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">💾 Auto-salvamento</h4>
            <p className="text-green-700">
              Suas notas são salvas automaticamente no armazenamento local do navegador a cada 2 segundos.
            </p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">🔒 Privacidade</h4>
            <p className="text-blue-700">
              Todas as notas ficam apenas no seu navegador. Nada é enviado para servidores externos.
            </p>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-semibold text-purple-800 mb-2">📁 Export</h4>
            <p className="text-purple-700">
              Use o botão &apos;Baixar&apos; para salvar suas notas como arquivo de texto no seu computador.
            </p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
