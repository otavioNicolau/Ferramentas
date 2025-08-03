import ToolLayout from '@/components/ToolLayout';
import { QrCode, Download } from 'lucide-react';

export default function GerarQrcodePage() {
  return (
    <ToolLayout
      title="Gerar QR Code"
      description="Crie códigos QR personalizados para textos, URLs, WiFi e muito mais."
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Configurações</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Conteúdo</label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                  <option>Texto</option>
                  <option>URL</option>
                  <option>WiFi</option>
                  <option>vCard</option>
                  <option>SMS</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Conteúdo</label>
                <textarea 
                  placeholder="Digite o texto ou URL aqui..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tamanho</label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option>200x200</option>
                    <option>300x300</option>
                    <option>500x500</option>
                    <option>1000x1000</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cor</label>
                  <input type="color" defaultValue="#000000" className="w-full border border-gray-300 rounded-md h-10" />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Preview</h3>
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <QrCode size={150} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">QR Code aparecerá aqui</p>
              <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto">
                <Download size={16} />
                Baixar QR Code
              </button>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            <strong>🚧 Em desenvolvimento:</strong> Geração de QR codes será implementada usando biblioteca qrcode.js.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
