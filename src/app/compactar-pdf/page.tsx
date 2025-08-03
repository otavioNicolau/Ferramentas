import ToolLayout from '@/components/ToolLayout';
import { Upload, Minimize2 } from 'lucide-react';

export default function CompactarPdfPage() {
  return (
    <ToolLayout
      title="Compactar PDF"
      description="Reduza o tamanho de arquivos PDF mantendo a qualidade. Perfeito para enviar por email ou economizar espaço."
    >
      <div className="space-y-6">
        {/* Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Selecione um arquivo PDF
          </h3>
          <p className="text-gray-600 mb-4">
            Arquivo máximo: 100MB
          </p>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Escolher PDF
          </button>
        </div>

        {/* Configurações de Compressão */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Nível de Compressão</h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="radio" name="compression" value="low" className="mr-3" defaultChecked />
              <div>
                <span className="font-medium">Baixa</span>
                <span className="text-gray-500 block text-sm">Melhor qualidade, menor compressão</span>
              </div>
            </label>
            <label className="flex items-center">
              <input type="radio" name="compression" value="medium" className="mr-3" />
              <div>
                <span className="font-medium">Média</span>
                <span className="text-gray-500 block text-sm">Equilíbrio entre qualidade e tamanho</span>
              </div>
            </label>
            <label className="flex items-center">
              <input type="radio" name="compression" value="high" className="mr-3" />
              <div>
                <span className="font-medium">Alta</span>
                <span className="text-gray-500 block text-sm">Máxima compressão, pode afetar a qualidade</span>
              </div>
            </label>
          </div>
        </div>

        {/* Informações do arquivo */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Informações do Arquivo</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Tamanho original:</span>
              <span className="ml-2 font-medium">-</span>
            </div>
            <div>
              <span className="text-gray-600">Tamanho compactado:</span>
              <span className="ml-2 font-medium">-</span>
            </div>
            <div>
              <span className="text-gray-600">Economia:</span>
              <span className="ml-2 font-medium">-</span>
            </div>
            <div>
              <span className="text-gray-600">Páginas:</span>
              <span className="ml-2 font-medium">-</span>
            </div>
          </div>
        </div>

        {/* Implementação futura */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            <strong>🚧 Em desenvolvimento:</strong> A funcionalidade de compressão será implementada usando 
            bibliotecas como PDF-lib ou jsPDF para processar e otimizar PDFs no navegador.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
