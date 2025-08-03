'use client';

import { useState } from 'react';
import ToolCard from '@/components/ToolCard';
import { tools, categories } from '@/data/tools';
import { Search } from 'lucide-react';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTools = tools.filter(tool => {
    const matchesCategory = selectedCategory === 'Todos' || tool.category === selectedCategory;
    const matchesSearch = tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              UtilidadeWeb
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Ferramentas online gratuitas para resolver tarefas do dia a dia
            </p>
            <p className="text-lg text-blue-200 max-w-2xl mx-auto">
              Converta arquivos, edite PDFs, gere QR codes e muito mais. 
              Tudo direto no seu navegador, sem instalação e 100% seguro.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          {/* Search Bar */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar ferramentas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Tools Grid */}
        <section id="ferramentas">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            {selectedCategory === 'Todos' ? 'Todas as Ferramentas' : `Ferramentas de ${selectedCategory}`}
            <span className="text-gray-500 text-lg font-normal ml-2">
              ({filteredTools.length} {filteredTools.length === 1 ? 'ferramenta' : 'ferramentas'})
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool) => (
              <ToolCard
                key={tool.id}
                title={tool.title}
                description={tool.description}
                href={tool.href}
                icon={tool.icon}
                category={tool.category}
              />
            ))}
          </div>

          {filteredTools.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                Nenhuma ferramenta encontrada para &quot;{searchTerm}&quot;
              </p>
            </div>
          )}
        </section>

        {/* About Section */}
        <section id="sobre" className="mt-16 py-12 bg-white rounded-lg border border-gray-200">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Sobre o UtilidadeWeb</h2>
            <div className="max-w-3xl mx-auto">
              <p className="text-lg text-gray-600 mb-6">
                O UtilidadeWeb é uma coleção de ferramentas online gratuitas projetadas para 
                tornar sua vida digital mais fácil. Todas as ferramentas funcionam diretamente 
                no seu navegador, garantindo privacidade e segurança.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🔒</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">100% Seguro</h3>
                  <p className="text-gray-600 text-sm">
                    Seus arquivos são processados localmente no seu navegador
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🆓</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Totalmente Gratuito</h3>
                  <p className="text-gray-600 text-sm">
                    Todas as ferramentas são gratuitas, sem limitações
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Rápido e Fácil</h3>
                  <p className="text-gray-600 text-sm">
                    Interface simples e processamento instantâneo
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
