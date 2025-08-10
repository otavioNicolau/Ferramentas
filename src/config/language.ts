export const LANGUAGE_CONFIG = {
  defaultLanguage: 'pt-BR',
  currentLanguage: 'pt-BR' as 'pt-BR' | 'en',
  
  // Idiomas disponíveis
  availableLanguages: {
    'pt-BR': {
      name: 'Português',
      flag: '🇧🇷',
      code: 'pt-BR'
    },
    'en': {
      name: 'English', 
      flag: '🇺🇸',
      code: 'en'
    }
  }
};

export const setLanguage = (lang: 'pt-BR' | 'en') => {
  LANGUAGE_CONFIG.currentLanguage = lang;
};

export const getCurrentLanguage = () => LANGUAGE_CONFIG.currentLanguage;

export const getTranslations = () => {
  const lang = getCurrentLanguage();
  
  const translations = {
    'pt-BR': {
      // Site Meta
      siteTitle: 'Ferramentas Online Gratuitas',
      siteName: 'Ferramentas Online',
      siteDescription: 'Acesse uma coleção completa de ferramentas online gratuitas para PDF, conversão de vídeo, geração de QR codes e muito mais.',
      
      // Navegação
      home: 'Início',
      tools: 'Ferramentas',
      about: 'Sobre',
      contact: 'Contato',
      
      // Hero Section
      heroTitle: 'Ferramentas Online Gratuitas',
      heroSubtitle: 'Tudo que você precisa em um só lugar',
      heroDescription: 'Acesse uma coleção completa de ferramentas online gratuitas para facilitar seu trabalho e aumentar sua produtividade.',
      
      // Search and Filter
      searchPlaceholder: 'Buscar ferramentas...',
      allCategories: 'Todos',
      totalTools: 'Total:',
      toolsCounter: 'ferramentas disponíveis'
    },
    'en': {
      // Site Meta
      siteTitle: 'Free Online Tools',
      siteName: 'Online Tools',
      siteDescription: 'Access a complete collection of free online tools for PDF, video conversion, QR code generation and much more.',
      
      // Navigation
      home: 'Home',
      tools: 'Tools',
      about: 'About',
      contact: 'Contact',
      
      // Hero Section
      heroTitle: 'Free Online Tools',
      heroSubtitle: 'Everything you need in one place',
      heroDescription: 'Access a complete collection of free online tools to facilitate your work and increase your productivity.',
      
      // Search and Filter
      searchPlaceholder: 'Search tools...',
      allCategories: 'All',
      totalTools: 'Total:',
      toolsCounter: 'tools available'
    }
  };

  return translations[lang];
};