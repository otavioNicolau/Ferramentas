import ToolLayout from '@/components/ToolLayout';
import { Download, ExternalLink } from 'lucide-react';

export default function BaixarYoutubePage() {
  return (
    <ToolLayout
      title="Download de Vídeos do YouTube"
      description="Baixe vídeos do YouTube em diferentes formatos e qualidades de forma rápida e segura."
    >
      <div className="space-y-6">
        {/* URL Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL do vídeo do YouTube
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2">
              <ExternalLink size={16} />
              Analisar
            </button>
          </div>
        </div>

        {/* Opções de Download */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Opções de Download</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white rounded border">
              <div>
                <span className="font-medium">MP4 - 1080p</span>
                <span className="text-gray-500 ml-2">(~50MB)</span>
              </div>
              <button className="bg-green-600 text-white px-4 py-1 rounded text-sm hover:bg-green-700">
                Baixar
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded border">
              <div>
                <span className="font-medium">MP4 - 720p</span>
                <span className="text-gray-500 ml-2">(~25MB)</span>
              </div>
              <button className="bg-green-600 text-white px-4 py-1 rounded text-sm hover:bg-green-700">
                Baixar
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded border">
              <div>
                <span className="font-medium">MP3 - Áudio</span>
                <span className="text-gray-500 ml-2">(~5MB)</span>
              </div>
              <button className="bg-green-600 text-white px-4 py-1 rounded text-sm hover:bg-green-700">
                Baixar
              </button>
            </div>
          </div>
        </div>

        {/* Implementação futura */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            <strong>🚧 Em desenvolvimento:</strong> A funcionalidade de download será implementada usando 
            APIs do YouTube ou bibliotecas como youtube-dl. Respeitando os termos de serviço da plataforma.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
