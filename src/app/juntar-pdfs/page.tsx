import ToolLayout from '@/components/ToolLayout';
import { Upload, Plus, Trash2 } from 'lucide-react';

export default function JuntarPdfsPage() {
  return (
    <ToolLayout
      title="Juntar PDFs"
      description="Una múltiplos arquivos PDF em um só documento. Reorganize as páginas na ordem desejada."
    >
      <div className="space-y-6">
        {/* Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Selecione múltiplos arquivos PDF
          </h3>
          <p className="text-gray-600 mb-4">
            Você pode selecionar vários arquivos de uma vez
          </p>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Escolher PDFs
          </button>
        </div>

        {/* Lista de arquivos */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Arquivos Selecionados</h3>
            <button className="text-blue-600 hover:text-blue-700 flex items-center gap-2">
              <Plus size={16} />
              Adicionar mais arquivos
            </button>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-white rounded border">
              <div className="flex items-center gap-3">
                <span className="text-gray-400">1.</span>
                <span className="font-medium">documento1.pdf</span>
                <span className="text-gray-500 text-sm">(2.5 MB, 5 páginas)</span>
              </div>
              <button className="text-red-600 hover:text-red-700">
                <Trash2 size={16} />
              </button>
            </div>
            
            <div className="text-center py-8 text-gray-500">
              Nenhum arquivo selecionado ainda
            </div>
          </div>
        </div>

        {/* Configurações */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Configurações</h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" className="mr-3" defaultChecked />
              <span>Manter marcadores (bookmarks)</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-3" defaultChecked />
              <span>Preservar metadados</span>
            </label>
          </div>
        </div>

        {/* Botão de juntar */}
        <button className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium">
          Juntar PDFs
        </button>

        {/* Implementação futura */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            <strong>🚧 Em desenvolvimento:</strong> A funcionalidade será implementada usando PDF-lib 
            para combinar múltiplos PDFs mantendo a qualidade e metadados.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
