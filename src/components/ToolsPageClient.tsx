'use client';

import { useEffect, useMemo, useState } from 'react';
import ToolCard from '@/components/ToolCard';
import { Search, X } from 'lucide-react';
import { useI18n } from '@/i18n/client';

interface Tool {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: string; // Nome do ícone como string
  category: string;
}

interface ToolsPageClientProps {
  tools: Tool[];
  categories: string[];
}

// Helpers para normalizar (case/acentos) e gerar chave canônica
const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim();

const toKey = (label: string) => normalize(label).replace(/[^\w]+/g, '_') || 'other';

export default function ToolsPageClient({ tools, categories }: ToolsPageClientProps) {
  const { t } = useI18n();

  // Usamos uma chave estável para categoria selecionada (não depende do texto traduzido)
  const [selectedKey, setSelectedKey] = useState<'all' | string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mapa de categorias (key -> rótulo original)
  // Preferimos a lista importada, mas garantimos também o que estiver nos tools.
  const categoryMap: Record<string, string> = useMemo(() => {
    const map: Record<string, string> = {};
    // 1) das categorias declaradas
    categories.forEach((c) => {
      const k = toKey(String(c));
      if (!map[k]) map[k] = String(c);
    });
    // 2) garantir qualquer categoria presente nos tools
    tools.forEach((t) => {
      const k = toKey(String(t.category));
      if (!map[k]) map[k] = String(t.category);
    });
    return map;
  }, [categories, tools]);

  // Opções de filtro: "todas" + demais categorias ordenadas pelo rótulo traduzido
  const categoryOptions = useMemo(() => {
    const entries = Object.entries(categoryMap).sort((a, b) => {
      const labelA = t(`categories.${a[0]}`, { fallback: a[1] });
      const labelB = t(`categories.${b[0]}`, { fallback: b[1] });
      return labelA.localeCompare(labelB);
    });
    return [{ key: 'all', label: t('filters.allCategories') }, ...entries.map(([key, label]) => ({
      key,
      label: t(`categories.${key}`, { fallback: label }),
    }))];
  }, [categoryMap, t]);

  const normalizedQuery = normalize(searchTerm);

  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const catKey = toKey(String(tool.category));
      const matchesCategory = selectedKey === 'all' || catKey === selectedKey;

      if (!normalizedQuery) return matchesCategory;

      const nTitle = normalize(String(tool.title));
      const nDesc = normalize(String(tool.description));
      const nCat = normalize(String(tool.category));

      const matchesSearch =
        nTitle.includes(normalizedQuery) ||
        nDesc.includes(normalizedQuery) ||
        nCat.includes(normalizedQuery);

      return matchesCategory && matchesSearch;
    });
  }, [selectedKey, normalizedQuery, tools]);

  const count = useMemo(() => new Intl.NumberFormat(undefined).format(filteredTools.length), [filteredTools.length]);

  return (
    <section className="py-10">
      <div className="mx-auto max-w-6xl px-4">
        {/* Search */}
        <div className="mx-auto mb-8 max-w-2xl">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              aria-label={t('search.placeholder')}
              placeholder={t('search.placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white pl-12 pr-12 py-4 text-lg shadow-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-2 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={t('search.clear')}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {categoryOptions.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSelectedKey(key as typeof selectedKey)}
              className={[
                'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                selectedKey === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300',
              ].join(' ')}
              aria-pressed={selectedKey === key}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tools Counter */}
        <div className="mb-8 text-center">
          <p className="text-lg text-gray-600">
            <span className="font-semibold text-blue-600">
              {t('tools.total')}: {count}
            </span>{' '}
            {t('tools.found')}
          </p>
        </div>

        {/* Grid */}
        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
          // Estado vazio
          <div className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-8 text-center">
            <p className="text-xl font-semibold text-gray-900">
              {t('search.noResults')}
            </p>
            <p className="mt-2 text-gray-600">
              {t('search.noResultsDescription')}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}