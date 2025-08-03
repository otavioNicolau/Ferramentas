import ToolLayout from '@/components/ToolLayout';
import { FileEdit, Save, Download } from 'lucide-react';

export default function BlocoNotasPage() {
  return (
    <ToolLayout
      title="Bloco de Notas"
      description="Editor de texto simples para notas rápidas no navegador. Suas notas são salvas localmente."
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Suas Notas</h3>
          <div className="flex gap-2">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Save size={16} />
              Salvar
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
              <Download size={16} />
              Baixar
            </button>
          </div>
        </div>

        <textarea
          placeholder="Digite suas notas aqui..."
          className="w-full h-96 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          defaultValue="# Minhas Notas

Bem-vindo ao bloco de notas online!

## Características:
- ✅ Salvamento automático no navegador
- ✅ Download em formato .txt
- ✅ Interface limpa e simples
- ✅ Suporte a markdown

Digite aqui suas anotações..."
        />

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">
            <strong>💾 Auto-salvamento:</strong> Suas notas são salvas automaticamente no armazenamento local do navegador.
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            <strong>🚧 Em desenvolvimento:</strong> Funcionalidades de salvamento local e download serão implementadas.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
