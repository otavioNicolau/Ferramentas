import type { Metadata } from 'next';
import { getTranslations } from '@/config/language';

export function generateMetadata(): Metadata {
  const t = getTranslations();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

  return {
    title: t.aboutPageTitle ?? t.about ?? 'Sobre',
    description:
      t.aboutPageDescription ??
      'O NICOLLAUTOOLS oferece diversas ferramentas online gratuitas para facilitar o seu dia a dia.',
    keywords: t.aboutPageKeywords,
    alternates: { canonical: `${baseUrl}/about` },
  };
}

export default function AboutPage() {
  const t = getTranslations();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-8">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            {t.aboutPageTitle ?? t.about}
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed font-light">
            NICOLLAUTOOLS - Transformando a maneira como você trabalha com ferramentas digitais
          </p>
          <div className="mt-8 w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full"></div>
        </div>

        {/* Mission & Vision Cards */}
        <div className="grid lg:grid-cols-2 gap-8 mb-20">
          <div className="group relative overflow-hidden bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Nossa Missão</h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                Democratizar o acesso a ferramentas digitais de alta qualidade, oferecendo soluções gratuitas, 
                seguras e intuitivas que potencializam a produtividade de milhões de usuários globalmente.
              </p>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Nossos Valores</h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                Priorizamos a privacidade absoluta, simplicidade elegante e excelência técnica. 
                Processamento 100% local garante que seus dados permaneçam sempre seguros e privados.
              </p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">Por que nos escolher?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Descubra os diferenciais que tornam nossas ferramentas únicas</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group text-center">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="absolute -inset-4 bg-blue-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">🔒 100% Seguro</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Processamento local no navegador. Zero uploads, máxima privacidade.
              </p>
            </div>

            <div className="group text-center">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="absolute -inset-4 bg-green-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">💚 Totalmente Gratuito</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Sem limites, sem cadastros, sem taxas ocultas. Para sempre.
              </p>
            </div>

            <div className="group text-center">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="absolute -inset-4 bg-purple-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">📱 Responsivo</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Interface otimizada para todos os dispositivos e tamanhos de tela.
              </p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-12 mb-20 shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-bold text-center mb-12 text-white">Ferramentas Disponíveis</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              <div className="group">
                <div className="text-5xl font-bold text-white mb-3 group-hover:scale-110 transition-transform duration-300">85+</div>
                <div className="text-indigo-100 text-lg font-medium">Ferramentas PDF</div>
              </div>
              <div className="group">
                <div className="text-5xl font-bold text-white mb-3 group-hover:scale-110 transition-transform duration-300">25+</div>
                <div className="text-indigo-100 text-lg font-medium">Conversores</div>
              </div>
              <div className="group">
                <div className="text-5xl font-bold text-white mb-3 group-hover:scale-110 transition-transform duration-300">40+</div>
                <div className="text-indigo-100 text-lg font-medium">Utilitários</div>
              </div>
              <div className="group">
                <div className="text-5xl font-bold text-white mb-3 group-hover:scale-110 transition-transform duration-300">10+</div>
                <div className="text-indigo-100 text-lg font-medium">Idiomas</div>
              </div>
            </div>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-8 text-gray-800">Tecnologia de Ponta</h2>
          <p className="text-xl text-gray-600 max-w-5xl mx-auto leading-relaxed mb-12">
            Construído com as tecnologias mais avançadas do mercado para garantir performance excepcional, 
            segurança máxima e experiência de usuário incomparável.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { name: 'Next.js', color: 'from-gray-700 to-black' },
              { name: 'React', color: 'from-blue-400 to-blue-600' },
              { name: 'TypeScript', color: 'from-blue-600 to-blue-800' },
              { name: 'Tailwind CSS', color: 'from-cyan-400 to-cyan-600' },
              { name: 'WebAssembly', color: 'from-purple-500 to-purple-700' },
              { name: 'PWA', color: 'from-green-500 to-green-700' }
            ].map((tech) => (
              <span 
                key={tech.name} 
                className={`px-6 py-3 bg-gradient-to-r ${tech.color} text-white rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300`}
              >
                {tech.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
