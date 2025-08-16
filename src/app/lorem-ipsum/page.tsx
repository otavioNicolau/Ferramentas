'use client';

import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Type, Copy, RotateCcw } from 'lucide-react';
import { useI18n } from '@/i18n/client';
import { copyToClipboard as copyTextToClipboard } from '@/lib/utils';

export default function LoremIpsumPage() {
  const { t } = useI18n();
  const [paragraphs, setParagraphs] = useState(3);
  const [words, setWords] = useState(50);
  const [generationType, setGenerationType] = useState<'paragraphs' | 'words' | 'bytes'>('paragraphs');
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [generatedText, setGeneratedText] = useState('');
  const [copied, setCopied] = useState(false);

  const loremWords = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
    'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
    'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
    'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
    'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
    'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
    'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'at', 'vero', 'eos',
    'accusamus', 'accusantium', 'doloremque', 'laudantium', 'totam', 'rem',
    'aperiam', 'eaque', 'ipsa', 'quae', 'ab', 'illo', 'inventore', 'veritatis',
    'et', 'quasi', 'architecto', 'beatae', 'vitae', 'dicta', 'sunt', 'explicabo',
    'nemo', 'ipsam', 'voluptatem', 'quia', 'voluptas', 'aspernatur', 'aut',
    'odit', 'fugit', 'consequuntur', 'magni', 'dolores', 'ratione', 'sequi',
    'nesciunt', 'neque', 'porro', 'quisquam', 'dolorem', 'adipisci', 'numquam',
    'eius', 'modi', 'tempora', 'incidunt', 'magnam', 'quaerat', 'voluptatem'
  ];

  const generateWords = (count: number): string[] => {
    const result: string[] = [];
    
    if (startWithLorem && count > 0) {
      result.push('Lorem', 'ipsum', 'dolor', 'sit', 'amet');
      count -= 5;
    }

    for (let i = 0; i < count; i++) {
      const randomWord = loremWords[Math.floor(Math.random() * loremWords.length)];
      result.push(randomWord);
    }

    return result;
  };

  const generateParagraph = (wordCount: number): string => {
    const words = generateWords(wordCount);
    let paragraph = '';
    
    for (let i = 0; i < words.length; i++) {
      if (i === 0) {
        paragraph += words[i].charAt(0).toUpperCase() + words[i].slice(1);
      } else {
        paragraph += words[i];
      }

      // Adicionar vírgulas ocasionalmente
      if (i > 0 && i < words.length - 1 && Math.random() < 0.1) {
        paragraph += ',';
      }

      // Adicionar pontos para formar frases
      if (i > 0 && i < words.length - 1 && Math.random() < 0.15) {
        paragraph += '. ';
        if (i + 1 < words.length) {
          paragraph += words[i + 1].charAt(0).toUpperCase() + words[i + 1].slice(1);
          i++;
        }
      } else if (i < words.length - 1) {
        paragraph += ' ';
      }
    }

    paragraph += '.';
    return paragraph;
  };

  const generateText = () => {
    let result = '';

    switch (generationType) {
      case 'paragraphs':
        for (let i = 0; i < paragraphs; i++) {
          result += generateParagraph(Math.floor(Math.random() * 20) + 40);
          if (i < paragraphs - 1) result += '\n\n';
        }
        break;

      case 'words':
        const wordsArray = generateWords(words);
        result = wordsArray.join(' ');
        // Capitalizar primeira palavra
        if (result.length > 0) {
          result = result.charAt(0).toUpperCase() + result.slice(1) + '.';
        }
        break;

      case 'bytes':
        let tempText = '';
        while (tempText.length < words) { // usando 'words' como bytes neste caso
          tempText += generateParagraph(50) + '\n\n';
        }
        result = tempText.substring(0, words);
        break;
    }

    setGeneratedText(result);
  };

  const handleCopyToClipboard = async () => {
    const success = await copyTextToClipboard(generatedText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const clearText = () => {
    setGeneratedText('');
  };

  return (
    <ToolLayout
      title={t.loremIpsumTitle}
      description={t.loremIpsumDescription}
    >
      <div className="space-y-6">
        {/* Configurações */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Type size={20} className="text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-800">Configurações</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Geração
              </label>
              <select
                value={generationType}
                onChange={(e) => setGenerationType(e.target.value as 'paragraphs' | 'words' | 'bytes')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="paragraphs">Parágrafos</option>
                <option value="words">Palavras</option>
                <option value="bytes">Caracteres</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {generationType === 'paragraphs' ? 'Número de Parágrafos' : 
                 generationType === 'words' ? 'Número de Palavras' : 'Número de Caracteres'}
              </label>
              <input
                type="number"
                min="1"
                max={generationType === 'paragraphs' ? 20 : generationType === 'words' ? 1000 : 10000}
                value={generationType === 'paragraphs' ? paragraphs : words}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  if (generationType === 'paragraphs') {
                    setParagraphs(value);
                  } else {
                    setWords(value);
                  }
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center mt-6">
                <input
                  type="checkbox"
                  checked={startWithLorem}
                  onChange={(e) => setStartWithLorem(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Começar com "Lorem ipsum"
                </span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={generateText}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Type size={16} />
              Gerar Texto
            </button>

            {generatedText && (
              <>
                <button
                  onClick={handleCopyToClipboard}
                  className={`px-6 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    copied ? 'bg-green-600 text-white' : 'bg-gray-600 text-white hover:bg-gray-700'
                  }`}
                >
                  <Copy size={16} />
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>

                <button
                  onClick={clearText}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <RotateCcw size={16} />
                  Limpar
                </button>
              </>
            )}
          </div>
        </div>

        {/* Texto Gerado */}
        {generatedText && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Texto Gerado</h3>
              <div className="text-sm text-gray-500">
                {generatedText.length} caracteres, {generatedText.split(' ').length} palavras
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap font-serif">
                {generatedText}
              </p>
            </div>
          </div>
        )}

        {/* Estado vazio */}
        {!generatedText && (
          <div className="text-center py-12 text-gray-600">
            <Type className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="font-medium text-gray-700">Configure as opções e clique em "Gerar Texto"</p>
            <p className="text-sm mt-1 text-gray-500">O texto Lorem Ipsum será gerado automaticamente</p>
          </div>
        )}

        {/* Informações */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">💡 Sobre o Lorem Ipsum:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Texto de preenchimento padrão usado na indústria gráfica</li>
            <li>• Baseado no texto clássico "De Finibus Bonorum et Malorum" de Cícero</li>
            <li>• Ideal para testar layouts sem se distrair com o conteúdo</li>
            <li>• Usado mundialmente por designers e desenvolvedores</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}