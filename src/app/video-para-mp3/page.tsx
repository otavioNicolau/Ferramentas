import ToolLayout from '@/components/ToolLayout';
import { Upload } from 'lucide-react';

export default function VideoParaMp3Page() {
  return (
    <ToolLayout
      title="Conversor de Vídeo para MP3"
      description="Converta seus vídeos em arquivos de áudio MP3 com alta qualidade. Suporte para MP4, AVI, MOV e outros formatos."
    >
      <div className="space-y-6">
        {/* Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Selecione ou arraste um vídeo
          </h3>
          <p className="text-gray-600 mb-4">
            Formatos suportados: MP4, AVI, MOV, WMV, FLV
          </p>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Escolher Arquivo
          </button>
        </div>

        {/* Configurações */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Configurações de Conversão</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Qualidade do Áudio
              </label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                <option>128 kbps (Padrão)</option>
                <option>192 kbps (Alta)</option>
                <option>320 kbps (Máxima)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Taxa de Amostragem
              </label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                <option>44.1 kHz (Padrão)</option>
                <option>48 kHz</option>
              </select>
            </div>
          </div>
        </div>

        {/* Placeholder para lógica de conversão */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            <strong>🚧 Em desenvolvimento:</strong> A funcionalidade de conversão será implementada aqui.
            Será utilizada uma biblioteca como FFmpeg.js para conversão no lado do cliente.
          </p>
        </div>

        {/* Área de resultado */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Arquivo Convertido</h3>
          <p className="text-gray-500 text-center py-8">
            Nenhum arquivo foi convertido ainda. Faça upload de um vídeo para começar.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
