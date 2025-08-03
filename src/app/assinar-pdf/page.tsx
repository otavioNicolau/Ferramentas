import ToolLayout from '@/components/ToolLayout';
import { Upload, PenTool } from 'lucide-react';

export default function AssinarPdfPage() {
  return (
    <ToolLayout
      title="Assinar PDF"
      description="Adicione assinatura digital aos seus documentos PDF de forma segura e profissional."
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
          <h3 className="text-lg font-semibold mb-4">Criar Assinatura</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border-2 border-gray-300 rounded-lg hover:border-blue-400 transition-colors">
              <PenTool className="mx-auto mb-2" size={24} />
              Desenhar
            </button>
            <button className="p-4 border-2 border-gray-300 rounded-lg hover:border-blue-400 transition-colors">
              📝
              <div className="mt-2">Digitar</div>
            </button>
            <button className="p-4 border-2 border-gray-300 rounded-lg hover:border-blue-400 transition-colors">
              📷
              <div className="mt-2">Upload</div>
            </button>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            <strong>🚧 Em desenvolvimento:</strong> Funcionalidade de assinatura digital será implementada.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
