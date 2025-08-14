'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface SitemapSection {
  title: string;
  description: string;
  links: {
    url: string;
    title: string;
    description: string;
  }[];
}

interface SitemapStats {
  totalRoutes: number;
  categoriesCount: number;
  priorityDistribution: Record<string, number>;
  siteUrl: string;
  generatedAt: string;
}

const sitemapData: SitemapSection[] = [
  {
    title: "Páginas Principais",
    description: "Navegação principal do site",
    links: [
      { url: "/", title: "Página Inicial", description: "Acesso a todas as ferramentas" },
      { url: "/about", title: "Sobre", description: "Conheça nossa missão e valores" },
      { url: "/contact", title: "Contato", description: "Entre em contato conosco" },
      { url: "/tools", title: "Ferramentas", description: "Catálogo completo de ferramentas" },
    ]
  },
  {
    title: "Ferramentas PDF",
    description: "Manipulação e edição de arquivos PDF",
    links: [
      { url: "/compactar-pdf", title: "Compactar PDF", description: "Reduza o tamanho dos seus PDFs" },
      { url: "/compress-pdf", title: "Compress PDF", description: "Compress PDF files efficiently" },
      { url: "/dividir-pdf", title: "Dividir PDF", description: "Separe páginas de um PDF" },
      { url: "/split-pdf", title: "Split PDF", description: "Split PDF into multiple files" },
      { url: "/juntar-pdf", title: "Juntar PDF", description: "Combine múltiplos PDFs em um" },
      { url: "/merge-pdf", title: "Merge PDF", description: "Merge multiple PDF files" },
      { url: "/rotate-pages", title: "Girar Páginas", description: "Rotacione páginas do PDF" },
      { url: "/sort-pages", title: "Ordenar Páginas", description: "Reorganize páginas do PDF" },
      { url: "/crop-pdf", title: "Cortar PDF", description: "Corte áreas específicas do PDF" },
      { url: "/resize-pdf", title: "Redimensionar PDF", description: "Altere o tamanho das páginas" },
      { url: "/optimize-pdf", title: "Otimizar PDF", description: "Otimize PDFs para web" },
      { url: "/protect-pdf", title: "Proteger PDF", description: "Adicione senha ao PDF" },
      { url: "/unlock-pdf", title: "Desbloquear PDF", description: "Remova senha do PDF" },
      { url: "/assinar-pdf", title: "Assinar PDF", description: "Adicione assinatura digital" },
      { url: "/edit-pdf", title: "Editar PDF", description: "Edite texto e imagens" },
      { url: "/repair-pdf", title: "Reparar PDF", description: "Corrija PDFs corrompidos" },
      { url: "/searchable-pdf", title: "PDF Pesquisável", description: "Torne PDFs pesquisáveis" },
      { url: "/validate-pdfa", title: "Validar PDF/A", description: "Valide conformidade PDF/A" },
      { url: "/pdf-creator", title: "Criar PDF", description: "Crie PDFs do zero" },
    ]
  },
  {
    title: "Conversores PDF",
    description: "Converta PDFs para outros formatos e vice-versa",
    links: [
      { url: "/pdf-para-imagem", title: "PDF para Imagem", description: "Converta PDF em imagens" },
      { url: "/pdf-to-jpg", title: "PDF to JPG", description: "Convert PDF to JPG images" },
      { url: "/pdf-to-word", title: "PDF para Word", description: "Converta PDF em documento Word" },
      { url: "/pdf-to-excel", title: "PDF para Excel", description: "Converta PDF em planilha Excel" },
      { url: "/pdf-to-ppt", title: "PDF para PowerPoint", description: "Converta PDF em apresentação" },
      { url: "/pdf-to-text", title: "PDF para Texto", description: "Extraia texto do PDF" },
      { url: "/pdf-to-speech", title: "PDF para Áudio", description: "Converta PDF em áudio" },
      { url: "/pdf-to-pdfa", title: "PDF para PDF/A", description: "Converta para formato arquival" },
      { url: "/word-to-pdf", title: "Word para PDF", description: "Converta documentos Word" },
      { url: "/excel-to-pdf", title: "Excel para PDF", description: "Converta planilhas Excel" },
      { url: "/ppt-to-pdf", title: "PowerPoint para PDF", description: "Converta apresentações" },
      { url: "/imagem-para-pdf", title: "Imagem para PDF", description: "Converta imagens em PDF" },
      { url: "/jpg-to-pdf", title: "JPG para PDF", description: "Converta imagens JPG" },
      { url: "/djvu-to-pdf", title: "DjVu para PDF", description: "Converta arquivos DjVu" },
      { url: "/epub-to-pdf", title: "EPUB para PDF", description: "Converta e-books EPUB" },
    ]
  },
  {
    title: "Ferramentas de Áudio/Vídeo",
    description: "Download e conversão de mídia",
    links: [
      { url: "/baixar-youtube", title: "Baixar YouTube", description: "Download de vídeos do YouTube" },
      { url: "/baixar-tiktok", title: "Baixar TikTok", description: "Download de vídeos do TikTok" },
      { url: "/video-para-mp3", title: "Vídeo para MP3", description: "Extraia áudio de vídeos" },
      { url: "/speech-to-text", title: "Áudio para Texto", description: "Transcreva áudio em texto" },
    ]
  },
  {
    title: "Ferramentas QR Code",
    description: "Geração e leitura de códigos QR",
    links: [
      { url: "/gerar-qrcode", title: "Gerar QR Code", description: "Crie códigos QR personalizados" },
      { url: "/ler-qrcode", title: "Ler QR Code", description: "Decodifique códigos QR" },
    ]
  },
  {
    title: "Ferramentas de Segurança",
    description: "Criptografia e segurança digital",
    links: [
      { url: "/gerador-senha", title: "Gerador de Senhas", description: "Crie senhas seguras" },
      { url: "/hash-generator", title: "Gerador de Hash", description: "Gere hashes MD5, SHA256, etc." },
      { url: "/conversor-base64", title: "Conversor Base64", description: "Codifique/decodifique Base64" },
    ]
  },
  {
    title: "Ferramentas Web",
    description: "Utilitários para desenvolvimento web",
    links: [
      { url: "/encurtador-url", title: "Encurtador de URL", description: "Encurte links longos" },
      { url: "/teste-velocidade", title: "Teste de Velocidade", description: "Teste sua conexão de internet" },
      { url: "/extrair-texto-ocr", title: "OCR - Extrair Texto", description: "Extraia texto de imagens" },
      { url: "/extract-assets", title: "Extrair Assets", description: "Extraia recursos de arquivos" },
      { url: "/remove-assets", title: "Remover Assets", description: "Remova recursos desnecessários" },
      { url: "/status-dependencies", title: "Status das Dependências", description: "Monitore o status das dependências do sistema" },
    ]
  },
  {
    title: "Utilitários",
    description: "Ferramentas úteis para o dia a dia",
    links: [
      { url: "/calculadora", title: "Calculadora", description: "Calculadora científica online" },
      { url: "/cronometro", title: "Cronômetro", description: "Cronômetro e timer online" },
      { url: "/bloco-notas", title: "Bloco de Notas", description: "Editor de texto simples" },
      { url: "/contador-caracteres", title: "Contador de Caracteres", description: "Conte caracteres e palavras" },
      { url: "/lorem-ipsum", title: "Lorem Ipsum", description: "Gerador de texto placeholder" },
      { url: "/conversor-moeda", title: "Conversor de Moeda", description: "Converta entre moedas" },
      { url: "/conversor-unidades", title: "Conversor de Unidades", description: "Converta medidas e unidades" },
      { url: "/gerador-cores", title: "Gerador de Cores", description: "Paleta de cores e códigos" },
    ]
  },
  {
    title: "Outras Ferramentas",
    description: "Ferramentas especializadas",
    links: [
      { url: "/compare-pdf", title: "Comparar PDF", description: "Compare dois arquivos PDF" },
    ]
  },
  {
    title: "Páginas Legais",
    description: "Informações legais e políticas",
    links: [
      { url: "/privacy-policy", title: "Política de Privacidade", description: "Como tratamos seus dados" },
      { url: "/terms-of-use", title: "Termos de Uso", description: "Condições de uso do site" },
    ]
  }
];

export default function SitemapPage() {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));
  const [sitemapStats, setSitemapStats] = useState<SitemapStats | null>(null);

  // Carregar estatísticas do sitemap
  useEffect(() => {
    fetch('/api/sitemap-stats')
      .then(res => res.json())
      .then(data => setSitemapStats(data))
      .catch(err => console.error('Erro ao carregar estatísticas:', err))
  }, []);

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  const expandAll = () => {
    setExpandedSections(new Set(sitemapData.map((_, index) => index)));
  };

  const collapseAll = () => {
    setExpandedSections(new Set());
  };

  const totalLinks = sitemapData.reduce((total, section) => total + section.links.length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            🗺️ Mapa do Site
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Navegue facilmente por todas as nossas ferramentas e páginas
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="bg-white rounded-lg px-6 py-3 shadow-md border border-gray-200">
              <span className="text-2xl font-bold text-blue-600">{sitemapData.length}</span>
              <span className="text-gray-600 ml-2">Categorias</span>
            </div>
            <div className="bg-white rounded-lg px-6 py-3 shadow-md border border-gray-200">
              <span className="text-2xl font-bold text-purple-600">{totalLinks}</span>
              <span className="text-gray-600 ml-2">Ferramentas</span>
            </div>
            {sitemapStats && (
              <>
                <div className="bg-white rounded-lg px-6 py-3 shadow-md border border-gray-200">
                  <span className="text-2xl font-bold text-green-600">{sitemapStats.totalRoutes}</span>
                  <span className="text-gray-600 ml-2">URLs no Sitemap</span>
                </div>
                <div className="bg-white rounded-lg px-6 py-3 shadow-md border border-gray-200">
                  <span className="text-2xl font-bold text-orange-600">⭐</span>
                  <span className="text-gray-600 ml-2">SEO Otimizado</span>
                </div>
              </>
            )}
          </div>
          
          {sitemapStats && (
            <div className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 max-w-4xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">📈 Estatísticas de SEO</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-white rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-600">{sitemapStats.totalRoutes}</div>
                  <div className="text-gray-600">Total de URLs</div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-600">{sitemapStats.priorityDistribution['0.9'] || 0}</div>
                  <div className="text-gray-600">Alta Prioridade</div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-purple-600">{sitemapStats.categoriesCount}</div>
                  <div className="text-gray-600">Categorias SEO</div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-orange-600">{sitemapStats.priorityDistribution['1'] || 0}</div>
                  <div className="text-gray-600">Prioridade Máxima</div>
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-500 text-center">
                Última atualização: {sitemapStats.lastGenerated ? new Date(sitemapStats.lastGenerated).toLocaleString('pt-BR') : 'N/A'}
                <br />
                URL Base: {sitemapStats.siteUrl}
              </div>
            </div>
          )}
          <div className="flex justify-center gap-4">
            <button
              onClick={expandAll}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Expandir Tudo
            </button>
            <button
              onClick={collapseAll}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Recolher Tudo
            </button>
          </div>
        </div>

        {/* Sitemap Sections */}
        <div className="max-w-4xl mx-auto space-y-6">
          {sitemapData.map((section, sectionIndex) => {
            const isExpanded = expandedSections.has(sectionIndex);
            
            return (
              <div key={sectionIndex} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(sectionIndex)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {isExpanded ? (
                        <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronRightIcon className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                    <div className="text-left">
                      <h2 className="text-xl font-semibold text-gray-900">
                        {section.title}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {section.description} • {section.links.length} ferramentas
                      </p>
                    </div>
                  </div>
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {section.links.length}
                  </div>
                </button>

                {/* Section Content */}
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                      {section.links.map((link, linkIndex) => (
                        <Link
                          key={linkIndex}
                          href={link.url}
                          className="group bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 group-hover:bg-blue-600 transition-colors"></div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                {link.title}
                              </h3>
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                {link.description}
                              </p>
                              <span className="text-xs text-blue-600 font-mono mt-1 block">
                                {link.url}
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            🚀 Não encontrou o que procura?
          </h3>
          <p className="text-gray-600 mb-4">
            Estamos sempre adicionando novas ferramentas. Entre em contato para sugestões!
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            📧 Entrar em Contato
          </Link>
        </div>
      </div>
    </div>
  );
}