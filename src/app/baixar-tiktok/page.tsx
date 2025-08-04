import ToolLayout from '@/components/ToolLayout';
import { Download, ExternalLink } from 'lucide-react';

export default function BaixarTiktokPage() {
  return (
    <ToolLayout
      title="Download de Vídeos do TikTok"
                  description="Baixe vídeos do TikTok sem marca d&apos;água em alta qualidade de forma rápida e fácil."
    >
      <div className="space-y-6">
        {/* URL Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL do vídeo do TikTok
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://www.tiktok.com/@user/video/..."
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2">
              <ExternalLink size={16} />
              Buscar
            </button>
          </div>
        </div>

        {/* Preview do vídeo */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Preview do Vídeo</h3>
          <div className="bg-white rounded border p-4 text-center">
            <p className="text-gray-500">Cole uma URL do TikTok para ver o preview</p>
          </div>
        </div>

        {/* Opções de Download */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Opções de Download</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 bg-red-600 text-white p-4 rounded-lg hover:bg-red-700 transition-colors">
              <Download size={20} />
              Baixar Vídeo (MP4)
            </button>
            <button className="flex items-center justify-center gap-2 bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-colors">
              <Download size={20} />
              Baixar Áudio (MP3)
            </button>
          </div>
        </div>

        {/* Implementação futura */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            <strong>🚧 Em desenvolvimento:</strong> A funcionalidade de download será implementada usando 
            APIs ou bibliotecas específicas para TikTok, removendo automaticamente as marcas d&apos;água.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
