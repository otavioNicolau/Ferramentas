import Link from 'next/link';
import { LucideIcon, ArrowRight, Sparkles } from 'lucide-react';

interface ToolCardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  category: string;
}

// Cores por categoria
const categoryColors: { [key: string]: { bg: string; text: string; icon: string; hover: string } } = {
  'PDF': { bg: 'bg-red-50', text: 'text-red-600', icon: 'text-red-500', hover: 'hover:bg-red-100' },
  'Áudio/Vídeo': { bg: 'bg-purple-50', text: 'text-purple-600', icon: 'text-purple-500', hover: 'hover:bg-purple-100' },
  'Audio/Video': { bg: 'bg-purple-50', text: 'text-purple-600', icon: 'text-purple-500', hover: 'hover:bg-purple-100' },
  'Imagem': { bg: 'bg-green-50', text: 'text-green-600', icon: 'text-green-500', hover: 'hover:bg-green-100' },
  'Image': { bg: 'bg-green-50', text: 'text-green-600', icon: 'text-green-500', hover: 'hover:bg-green-100' },
  'QR Code': { bg: 'bg-indigo-50', text: 'text-indigo-600', icon: 'text-indigo-500', hover: 'hover:bg-indigo-100' },
  'Segurança': { bg: 'bg-orange-50', text: 'text-orange-600', icon: 'text-orange-500', hover: 'hover:bg-orange-100' },
  'Security': { bg: 'bg-orange-50', text: 'text-orange-600', icon: 'text-orange-500', hover: 'hover:bg-orange-100' },
  'Web': { bg: 'bg-cyan-50', text: 'text-cyan-600', icon: 'text-cyan-500', hover: 'hover:bg-cyan-100' },
  'Utilidades': { bg: 'bg-gray-50', text: 'text-gray-600', icon: 'text-gray-500', hover: 'hover:bg-gray-100' },
  'Utilities': { bg: 'bg-gray-50', text: 'text-gray-600', icon: 'text-gray-500', hover: 'hover:bg-gray-100' },
  'Texto': { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'text-blue-500', hover: 'hover:bg-blue-100' },
  'Text': { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'text-blue-500', hover: 'hover:bg-blue-100' },
  'Financeiro': { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: 'text-emerald-500', hover: 'hover:bg-emerald-100' },
  'Financial': { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: 'text-emerald-500', hover: 'hover:bg-emerald-100' },
};

export default function ToolCard({ title, description, href, icon: Icon, category }: ToolCardProps) {
  const colors = categoryColors[category] || categoryColors['Utilities'];
  
  return (
    <Link href={href} className="group block h-full">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-blue-200 hover:shadow-xl transition-all duration-300 h-full relative overflow-hidden group-hover:scale-[1.02] transform">
        {/* Efeito de brilho no hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700"></div>
        
        <div className="relative z-10">
          {/* Header com ícone e categoria */}
          <div className="flex items-start justify-between mb-4">
            <div className={`w-14 h-14 ${colors.bg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 relative`}>
              <Icon className={`h-7 w-7 ${colors.icon} group-hover:rotate-12 transition-transform duration-300`} />
              <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Sparkles className="h-4 w-4 text-yellow-400" />
              </div>
            </div>
            <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold ${colors.text} ${colors.bg} rounded-full border ${colors.text.replace('text-', 'border-').replace('-600', '-200')}`}>
              {category}
            </span>
          </div>

          {/* Título */}
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-3 line-clamp-2">
            {title}
          </h3>

          {/* Descrição */}
          <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
            {description}
          </p>

          {/* Footer com call-to-action */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-50">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Usar Ferramenta
            </span>
            <div className="flex items-center space-x-1 text-blue-600 group-hover:text-blue-700 transition-colors">
              <span className="text-sm font-medium">Abrir</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>
        </div>

        {/* Indicador de popularidade (opcional) */}
        <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        </div>
      </div>
    </Link>
  );
}
