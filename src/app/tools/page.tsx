'use client';

import type { Metadata } from 'next';
import { useState, useMemo } from 'react';
import { getTranslations } from '@/config/language';
import ToolCard from '@/components/ToolCard';
import { tools, categories } from '@/data/tools';
import { Search, Filter, Grid, List, Star, TrendingUp } from 'lucide-react';

const t = getTranslations();

export default function ToolsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(t.allCategories);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Filtrar ferramentas baseado na busca e categoria
  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const matchesSearch = tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tool.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === t.allCategories || tool.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  // Contar ferramentas por categoria
  const categoryCount = useMemo(() => {
    const counts: { [key: string]: number } = {};
    tools.forEach(tool => {
      counts[tool.category] = (counts[tool.category] || 0) + 1;
    });
    return counts;
  }, []);

  // Categorias mais populares (com mais ferramentas)
  const popularCategories = useMemo(() => {
    return Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 4)
      .map(([category]) => category);
  }, [categoryCount]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            🛠️ {t.toolsPageTitle}
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Descubra nossa coleção completa de ferramentas online gratuitas para aumentar sua produtividade
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-300" />
              <span>{tools.length}+ Ferramentas</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-300" />
              <span>100% Gratuito</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Barra de Busca e Filtros */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Busca */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar ferramentas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Filtro de Categoria */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                <Filter className="h-5 w-5" />
                <span>Filtros</span>
              </button>

              {/* Modo de Visualização */}
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Filtros Expandidos */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Categorias</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory(t.allCategories)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === t.allCategories
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t.allCategories} ({tools.length})
                </button>
                {categories.slice(1).map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category} ({categoryCount[category] || 0})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Categorias Populares */}
        {searchTerm === '' && selectedCategory === t.allCategories && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">📈 Categorias Populares</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {popularCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all border border-gray-100 hover:border-blue-200 group"
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 group-hover:text-blue-700">
                      {categoryCount[category]}
                    </div>
                    <div className="text-sm font-medium text-gray-700 group-hover:text-gray-800">
                      {category}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Resultados */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              {selectedCategory === t.allCategories
                ? `${t.allCategories} ${t.tools}`
                : selectedCategory}
              <span className="text-gray-500 ml-2">({filteredTools.length})</span>
            </h2>
            {searchTerm && (
              <div className="text-sm text-gray-600">
                Resultados para: <span className="font-semibold">"{searchTerm}"</span>
              </div>
            )}
          </div>
        </div>

        {/* Grid de Ferramentas */}
        {filteredTools.length > 0 ? (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1 max-w-4xl mx-auto'
          }`}>
            {filteredTools.map((tool) => (
              <ToolCard
                key={tool.id}
                id={tool.id}
                title={tool.title}
                description={tool.description}
                href={tool.href}
                icon={tool.icon}
                category={tool.category}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Nenhuma ferramenta encontrada
            </h3>
            <p className="text-gray-500 mb-6">
              Tente ajustar sua busca ou selecionar uma categoria diferente
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory(t.allCategories);
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Limpar Filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
