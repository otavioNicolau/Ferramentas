import ToolLayout from '@/components/ToolLayout';
import { Timer, Play, Pause, RotateCcw } from 'lucide-react';

export default function CronometroPage() {
  return (
    <ToolLayout
      title="Cronômetro Online"
      description="Cronômetro preciso com controles de start, pause e reset para suas atividades."
    >
      <div className="space-y-6">
        <div className="text-center">
          <div className="bg-gray-900 text-white rounded-2xl p-8 mb-6 inline-block">
            <div className="font-mono text-6xl md:text-8xl font-bold">
              00:00:00
            </div>
            <div className="text-gray-400 text-lg mt-2">
              horas : minutos : segundos
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <button className="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-lg font-medium">
            <Play size={20} />
            Iniciar
          </button>
          <button className="bg-yellow-600 text-white px-8 py-4 rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2 text-lg font-medium">
            <Pause size={20} />
            Pausar
          </button>
          <button className="bg-red-600 text-white px-8 py-4 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-lg font-medium">
            <RotateCcw size={20} />
            Reset
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Voltas Registradas</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-white rounded border">
              <span className="font-medium">Volta #1</span>
              <span className="font-mono">00:01:23</span>
            </div>
            <div className="text-center py-4 text-gray-500">
              Nenhuma volta registrada ainda
            </div>
          </div>
          <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Registrar Volta
          </button>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            <strong>🚧 Em desenvolvimento:</strong> Funcionalidade completa do cronômetro será implementada com JavaScript.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
