import Link from 'next/link';
import { LucideIcon, ArrowRight, Sparkles } from 'lucide-react';
import { useId, useMemo } from 'react';
import { getTranslations } from '@/config/language';

interface ToolCardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  category: string;
}

// Normaliza categoria (remove acentos, baixa caixa, simplifica separadores)
function normalizeCategory(raw: string) {
  const n = raw
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

  if (/\bpdf\b/.test(n)) return 'pdf';
  if (/audio|video|audiovideo|audio\/video/.test(n)) return 'audio_video';
  if (/imagem|image|img|photo|picture|foto/.test(n)) return 'image';
  if (/qr/.test(n)) return 'qr';
  if (/seguranca|security/.test(n)) return 'security';
  if (/\bweb\b/.test(n)) return 'web';
  if (/utilidades|utilities|utils?/.test(n)) return 'utilities';
  if (/texto|text/.test(n)) return 'text';
  if (/finance|financ/.test(n)) return 'financial';
  return 'utilities';
}

// Paleta por categoria
const categoryStyles: Record<
  string,
  { bg: string; text: string; icon: string; hover: string; badgeBorder: string }
> = {
  pdf:        { bg: 'bg-red-50',      text: 'text-red-600',     icon: 'text-red-500',     hover: 'hover:bg-red-50/60',     badgeBorder: 'border-red-200' },
  audio_video:{ bg: 'bg-purple-50',   text: 'text-purple-600',  icon: 'text-purple-500',  hover: 'hover:bg-purple-50/60',  badgeBorder: 'border-purple-200' },
  image:      { bg: 'bg-green-50',    text: 'text-green-600',   icon: 'text-green-500',   hover: 'hover:bg-green-50/60',   badgeBorder: 'border-green-200' },
  qr:         { bg: 'bg-indigo-50',   text: 'text-indigo-600',  icon: 'text-indigo-500',  hover: 'hover:bg-indigo-50/60',  badgeBorder: 'border-indigo-200' },
  security:   { bg: 'bg-orange-50',   text: 'text-orange-600',  icon: 'text-orange-500',  hover: 'hover:bg-orange-50/60',  badgeBorder: 'border-orange-200' },
  web:        { bg: 'bg-cyan-50',     text: 'text-cyan-600',    icon: 'text-cyan-500',    hover: 'hover:bg-cyan-50/60',    badgeBorder: 'border-cyan-200' },
  utilities:  { bg: 'bg-gray-50',     text: 'text-gray-600',    icon: 'text-gray-500',    hover: 'hover:bg-gray-50/60',    badgeBorder: 'border-gray-200' },
  text:       { bg: 'bg-blue-50',     text: 'text-blue-600',    icon: 'text-blue-500',    hover: 'hover:bg-blue-50/60',    badgeBorder: 'border-blue-200' },
  financial:  { bg: 'bg-emerald-50',  text: 'text-emerald-600', icon: 'text-emerald-500', hover: 'hover:bg-emerald-50/60', badgeBorder: 'border-emerald-200' },
};

export default function ToolCard({ title, description, href, icon: Icon, category }: ToolCardProps) {
  const t = getTranslations();
  const gradientId = useId();
  const canonical = useMemo(() => normalizeCategory(category), [category]);
  const colors = categoryStyles[canonical] ?? categoryStyles.utilities;
  const titleId = useId();
  const descId = useId();

  return (
    <Link
      href={href}
      prefetch={false}
      className="group block h-full focus:outline-none"
      aria-labelledby={titleId}
      aria-describedby={descId}
      data-category={canonical}
    >
      <div
        className={[
          'relative overflow-hidden h-full rounded-2xl border p-6 transition-all duration-300',
          'bg-white border-zinc-100',
          'hover:border-blue-200 hover:shadow-xl',
          'focus-visible:ring-2 focus-visible:ring-blue-500',
          'motion-safe:group-hover:scale-[1.02]',
        ].join(' ')}
      >
        {/* brilho em movimento */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -skew-x-12 -translate-x-full bg-gradient-to-r from-transparent via-white to-transparent opacity-0 transition-all duration-700 group-hover:opacity-20 group-hover:translate-x-full"
        />

        {/* glow radial sutil */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />

        <div className="relative z-10">
          {/* Header: Ícone + Badge */}
          <div className="mb-4 flex items-start justify-between">
            <div
              className={[
                'relative flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300',
                colors.bg,
                'motion-safe:group-hover:scale-110',
              ].join(' ')}
            >
              <Icon
                aria-hidden
                className={['h-7 w-7 transition-transform duration-300', colors.icon, 'motion-safe:group-hover:rotate-12'].join(' ')}
              />
              <div className="absolute -top-1 -right-1 opacity-0 transition-opacity duration-300 motion-safe:group-hover:opacity-100">
                <Sparkles aria-hidden className="h-4 w-4 text-yellow-400" />
              </div>
            </div>

            <span
              className={[
                'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border',
                colors.text,
                colors.bg,
                colors.badgeBorder,
              ].join(' ')}
            >
              {category}
            </span>
          </div>

          {/* Título */}
          <h3
            id={titleId}
            className="mb-3 line-clamp-2 text-lg font-bold text-zinc-900 transition-colors group-hover:text-blue-600"
            title={title}
          >
            {title}
          </h3>

          {/* Descrição */}
          <p
            id={descId}
            className="mb-4 line-clamp-3 text-sm leading-relaxed text-zinc-600"
          >
            {description}
          </p>

          {/* Footer CTA */}
          <div className="flex items-center justify-between border-t border-zinc-100 pt-4">
            <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
              {t.useTool}
            </span>
            <span className="inline-flex items-center gap-1 text-blue-600 transition-colors group-hover:text-blue-700">
              <span className="text-sm font-medium">{t.open}</span>
              <ArrowRight
                aria-hidden
                className="h-4 w-4 transition-transform duration-300 motion-safe:group-hover:translate-x-1"
              />
              <span className="sr-only">{t.open} {title}</span>
            </span>
          </div>
        </div>

        {/* Indicador de popularidade */}
        <div
          aria-hidden
          className="absolute left-4 top-4 opacity-0 transition-opacity duration-300 motion-safe:group-hover:opacity-100"
        >
          <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
        </div>
      </div>
    </Link>
  );
}
