'use client';

import { useState, useEffect } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { FileText, Type, Hash, Minus } from 'lucide-react';
import { getTranslations } from '@/config/language';

interface TextStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  lines: number;
}

export default function ContadorCaracteresPage() {
  const t = getTranslations();
  const [text, setText] = useState('');
  const [stats, setStats] = useState<TextStats>({
    characters: 0,
    charactersNoSpaces: 0,
    words: 0,
    sentences: 0,
    paragraphs: 0,
    lines: 0
  });

  const calculateStats = (inputText: string): TextStats => {
    if (!inputText) {
      return {
        characters: 0,
        charactersNoSpaces: 0,
        words: 0,
        sentences: 0,
        paragraphs: 0,
        lines: 0
      };
    }

    const characters = inputText.length;
    const charactersNoSpaces = inputText.replace(/\s/g, '').length;
    
    // Palavras: divide por espaços e filtra strings vazias
    const words = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
    
    // Frases: conta pontos finais, exclamações e interrogações
    const sentences = inputText.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    
    // Parágrafos: divide por quebras de linha duplas
    const paragraphs = inputText.trim() ? inputText.split(/\n\s*\n/).filter(p => p.trim().length > 0).length : 0;
    
    // Linhas: conta quebras de linha
    const lines = inputText ? inputText.split('\n').length : 0;

    return {
      characters,
      charactersNoSpaces,
      words,
      sentences,
      paragraphs,
      lines
    };
  };

  useEffect(() => {
    setStats(calculateStats(text));
  }, [text]);

  const StatCard = ({ icon: Icon, label, value, color }: {
    icon: React.ComponentType<{ size: number }>;
    label: string;
    value: number;
    color: string;
  }) => (
    <div className={`${color} rounded-lg p-4 text-white`}>
      <div className="flex items-center gap-3">
        <Icon size={24} />
        <div>
          <div className="text-2xl font-bold">{value.toLocaleString()}</div>
          <div className="text-sm opacity-90">{label}</div>
        </div>
      </div>
    </div>
  );

  const clearText = () => {
    setText('');
  };

  const insertSampleText = () => {
    const sample = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum!`;
    setText(sample);
  };

  return (
    <ToolLayout
      title={t.characterCounterTitle}
      description={t.characterCounterDescription}
    >
      <div className="space-y-6">
        {/* Área de Texto */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">{t.characterCounter.textAreaTitle}</h3>
            <div className="flex gap-2">
              <button
                onClick={insertSampleText}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                {t.characterCounter.sampleText}
              </button>
              <button
                onClick={clearText}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm"
              >
                {t.characterCounter.clear}
              </button>
            </div>
          </div>
          
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.characterCounter.enterText}
            className="w-full h-64 border border-gray-300 rounded-md p-4 resize-y focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            icon={Type}
            label={t.characterCounter.characters}
            value={stats.characters}
            color="bg-blue-600"
          />
          
          <StatCard
            icon={Minus}
            label={t.characterCounter.charactersNoSpaces}
            value={stats.charactersNoSpaces}
            color="bg-green-600"
          />
          
          <StatCard
            icon={Hash}
            label={t.characterCounter.words}
            value={stats.words}
            color="bg-purple-600"
          />
          
          <StatCard
            icon={FileText}
            label={t.characterCounter.sentences}
            value={stats.sentences}
            color="bg-orange-600"
          />
          
          <StatCard
            icon={FileText}
            label={t.characterCounter.paragraphs}
            value={stats.paragraphs}
            color="bg-red-600"
          />
          
          <StatCard
            icon={Minus}
            label={t.characterCounter.lines}
            value={stats.lines}
            color="bg-gray-600"
          />
        </div>

        {/* Informações Adicionais */}
        {text && (
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">{t.characterCounter.additionalInfo}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>{t.characterCounter.estimatedReadingTime}:</strong> {Math.max(1, Math.ceil(stats.words / 200))} {t.characterCounter.minutes}
              </div>
              <div>
                <strong>{t.characterCounter.estimatedSpeakingTime}:</strong> {Math.max(1, Math.ceil(stats.words / 150))} {t.characterCounter.minutes}
              </div>
              <div>
                <strong>{t.characterCounter.averageWordsPerSentence}:</strong> {stats.sentences > 0 ? (stats.words / stats.sentences).toFixed(1) : 0}
              </div>
              <div>
                <strong>{t.characterCounter.averageCharsPerWord}:</strong> {stats.words > 0 ? (stats.charactersNoSpaces / stats.words).toFixed(1) : 0}
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
