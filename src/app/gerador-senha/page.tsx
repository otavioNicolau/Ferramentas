import ToolLayout from '@/components/ToolLayout';
import { Key, RefreshCw, Copy, Check } from 'lucide-react';

export default function GeradorSenhaPage() {
  return (
    <ToolLayout
      title="Gerador de Senhas"
      description="Gere senhas seguras e personalizáveis para proteger suas contas online."
    >
      <div className="space-y-6">
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Senha Gerada</h3>
          <div className="flex gap-2">
            <input 
              type="text" 
              value="Gx7$kP9#mL2qR8@nF4"
              readOnly
              className="flex-1 border border-gray-300 rounded-md px-3 py-3 bg-white font-mono text-lg"
            />
            <button className="bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 transition-colors">
              <Copy size={20} />
            </button>
            <button className="bg-green-600 text-white px-4 py-3 rounded-md hover:bg-green-700 transition-colors">
              <RefreshCw size={20} />
            </button>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Configurações</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comprimento: <span className="font-bold">16</span>
              </label>
              <input 
                type="range" 
                min="4" 
                max="50" 
                defaultValue="16"
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>4</span>
                <span>50</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="mr-3" />
                <span>Letras maiúsculas (A-Z)</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="mr-3" />
                <span>Letras minúsculas (a-z)</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="mr-3" />
                <span>Números (0-9)</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="mr-3" />
                <span>Símbolos (!@#$%)</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-3" />
                <span>Excluir caracteres ambíguos (0, O, l, I)</span>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-800 mb-2">Força da Senha: Muito Forte 💪</h4>
          <div className="w-full bg-green-200 rounded-full h-2">
            <div className="bg-green-600 h-2 rounded-full" style={{width: '90%'}}></div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            <strong>🚧 Em desenvolvimento:</strong> Gerador de senhas com validação de força será implementado.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
