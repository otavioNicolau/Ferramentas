'use client';

import { useEffect, useState } from 'react';
import { getTranslations } from '@/config/language';

export default function CookieBanner() {
  const [accepted, setAccepted] = useState(true);
  const t = getTranslations();

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    setAccepted(consent === 'accepted');
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setAccepted(true);
  };

  if (accepted) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 bg-gray-900 text-white p-4 flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0 z-50">
      <p className="text-sm">{t.cookieMessage}</p>
      <button
        onClick={acceptCookies}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
      >
        {t.acceptCookies}
      </button>
    </div>
  );
}
