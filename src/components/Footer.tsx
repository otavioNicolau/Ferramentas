import Link from 'next/link';
import { getTranslations } from '@/config/language';

export default function Footer() {
  const t = getTranslations();
  
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center space-y-4">
          <nav className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/about" className="text-gray-600 hover:text-gray-900">
              {t.about}
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900">
              {t.contact}
            </Link>
            <Link href="/privacy-policy" className="text-gray-600 hover:text-gray-900">
              {t.privacyPolicy}
            </Link>
            <Link href="/terms-of-use" className="text-gray-600 hover:text-gray-900">
              {t.termsOfUse}
            </Link>
            <Link href="/sitemap.xml" className="text-gray-600 hover:text-gray-900">
              {t.sitemap}
            </Link>
          </nav>
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} {t.siteName}. {t.footerText}
          </p>
          <p className="text-gray-500 text-xs">
            {t.privacyText}
          </p>
        </div>
      </div>
    </footer>
  );
}
