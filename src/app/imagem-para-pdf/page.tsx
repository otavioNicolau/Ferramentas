import ToolLayout from '@/components/ToolLayout';
import { Upload, FileImage } from 'lucide-react';

export default function ImagemParaPdfPage() {
  return (
    <ToolLayout
      title="Imagem para PDF"
      description="Converta imagens (JPG, PNG, BMP) em documentos PDF com qualidade preservada."
    >
      <div className="space-y-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
          <FileImage className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Selecione imagens</h3>
          <p className="text-gray-600 mb-4">Formatos: JPG, PNG, BMP, GIF</p>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Escolher Imagens
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Configurações</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tamanho da Página</label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                <option>A4</option>
                <option>A3</option>
                <option>Letter</option>
                <option>Personalizado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Orientação</label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                <option>Retrato</option>
                <option>Paisagem</option>
                <option>Auto</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            <strong>🚧 Em desenvolvimento:</strong> Conversão de imagens para PDF será implementada usando jsPDF.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
