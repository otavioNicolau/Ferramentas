import ToolLayout from '@/components/ToolLayout';
import { Upload, Scissors } from 'lucide-react';

export default function DividirPdfPage() {
  return (
    <ToolLayout
      title="Dividir PDF"
      description="Divida um PDF em páginas individuais ou extraia intervalos específicos de páginas."
    >
      <div className="space-y-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Selecione um arquivo PDF</h3>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Escolher PDF
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Opções de Divisão</h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="radio" name="split" value="all" className="mr-3" defaultChecked />
              <span>Dividir em páginas individuais</span>
            </label>
            <label className="flex items-center">
              <input type="radio" name="split" value="range" className="mr-3" />
              <span>Extrair intervalo de páginas</span>
            </label>
            <label className="flex items-center">
              <input type="radio" name="split" value="specific" className="mr-3" />
              <span>Páginas específicas</span>
            </label>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            <strong>🚧 Em desenvolvimento:</strong> Funcionalidade de divisão de PDF será implementada.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
