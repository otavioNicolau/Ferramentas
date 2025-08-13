'use client';

import { useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface DependencyStatus {
  name: string;
  version: string;
  installed: boolean;
  installedVersion?: string;
  status: 'installed' | 'outdated' | 'missing';
  type: 'dependency' | 'devDependency';
}

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export default function StatusDependencies() {
  const [dependencies, setDependencies] = useState<DependencyStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'installed' | 'missing' | 'outdated'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'dependency' | 'devDependency'>('all');
  const [isProduction, setIsProduction] = useState(false);

  useEffect(() => {
    checkDependencies();
  }, []);

  const checkDependencies = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Buscar informações do package.json
      const response = await fetch('/api/dependencies/status');
      if (!response.ok) {
        throw new Error('Falha ao buscar status das dependências');
      }
      
      const data = await response.json();
      setDependencies(data.dependencies);
      
      // Detectar se estamos em produção baseado nos dados retornados
      const prodDeps = data.dependencies.filter((d: DependencyStatus) => d.type === 'dependency' && d.status === 'installed');
      const totalDeps = data.dependencies.filter((d: DependencyStatus) => d.type === 'dependency');
      setIsProduction(prodDeps.length === totalDeps.length && totalDeps.length > 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const filteredDependencies = dependencies.filter(dep => {
    const statusMatch = filter === 'all' || dep.status === filter;
    const typeMatch = typeFilter === 'all' || dep.type === typeFilter;
    return statusMatch && typeMatch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'installed':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'outdated':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      case 'missing':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'installed':
        return 'text-green-600 bg-green-50';
      case 'outdated':
        return 'text-yellow-600 bg-yellow-50';
      case 'missing':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const stats = {
    total: dependencies.length,
    installed: dependencies.filter(d => d.status === 'installed').length,
    outdated: dependencies.filter(d => d.status === 'outdated').length,
    missing: dependencies.filter(d => d.status === 'missing').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Verificando dependências...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <XCircleIcon className="w-12 h-12 text-red-500 mx-auto" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Erro ao carregar dependências</h2>
            <p className="mt-2 text-gray-600">{error}</p>
            <button
              onClick={checkDependencies}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Status das Dependências</h1>
          <p className="mt-2 text-gray-600">
            Visualize o status de todas as dependências do projeto
          </p>
          
          {isProduction && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="w-5 h-5 text-blue-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>Ambiente de Produção:</strong> As dependências principais estão instaladas e funcionais. 
                    DevDependencies não são instaladas em produção por questões de segurança e performance.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">{stats.total}</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="text-lg font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="w-8 h-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Instaladas</p>
                <p className="text-lg font-semibold text-gray-900">{stats.installed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="w-8 h-8 text-yellow-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Desatualizadas</p>
                <p className="text-lg font-semibold text-gray-900">{stats.outdated}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircleIcon className="w-8 h-8 text-red-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Ausentes</p>
                <p className="text-lg font-semibold text-gray-900">{stats.missing}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Status
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos</option>
                <option value="installed">Instaladas</option>
                <option value="outdated">Desatualizadas</option>
                <option value="missing">Ausentes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Tipo
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos</option>
                <option value="dependency">Dependências</option>
                <option value="devDependency">Dev Dependências</option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={checkDependencies}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Atualizar
              </button>
              
              {!isProduction && (
                <div className="text-xs text-gray-500 self-center">
                  💡 Funcionalidades de instalação disponíveis apenas em desenvolvimento
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dependencies Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Dependências ({filteredDependencies.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Versão Esperada
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Versão Instalada
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDependencies.map((dep, index) => (
                  <tr key={dep.name} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(dep.status)}
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(dep.status)}`}>
                          {dep.status === 'installed' ? 'Instalada' : 
                           dep.status === 'outdated' ? 'Desatualizada' : 'Ausente'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{dep.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{dep.version}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {dep.installedVersion || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        dep.type === 'dependency' ? 'text-blue-600 bg-blue-50' : 'text-purple-600 bg-purple-50'
                      }`}>
                        {dep.type === 'dependency' ? 'Dependência' : 'Dev Dependência'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredDependencies.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhuma dependência encontrada com os filtros aplicados.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}