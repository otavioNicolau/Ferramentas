'use client';

import { useState, useEffect, useRef } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Timer, Play, Pause, RotateCcw } from 'lucide-react';

export default function CronometroPage() {
  const [time, setTime] = useState(0); // tempo em milissegundos
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => prevTime + 10);
      }, 10);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const formatTime = (timeMs: number) => {
    const totalSeconds = Math.floor(timeMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((timeMs % 1000) / 10);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    setLaps([]);
  };

  const handleLap = () => {
    if (isRunning) {
      setLaps(prev => [...prev, time]);
    }
  };
  return (
    <ToolLayout
      title="Cronômetro Online"
      description="Cronômetro preciso com controles de start, pause e reset para suas atividades."
    >
      <div className="space-y-6">
        <div className="text-center">
          <div className="bg-gray-900 text-white rounded-2xl p-8 mb-6 inline-block">
            <div className="font-mono text-4xl md:text-6xl lg:text-8xl font-bold">
              {formatTime(time)}
            </div>
            <div className="text-gray-400 text-lg mt-2">
              horas : minutos : segundos . centésimos
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4 flex-wrap">
          {!isRunning ? (
            <button 
              onClick={handleStart}
              className="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-lg font-medium"
            >
              <Play size={20} />
              Iniciar
            </button>
          ) : (
            <button 
              onClick={handlePause}
              className="bg-yellow-600 text-white px-8 py-4 rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2 text-lg font-medium"
            >
              <Pause size={20} />
              Pausar
            </button>
          )}
          
          <button 
            onClick={handleReset}
            className="bg-red-600 text-white px-8 py-4 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-lg font-medium"
          >
            <RotateCcw size={20} />
            Reset
          </button>

          {time > 0 && (
            <button 
              onClick={handleLap}
              disabled={!isRunning}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📍 Volta
            </button>
          )}
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Voltas Registradas</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {laps.length > 0 ? (
              laps.map((lapTime, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-white rounded border">
                  <span className="font-medium">Volta #{laps.length - index}</span>
                  <span className="font-mono text-lg">{formatTime(lapTime)}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                Nenhuma volta registrada ainda
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
