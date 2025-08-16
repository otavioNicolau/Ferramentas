'use client';

import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Copy, ArrowUpDown, FileText } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';
import { useI18n } from '@/i18n/client';

export default function ConversorBase64Page() {
  const { t } = useI18n();
  const [text, setText] = useState('');
  const [base64, setBase64] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [copied, setCopied] = useState<string | null>(null);

  const encodeToBase64 = (input: string) => {
    try {
      return btoa(unescape(encodeURIComponent(input)));
    } catch (error) {
      return 'Erro: Texto inválido para codificação';
    }
  };

  const decodeFromBase64 = (input: string) => {
    try {
      return decodeURIComponent(escape(atob(input)));
    } catch (error) {
      return 'Erro: Base64 inválido para decodificação';
    }
  };

  const handleTextChange = (value: string) => {
    setText(value);
    if (mode === 'encode') {
      setBase64(encodeToBase64(value));
    }
  };

  const handleBase64Change = (value: string) => {
    setBase64(value);
    if (mode === 'decode') {
      setText(decodeFromBase64(value));
    }
  };

  const switchMode = () => {
    const newMode = mode === 'encode' ? 'decode' : 'encode';
    setMode(newMode);
    
    if (newMode === 'encode' && text) {
      setBase64(encodeToBase64(text));
    } else if (newMode === 'decode' && base64) {
      setText(decodeFromBase64(base64));
    }
  };

  const copyToClipboardUtil = async (content: string, type: string) => {
    const success = await copyToClipboard(content);
    if (success) {
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const clearAll = () => {
    setText('');
    setBase64('');
  };

  const loadExample = () => {
    const exampleText = 'Olá! Este é um exemplo de texto para conversão Base64. 🚀';
    setText(exampleText);
    if (mode === 'encode') {
      setBase64(encodeToBase64(exampleText));
    }
  };

  return (
    <ToolLayout
      title="Conversor Base64"
      description="Codifique e decodifique textos em Base64 de forma rápida e segura."
    >
      <div className="space-y-6">
        {/* Controles */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Modo de Conversão</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setMode('encode')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    mode === 'encode' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Codificar
                </button>
                <button
                  onClick={() => setMode('decode')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    mode === 'decode' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Decodificar
                </button>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={loadExample}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <FileText size={16} />
                Exemplo
              </button>
              <button
                onClick={clearAll}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Limpar
              </button>
            </div>
          </div>
        </div>

        {/* Área de Texto */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {mode === 'encode' ? 'Texto Original' : 'Texto Decodificado'}
            </h3>
            <button
              onClick={() => copyToClipboardUtil(text, 'text')}
              className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
                copied === 'text' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
              disabled={!text}
            >
              <Copy size={16} />
              {copied === 'text' ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
          
          <textarea
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder={mode === 'encode' 
              ? 'Digite o texto que deseja codificar em Base64...' 
              : 'O texto decodificado aparecerá aqui...'
            }
            className="w-full h-32 border border-gray-300 rounded-md p-4 resize-y focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            readOnly={mode === 'decode'}
          />
          
          <div className="mt-2 text-sm text-gray-600">
            Caracteres: {text.length}
          </div>
        </div>

        {/* Botão de Troca */}
        <div className="flex justify-center">
          <button
            onClick={switchMode}
            className="bg-purple-600 text-white p-3 rounded-full hover:bg-purple-700 transition-colors"
            title="Trocar modo de conversão"
          >
            <ArrowUpDown size={20} />
          </button>
        </div>

        {/* Área Base64 */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {mode === 'encode' ? 'Base64 Codificado' : 'Base64 para Decodificar'}
            </h3>
            <button
              onClick={() => copyToClipboardUtil(base64, 'base64')}
              className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
                copied === 'base64' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
              disabled={!base64}
            >
              <Copy size={16} />
              {copied === 'base64' ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
          
          <textarea
            value={base64}
            onChange={(e) => handleBase64Change(e.target.value)}
            placeholder={mode === 'encode' 
              ? 'O Base64 codificado aparecerá aqui...' 
              : 'Cole o Base64 que deseja decodificar...'
            }
            className="w-full h-32 border border-gray-300 rounded-md p-4 resize-y focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            readOnly={mode === 'encode'}
          />
          
          <div className="mt-2 text-sm text-gray-600">
            Caracteres Base64: {base64.length}
          </div>
        </div>

        {/* Informações */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Sobre Base64:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Base64 é um método de codificação que converte dados binários em texto ASCII</li>
            <li>• É amplamente usado para transmitir dados pela internet de forma segura</li>
            <li>• Usado em emails, URLs, APIs e armazenamento de imagens em HTML/CSS</li>
            <li>• A codificação Base64 aumenta o tamanho dos dados em aproximadamente 33%</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}
