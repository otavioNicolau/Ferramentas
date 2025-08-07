'use client';

import { useState, useRef, useEffect } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Mic, MicOff, Play, Pause, Square, Download, FileAudio, Copy, Trash2, FileText } from 'lucide-react';
import jsPDF from 'jspdf';

interface TranscriptionResult {
  id: string;
  text: string;
  confidence: number;
  timestamp: Date;
  duration?: number;
}

export default function SpeechToTextPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcriptions, setTranscriptions] = useState<TranscriptionResult[]>([]);
  const [currentTranscription, setCurrentTranscription] = useState('');
  const [language, setLanguage] = useState('pt-BR');
  const [continuous, setContinuous] = useState(true);
  const [interimResults, setInterimResults] = useState(true);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [finalText, setFinalText] = useState('');
  
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Verificar suporte do navegador
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Verificar se o navegador suporta Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;

      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.lang = language;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const confidence = event.results[i][0].confidence;

          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            
            // Adicionar resultado final à lista
            const newResult: TranscriptionResult = {
              id: Date.now().toString(),
              text: transcript,
              confidence: confidence || 0.9,
              timestamp: new Date()
            };
            
            setTranscriptions(prev => [...prev, newResult]);
            setFinalText(prev => prev + (prev ? ' ' : '') + transcript);
          } else {
            interimTranscript += transcript;
          }
        }

        setCurrentTranscription(interimTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error('Erro no reconhecimento de fala:', event.error);
        setIsListening(false);
        setIsRecording(false);
        
        let errorMessage = 'Erro no reconhecimento de fala.';
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'Nenhuma fala detectada. Tente falar mais alto.';
            break;
          case 'audio-capture':
            errorMessage = 'Erro ao capturar áudio. Verifique o microfone.';
            break;
          case 'not-allowed':
            errorMessage = 'Permissão de microfone negada.';
            break;
          case 'network':
            errorMessage = 'Erro de rede. Verifique sua conexão.';
            break;
        }
        alert(errorMessage);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (isRecording) {
          // Reiniciar automaticamente se ainda estiver gravando
          setTimeout(() => {
            if (isRecording) {
              recognition.start();
            }
          }, 100);
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, continuous, interimResults, isRecording]);

  // Iniciar gravação
  const startRecording = async () => {
    if (!isSupported) {
      alert('Seu navegador não suporta reconhecimento de fala. Tente usar Chrome ou Edge.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Configurar MediaRecorder para gravar áudio
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);

      // Iniciar reconhecimento de fala
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    } catch (error) {
      console.error('Erro ao acessar microfone:', error);
      alert('Erro ao acessar o microfone. Verifique as permissões.');
    }
  };

  // Parar gravação
  const stopRecording = () => {
    setIsRecording(false);
    setIsListening(false);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    // Parar todas as tracks de áudio
    if (mediaRecorderRef.current?.stream) {
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  // Processar arquivo de áudio
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      alert('Por favor, selecione um arquivo de áudio válido.');
      return;
    }

    setAudioFile(file);
    setIsProcessingFile(true);

    try {
      // Simular processamento de arquivo de áudio
      // Em uma implementação real, você usaria uma API de transcrição como Google Speech-to-Text
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const simulatedText = `Texto transcrito do arquivo: ${file.name}\n\nEste é um exemplo de texto que seria transcrito de um arquivo de áudio. A ferramenta de Speech to Text pode processar diferentes formatos de áudio e converter para texto com boa precisão.\n\nO texto transcrito pode ser editado, copiado ou exportado para PDF.`;
      
      const newResult: TranscriptionResult = {
        id: Date.now().toString(),
        text: simulatedText,
        confidence: 0.95,
        timestamp: new Date(),
        duration: 30 // segundos simulados
      };
      
      setTranscriptions(prev => [...prev, newResult]);
      setFinalText(prev => prev + (prev ? '\n\n' : '') + simulatedText);
      
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      alert('Erro ao processar o arquivo de áudio.');
    } finally {
      setIsProcessingFile(false);
    }
  };

  // Copiar texto
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Texto copiado para a área de transferência!');
    }).catch(() => {
      alert('Erro ao copiar texto.');
    });
  };

  // Limpar transcrições
  const clearTranscriptions = () => {
    setTranscriptions([]);
    setCurrentTranscription('');
    setFinalText('');
    setAudioFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remover transcrição específica
  const removeTranscription = (id: string) => {
    setTranscriptions(prev => prev.filter(t => t.id !== id));
    // Reconstruir texto final
    const remaining = transcriptions.filter(t => t.id !== id);
    setFinalText(remaining.map(t => t.text).join(' '));
  };

  // Gerar PDF
  const generatePDF = () => {
    if (!finalText.trim()) {
      alert('Não há texto para gerar PDF.');
      return;
    }

    try {
      const pdf = new jsPDF();
      
      // Configurar metadados
      pdf.setProperties({
        title: 'Transcrição de Áudio',
        creator: 'Utilidade Web - Speech to Text',
        author: 'Usuário'
      });

      // Adicionar título
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Transcrição de Áudio', 20, 20);
      
      // Adicionar data
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, 30);
      
      // Adicionar texto transcrito
      pdf.setFontSize(12);
      const lines = pdf.splitTextToSize(finalText, 170);
      pdf.text(lines, 20, 45);

      // Download do PDF
      pdf.save('transcricao-audio.pdf');
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    }
  };

  return (
    <ToolLayout
      title="Fala para Texto"
      description="Converta áudio para texto usando reconhecimento de fala e gere documentos PDF"
    >
      <div className="space-y-6">
        {!isSupported && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-900 mb-2">⚠️ Navegador Não Suportado</h4>
            <p className="text-sm text-red-800">
              Seu navegador não suporta a API de reconhecimento de fala. 
              Recomendamos usar Google Chrome ou Microsoft Edge para melhor compatibilidade.
            </p>
          </div>
        )}

        {/* Controles de Gravação */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Mic size={20} className="text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-800">Gravação de Áudio</h3>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Idioma
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  disabled={isRecording}
                >
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">English (US)</option>
                  <option value="es-ES">Español</option>
                  <option value="fr-FR">Français</option>
                  <option value="de-DE">Deutsch</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={continuous}
                    onChange={(e) => setContinuous(e.target.checked)}
                    className="mr-2"
                    disabled={isRecording}
                  />
                  <span className="text-sm text-gray-700">Gravação contínua</span>
                </label>
              </div>
              
              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={interimResults}
                    onChange={(e) => setInterimResults(e.target.checked)}
                    className="mr-2"
                    disabled={isRecording}
                  />
                  <span className="text-sm text-gray-700">Resultados parciais</span>
                </label>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  disabled={!isSupported}
                  className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Mic size={20} />
                  Iniciar Gravação
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <Square size={20} />
                  Parar Gravação
                </button>
              )}
              
              {isListening && (
                <div className="flex items-center gap-2 text-red-600">
                  <div className="animate-pulse w-3 h-3 bg-red-600 rounded-full"></div>
                  <span className="text-sm font-medium">Ouvindo...</span>
                </div>
              )}
            </div>
            
            {currentTranscription && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Transcrição em Tempo Real:</h4>
                <p className="text-blue-800 italic">{currentTranscription}</p>
              </div>
            )}
          </div>
        </div>

        {/* Upload de Arquivo */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileAudio size={20} className="text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-800">Carregar Arquivo de Áudio</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecionar arquivo de áudio
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                disabled={isProcessingFile}
              />
            </div>
            
            {isProcessingFile && (
              <div className="flex items-center gap-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                <span>Processando arquivo de áudio...</span>
              </div>
            )}
            
            {audioFile && !isProcessingFile && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 text-sm">
                  ✅ Arquivo processado: {audioFile.name}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Resultados das Transcrições */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Transcrições</h3>
            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard(finalText)}
                disabled={!finalText}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Copy size={16} />
                Copiar Tudo
              </button>
              <button
                onClick={generatePDF}
                disabled={!finalText}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FileText size={16} />
                Gerar PDF
              </button>
              <button
                onClick={clearTranscriptions}
                disabled={transcriptions.length === 0}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Trash2 size={16} />
                Limpar
              </button>
            </div>
          </div>
          
          {transcriptions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Mic className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <p>Nenhuma transcrição ainda</p>
              <p className="text-sm">Inicie uma gravação ou carregue um arquivo de áudio</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transcriptions.map((transcription) => (
                <div key={transcription.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-gray-500">
                          {transcription.timestamp.toLocaleString('pt-BR')}
                        </span>
                        <span className="text-sm text-green-600">
                          Confiança: {Math.round(transcription.confidence * 100)}%
                        </span>
                        {transcription.duration && (
                          <span className="text-sm text-blue-600">
                            Duração: {transcription.duration}s
                          </span>
                        )}
                      </div>
                      <p className="text-gray-800">{transcription.text}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => copyToClipboard(transcription.text)}
                        className="text-blue-600 hover:text-blue-700"
                        title="Copiar"
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        onClick={() => removeTranscription(transcription.id)}
                        className="text-red-600 hover:text-red-700"
                        title="Remover"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Texto Final Combinado */}
        {finalText && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Texto Final</h3>
            <textarea
              value={finalText}
              onChange={(e) => setFinalText(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 h-40 resize-none"
              placeholder="O texto transcrito aparecerá aqui..."
            />
            <div className="mt-2 text-sm text-gray-500">
              {finalText.length} caracteres
            </div>
          </div>
        )}

        {/* Informações */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Como Usar</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Configure o idioma e opções antes de iniciar a gravação</li>
            <li>• Clique em "Iniciar Gravação" e fale claramente no microfone</li>
            <li>• Ou carregue um arquivo de áudio para transcrição automática</li>
            <li>• Edite o texto final se necessário</li>
            <li>• Copie o texto ou gere um PDF com os resultados</li>
          </ul>
        </div>

        {/* Limitações */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Limitações</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Requer navegador compatível (Chrome, Edge recomendados)</li>
            <li>• Necessita permissão de acesso ao microfone</li>
            <li>• Processamento de arquivos de áudio é simulado</li>
            <li>• Qualidade da transcrição depende da clareza do áudio</li>
            <li>• Funciona melhor com conexão à internet estável</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}
