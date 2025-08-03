import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface ToolCardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  category: string;
}

export default function ToolCard({ title, description, href, icon: Icon, category }: ToolCardProps) {
  return (
    <Link href={href} className="group">
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-200 h-full">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <Icon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="mb-2">
              <span className="inline-block px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full">
                {category}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
              {title}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
