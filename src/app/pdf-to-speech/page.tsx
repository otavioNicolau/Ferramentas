'use client';

import { useState, useRef, useEffect } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Play, Pause, Square, Volume2, FileText, Upload, Download, Settings } from 'lucide-react';
import { isPdfFile } from '@/lib/pdf';

interface Voice {
  name: string;
  lang: string;
  voiceURI: string;
}

export default function PdfToSpeechPage() {
  const [text, setText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carregar vozes disponíveis
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      const voiceList = availableVoices.map(voice => ({
        name: voice.name,
        lang: voice.lang,
        voiceURI: voice.voiceURI
      }));
      setVoices(voiceList);
      
      // Selecionar voz em português por padrão
      const portugueseVoice = availableVoices.find(voice => 
        voice.lang.includes('pt') || voice.lang.includes('PT')
      );
      if (portugueseVoice) {
        setSelectedVoice(portugueseVoice.voiceURI);
      } else if (availableVoices.length > 0) {
        setSelectedVoice(availableVoices[0].voiceURI);
      }
    };

    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  // Extrair texto de PDF
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!isPdfFile(file)) {
      alert('Por favor, selecione um arquivo PDF válido.');
      return;
    }

    setIsLoading(true);
    try {
      // Simular extração de texto do PDF
      // Em uma implementação real, você usaria uma biblioteca como pdf-parse ou PDF.js
      const reader = new FileReader();
      reader.onload = () => {
        // Simulação de texto extraído
        const simulatedText = `Texto extraído do arquivo: ${file.name}\n\nEste é um exemplo de texto que seria extraído de um documento PDF. A ferramenta de Text to Speech pode converter este texto em áudio usando diferentes vozes e configurações de velocidade, tom e volume.\n\nVocê pode ajustar as configurações de voz na seção abaixo e depois reproduzir o áudio clicando no botão Play.`;
        setExtractedText(simulatedText);
        setText(simulatedText);
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Erro ao processar PDF:', error);
      alert('Erro ao processar o arquivo PDF.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reproduzir texto
  const handlePlay = () => {
    if (isPaused && utteranceRef.current) {
      speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    if (!text.trim()) {
      alert('Por favor, insira algum texto para converter em fala.');
      return;
    }

    // Parar qualquer reprodução anterior
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configurar voz
    if (selectedVoice) {
      const voice = speechSynthesis.getVoices().find(v => v.voiceURI === selectedVoice);
      if (voice) {
        utterance.voice = voice;
      }
    }

    // Configurar parâmetros
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    // Event listeners
    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentPosition(0);
    };

    utterance.onerror = (event) => {
      console.error('Erro na síntese de voz:', event);
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onboundary = (event) => {
      setCurrentPosition(event.charIndex);
    };

    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  };

  // Pausar reprodução
  const handlePause = () => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  // Parar reprodução
  const handleStop = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentPosition(0);
  };

  // Baixar áudio (simulação)
  const handleDownload = () => {
    alert('Funcionalidade de download de áudio será implementada em uma versão futura. Por enquanto, use a reprodução direta.');
  };

  // Limpar texto
  const handleClear = () => {
    setText('');
    setExtractedText('');
    handleStop();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <ToolLayout
      title="Texto para Fala"
      description="Converta texto ou documentos PDF para áudio usando síntese de voz"
    >
      <div className="space-y-6">
        {/* Upload de PDF */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={20} className="text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-800">Carregar PDF</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecionar arquivo PDF
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                disabled={isLoading}
              />
            </div>
            
            {isLoading && (
              <div className="flex items-center gap-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                <span>Extraindo texto do PDF...</span>
              </div>
            )}
            
            {extractedText && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 text-sm">
                  ✅ Texto extraído com sucesso! ({extractedText.length} caracteres)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Área de Texto */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Volume2 size={20} className="text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-800">Texto para Conversão</h3>
            </div>
            <button
              onClick={handleClear}
              className="text-red-600 hover:text-red-700 text-sm"
            >
              Limpar
            </button>
          </div>
          
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 h-40 resize-none"
            placeholder="Digite ou cole o texto que deseja converter em fala, ou carregue um arquivo PDF acima..."
          />
          
          <div className="mt-2 text-sm text-gray-500">
            {text.length} caracteres
            {currentPosition > 0 && (
              <span className="ml-4">
                Posição atual: {currentPosition}
              </span>
            )}
          </div>
        </div>

        {/* Configurações de Voz */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings size={20} className="text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-800">Configurações de Voz</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Voz
              </label>
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                {voices.map((voice) => (
                  <option key={voice.voiceURI} value={voice.voiceURI}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Velocidade: {rate.toFixed(1)}x
              </label>
              <input
                type="range"
                min="0.1"
                max="2"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tom: {pitch.toFixed(1)}
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={pitch}
                onChange={(e) => setPitch(Number(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Volume: {Math.round(volume * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Controles de Reprodução */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Controles de Reprodução</h3>
          
          <div className="flex items-center gap-4">
            <button
              onClick={handlePlay}
              disabled={!text.trim() || (isPlaying && !isPaused)}
              className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Play size={20} />
              {isPaused ? 'Continuar' : 'Reproduzir'}
            </button>
            
            <button
              onClick={handlePause}
              disabled={!isPlaying}
              className="bg-yellow-600 text-white px-6 py-3 rounded-md hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Pause size={20} />
              Pausar
            </button>
            
            <button
              onClick={handleStop}
              disabled={!isPlaying && !isPaused}
              className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Square size={20} />
              Parar
            </button>
            
            <button
              onClick={handleDownload}
              disabled={!text.trim()}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Download size={20} />
              Baixar Áudio
            </button>
          </div>
          
          {(isPlaying || isPaused) && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800">
                <Volume2 size={16} />
                <span className="text-sm font-medium">
                  {isPlaying ? 'Reproduzindo...' : 'Pausado'}
                </span>
              </div>
              {currentPosition > 0 && (
                <div className="mt-2 text-sm text-blue-600">
                  Posição: {currentPosition} de {text.length} caracteres
                </div>
              )}
            </div>
          )}
        </div>

        {/* Informações */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Como Usar</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Carregue um arquivo PDF ou digite/cole texto diretamente</li>
            <li>• Ajuste as configurações de voz, velocidade, tom e volume</li>
            <li>• Use os controles para reproduzir, pausar ou parar a síntese de voz</li>
            <li>• A ferramenta usa a API Web Speech Synthesis do navegador</li>
            <li>• Diferentes navegadores podem ter vozes diferentes disponíveis</li>
          </ul>
        </div>

        {/* Limitações */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Limitações</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• A extração de texto de PDF é simulada (implementação completa requer biblioteca específica)</li>
            <li>• O download de áudio não está implementado (use a reprodução direta)</li>
            <li>• A qualidade e disponibilidade de vozes dependem do navegador e sistema operacional</li>
            <li>• Textos muito longos podem ter limitações de reprodução</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}
