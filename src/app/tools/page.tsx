'use client';

import { useMemo, useState } from 'react';
import { useI18n } from '@/i18n/client';
import ToolCard from '@/components/ToolCard';
import { tools, categories } from '@/data/tools';
import { Search, Filter, Grid, List, Star, TrendingUp, X } from 'lucide-react';

// Helpers: normaliza texto e gera chave canônica estável p/ categoria
const normalize = (s: string) =>
  String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim();

const toKey = (label: string) => normalize(label).replace(/[^\w]+/g, '_') || 'other';

export default function ToolsPage() {
  const { t } = useI18n();

  // Estado
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKey, setSelectedKey] = useState<'all' | string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Mapa de categorias (key estável -> rótulo original)
  const categoryMap: Record<string, string> = useMemo(() => {
    const map: Record<string, string> = {};
    // categorias declaradas no data
    categories.forEach((c) => {
      const k = toKey(String(c));
      if (!map[k]) map[k] = String(c);
    });
    // garantir categorias que só existam em tools
    tools.forEach((tool) => {
      const k = toKey(String(tool.category));
      if (!map[k]) map[k] = String(tool.category);
    });
    return map;
  }, []);

  // Contagem por categoria (usando chave canônica)
  const categoryCount = useMemo(() => {
    const counts: Record<string, number> = {};
    tools.forEach((tool) => {
      const k = toKey(String(tool.category));
      counts[k] = (counts[k] || 0) + 1;
    });
    return counts;
  }, []);

  // Categorias populares (top 4 por quantidade)
  const popularCategories = useMemo(() => {
    return Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
      .map(([k]) => k);
  }, [categoryCount]);

  // Opções de filtro com rótulo traduzido (fallback para original)
  const categoryOptions = useMemo(() => {
    const entries = Object.entries(categoryMap).sort((a, b) => {
      const labelA = (t.categories?.[a[0]] as string) ?? a[1];
      const labelB = (t.categories?.[b[0]] as string) ?? b[1];
      return labelA.localeCompare(labelB);
    });
    return [
      { key: 'all' as const, label: t.allCategories },
      ...entries.map(([key, label]) => ({
        key,
        label: (t.categories?.[key] as string) ?? label,
      })),
    ];
  }, [categoryMap, t.allCategories, t.categories]);

  // Busca acento-insensível
  const nQuery = normalize(searchTerm);

  // Filtragem
  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const catKey = toKey(String(tool.category));
      const matchesCategory = selectedKey === 'all' || catKey === selectedKey;

      if (!nQuery) return matchesCategory;

      const nTitle = normalize(tool.title);
      const nDesc = normalize(tool.description);
      const nCat = normalize(tool.category);

      const matchesSearch = nTitle.includes(nQuery) || nDesc.includes(nQuery) || nCat.includes(nQuery);
      return matchesCategory && matchesSearch;
    });
  }, [selectedKey, nQuery]);

  // UI strings (t.* com fallback)
  const toolsPageTitle = t.toolsPageTitle || t.tools || 'Ferramentas';
  const toolsPageSubtitle = t.toolsPageSubtitle || t.heroSubtitle || '';
  const toolsPageDescription = t.toolsPageDescription || t.heroDescription || '';
  const toolsLabel = t.tools || 'Ferramentas';
  const freeBadge = t.hundredPercentFree || '100% Gratuito';
  const filtersLabel = t.filters || 'Filtros';
  const searchPlaceholder = t.searchPlaceholder || 'Buscar ferramentas...';
  const popularCategoriesTitle = t.popularCategoriesTitle || 'Categorias Populares';
  const categoriesLabel = t.categoriesLabel || 'Categorias';
  const resultsFor = t.resultsFor || 'Resultados para';
  const emptyTitle = t.noToolsTitle || t.emptyResultsTitle || 'Nenhuma ferramenta encontrada';
  const emptySubtitle =
    t.noToolsSubtitle || t.emptyResultsSubtitle || 'Tente ajustar sua busca ou selecionar outra categoria.';
  const clearFilters = t.clearFilters || 'Limpar Filtros';
  const allCategoriesLabel = t.allCategories || 'Todas as categorias';
  const viewGridLabel = t.viewGrid || 'Grade';
  const viewListLabel = t.viewList || 'Lista';

  const totalFmt = new Intl.NumberFormat(undefined).format(tools.length);
  const filteredFmt = new Intl.NumberFormat(undefined).format(filteredTools.length);

  const selectedLabel =
    selectedKey === 'all'
      ? `${allCategoriesLabel} ${toolsLabel}`
      : (t.categories?.[selectedKey] as string) ?? categoryMap[selectedKey] ?? '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            🛠️ {toolsPageTitle}
          </h1>
          {toolsPageSubtitle && (
            <p className="text-xl text-blue-100 mb-2 max-w-3xl mx-auto">{toolsPageSubtitle}</p>
          )}
          {toolsPageDescription && (
            <p className="text-base text-blue-100/90 mb-8 max-w-3xl mx-auto">{toolsPageDescription}</p>
          )}
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-300" />
              <span>
                {totalFmt}+ {toolsLabel}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-300" />
              <span>{freeBadge}</span>
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                aria-label={searchPlaceholder}
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                  aria-label={t.clearSearch || t.clear || 'Limpar busca'}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filtro + Modo de visualização */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters((v) => !v)}
                className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl transition-colors"
                aria-expanded={showFilters}
              >
                <Filter className="h-5 w-5" />
                <span>{filtersLabel}</span>
              </button>

              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white shadow-sm text-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  aria-pressed={viewMode === 'grid'}
                  aria-label={viewGridLabel}
                  title={viewGridLabel}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white shadow-sm text-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  aria-pressed={viewMode === 'list'}
                  aria-label={viewListLabel}
                  title={viewListLabel}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Filtros Expandidos */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">{categoriesLabel}</h3>
              <div className="flex flex-wrap gap-2">
                {categoryOptions.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setSelectedKey(key)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedKey === key
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    aria-pressed={selectedKey === key}
                  >
                    {label}{' '}
                    <span className="opacity-70">
                      (
                      {key === 'all'
                        ? new Intl.NumberFormat(undefined).format(tools.length)
                        : new Intl.NumberFormat(undefined).format(categoryCount[key] || 0)}
                      )
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Categorias Populares */}
        {searchTerm === '' && selectedKey === 'all' && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">📈 {popularCategoriesTitle}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {popularCategories.map((k) => {
                const label = (t.categories?.[k] as string) ?? categoryMap[k];
                return (
                  <button
                    key={k}
                    onClick={() => setSelectedKey(k)}
                    className="bg-white rounded-xl p-4 border border-gray-100 shadow-md hover:shadow-lg hover:border-blue-200 transition-all group"
                  >
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 group-hover:text-blue-700">
                        {new Intl.NumberFormat(undefined).format(categoryCount[k] || 0)}
                      </div>
                      <div className="text-sm font-medium text-gray-700 group-hover:text-gray-800">
                        {label}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Cabeçalho de resultados */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              {selectedLabel}{' '}
              <span className="text-gray-500 ml-2">({filteredFmt})</span>
            </h2>
            {searchTerm && (
              <div className="text-sm text-gray-600">
                {resultsFor}:{' '}
                <span className="font-semibold">&quot;{searchTerm}&quot;</span>
              </div>
            )}
          </div>
        </div>

        {/* Grid/List de ferramentas */}
        {filteredTools.length > 0 ? (
          <div
            className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1 max-w-4xl mx-auto'
            }`}
          >
            {filteredTools.map((tool) => (
              <ToolCard
                key={tool.id}
                // se o componente aceitar `id`, mantemos compat
                // @ts-ignore
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
            <h3 className="text-xl font-semibold text-gray-700 mb-2">{emptyTitle}</h3>
            <p className="text-gray-500 mb-6">{emptySubtitle}</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedKey('all');
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              {clearFilters}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
