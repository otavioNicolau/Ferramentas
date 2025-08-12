// config/language.ts
export type Language =
  | 'pt-BR'
  | 'en'
  | 'es'
  | 'zh'
  | 'hi'
  | 'ar'
  | 'bn'
  | 'ru'
  | 'ja'
  | 'de';

const LANGUAGE_LIST: Language[] = [
  'pt-BR', 'en', 'es', 'zh', 'hi', 'ar', 'bn', 'ru', 'ja', 'de',
];

const isLanguage = (v: unknown): v is Language =>
  typeof v === 'string' && (LANGUAGE_LIST as string[]).includes(v);

const envLang = process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE;
const envLanguage: Language = isLanguage(envLang) ? envLang : 'pt-BR';

export const LANGUAGE_CONFIG = {
  defaultLanguage: envLanguage,
  currentLanguage: envLanguage,

  // Idiomas dis poníveis
  availableLanguages: {
    'pt-BR': { name: 'Português', flag: '🇧🇷', code: 'pt-BR' },
    en: { name: 'English', flag: '🇺🇸', code: 'en' },
    es: { name: 'Español', flag: '🇪🇸', code: 'es' },
    zh: { name: '中文', flag: '🇨🇳', code: 'zh' },
    hi: { name: 'हिन्दी', flag: '🇮🇳', code: 'hi' },
    ar: { name: 'العربية', flag: '🇸🇦', code: 'ar' },
    bn: { name: 'বাংলা', flag: '🇧🇩', code: 'bn' },
    ru: { name: 'Русский', flag: '🇷🇺', code: 'ru' },
    ja: { name: '日本語', flag: '🇯🇵', code: 'ja' },
    de: { name: 'Deutsch', flag: '🇩🇪', code: 'de' },
  },
};

export const setLanguage = (lang: Language) => {
  LANGUAGE_CONFIG.currentLanguage = lang;
};

export const getCurrentLanguage = () => LANGUAGE_CONFIG.currentLanguage;

/* =======================
 * BASE: EN (fallback)
 * ======================= */
const EN_TRANSLATIONS = {
  // Site Meta
  siteTitle: 'Free Online Tools',
  siteName: 'Online Tools',
  siteDescription:
    'Access a comprehensive suite of free online tools for PDF editing, video conversion, image processing and QR code generation. Convert, compress and optimize files securely in your browser.',

  // Navigation
  home: 'Home',
  tools: 'Tools',
  about: 'About',
  contact: 'Contact',
  privacyPolicy: 'Privacy Policy',
  termsOfUse: 'Terms of Use',
  sitemap: 'Sitemap',

  // Pages
  toolsPageTitle: 'Tools',
  toolsPageDescription: 'Explore our collection of free online tools.',
  toolsPageKeywords: ['online tools', 'utilities', 'free tools'],
  aboutPageTitle: 'About',
  aboutPageDescription: 'Learn more about Online Tools.',
  aboutPageKeywords: ['about', 'online tools', 'information'],

  // Hero Section
  heroTitle: 'Free Online Tools',
  heroSubtitle: 'Everything you need in one place',
  heroDescription:
    'Access a complete collection of free online tools to facilitate your work and increase your productivity.',

  // Search and Filter
  searchPlaceholder: 'Search tools...',
  allCategories: 'All',
  totalTools: 'Total:',
  toolsCounter: 'tools available',

  // Footer
  footerText: 'All rights reserved.',
  privacyText: 'We use cookies to improve your experience.',
  cookieMessage: 'This site uses cookies to ensure you get the best experience.',
  acceptCookies: 'Accept',

  // Notepad
  notebookTitle: 'Notepad',
  notebookDescription: 'Write and save your notes quickly.',
  notebook: {
    confirmClear: 'Are you sure you want to clear the notes?',
    saved: 'Saved',
    save: 'Save',
    download: 'Download',
    clear: 'Clear',
    placeholder: 'Type your notes here...',
    characterCount: 'characters',
    yourNotes: 'Your Notes',
    lastModified: 'Last modified',
    autoSaveTitle: 'Auto save',
    autoSaveDescription:
      'Your notes are automatically saved every few seconds.',
    privacyTitle: 'Privacy',
    privacyDescription: 'All content is stored only in your browser.',
    exportTitle: 'Export',
    exportDescription: 'Download your notes as a text file.',
  },

  // OCR
  ocrTitle: 'Extract Text (OCR)',
  ocrDescription: 'Extract text from images using optical character recognition.',
  ocr: {
    selectOrDrag: 'Select or drag images',
    supportedFormats: 'Supported formats: JPG, PNG, BMP or WEBP',
    chooseImages: 'Choose images',
    ocrSettings: 'OCR settings',
    textLanguage: 'Text language',
    showPreview: 'Show preview',
    selectedImages: 'Selected images',
    processing: 'Processing...',
    extractText: 'Extract text',
    processingOcr: 'Processing OCR...',
    textExtracted: 'Text extracted',
    confidence: 'Confidence',
    noTextFound: 'No text found',
    copy: 'Copy',
    download: 'Download',
    removeFile: 'Remove file',
    downloadAll: 'Download all',
    noImagesSelected: 'No images selected',
    selectImagesHint: 'Select images to start',
    aboutOcr: 'About OCR',
    imageQuality: 'High quality images provide better results.',
    contrast: 'Proper contrast improves accuracy.',
    orientation: 'Ensure text is correctly oriented.',
    languages: 'Choose the correct language of the text.',
    supportedFormatsInfo: 'Supported formats: JPG, PNG, BMP or WEBP.',
    localProcessing: 'Processing happens locally in your browser.',
    tipsTitle: 'Tips',
    tip1: 'Use sharp images.',
    tip2: 'Avoid noisy backgrounds.',
    tip3: 'Good lighting helps recognition.',
    tip4: 'Crop the area that contains text.',
    tip5: 'Use the correct language for better results.',
    onlyImagesSupported: 'Only images are supported.',
    errorProcessingImage: 'Error processing image.',
    errorInitializingOcr: 'Error initializing OCR.',
    textCopied: 'Text copied to clipboard.',
  },

  // Password Generator
  passwordGeneratorTitle: 'Password Generator',
  passwordGeneratorDescription: 'Create secure and custom passwords.',
  passwordGenerator: {
    generatedPassword: 'Generated password',
    copy: 'Copy',
    copied: 'Copied!',
    generate: 'Generate',
    settings: 'Settings',
    length: 'Length',
    includeUppercase: 'Include uppercase letters',
    includeLowercase: 'Include lowercase letters',
    includeNumbers: 'Include numbers',
    includeSymbols: 'Include symbols',
    excludeAmbiguous: 'Exclude ambiguous characters',
    selectAtLeastOne: 'Select at least one option',
    passwordSelected: 'Password selected. Press Ctrl+C to copy.',
    passwordStrength: 'Password strength',
    strengthWeak: 'Weak',
    strengthMedium: 'Medium',
    strengthStrong: 'Strong',
    strengthVeryStrong: 'Very strong',
  },

  // Character Counter
  characterCounterTitle: 'Character Counter',
  characterCounterDescription:
    'Count characters, words, sentences and more in your text.',
  characterCounter: {
    textAreaTitle: 'Text',
    sampleText: 'Sample text',
    clear: 'Clear',
    enterText: 'Type or paste your text here...',
    characters: 'Characters',
    charactersNoSpaces: 'Characters (no spaces)',
    words: 'Words',
    sentences: 'Sentences',
    paragraphs: 'Paragraphs',
    lines: 'Lines',
    additionalInfo: 'Additional information',
    estimatedReadingTime: 'Estimated reading time',
    minutes: 'minutes',
    estimatedSpeakingTime: 'Estimated speaking time',
    averageWordsPerSentence: 'Average words per sentence',
    averageCharsPerWord: 'Average characters per word',
  },

  // QR Code Generator
  qrGeneratorTitle: 'QR Code Generator',
  qrGeneratorDescription: 'Create custom QR codes.',
  qrGenerator: {
    enterContent: 'Enter content to generate the QR Code',
    errorGenerating: 'Error generating QR Code.',
    settings: 'Settings',
    contentType: 'Content type',
    contentTypes: {
      text: 'Text',
      url: 'URL',
      wifi: 'Wi-Fi',
      vcard: 'vCard',
      sms: 'SMS',
    },
    content: 'Content',
    placeholders: {
      text: 'Enter text here...',
      url: 'Enter URL here...',
      wifi: 'SSID;password;encryption',
      vcard: 'Contact information',
      sms: 'Number;Message',
    },
    size: 'Size',
    color: 'Color',
    generate: 'Generate QR Code',
    preview: 'Preview',
    generated: 'QR Code generated',
    download: 'Download',
    previewText: 'The QR Code will appear here after generation.',
  },

  // PDF/A Validator
  pdfaValidatorTitle: 'PDF/A Validator',
  pdfaValidatorDescription:
    'Check if PDF documents comply with PDF/A standards for long-term archiving',
  pdfaValidator: {
    selectFileTitle: 'Select PDF File',
    dragDropHint: 'Drag a PDF file here or click to select',
    onlyPdfHint: 'Only PDF files are accepted',
    selectButton: 'Select File',
    validating: 'Validating PDF/A...',
    checkingPdfa: 'Checking compliance with PDF/A standards',
    resultTitle: 'Validation Result',
    clear: 'Clear',
    fileLabel: 'File:',
    sizeLabel: 'Size:',
    validatedAt: 'Validated on:',
    valid: 'Valid PDF/A',
    invalid: 'Invalid PDF/A',
    detectedLevel: 'Detected level:',
    issues: 'Issues Found',
    warnings: 'Warnings',
    aboutTitle: 'ℹ️ About PDF/A',
    aboutItems: [
      'PDF/A is an ISO standard for archiving electronic documents',
      'Ensures documents can be viewed in the future',
      'PDF/A-1: Based on PDF 1.4, more restrictive',
      'PDF/A-2: Based on PDF 1.7, allows more features',
      'PDF/A-3: Allows attachments of external files',
    ],
    tipsTitle: '💡 PDF/A Tips',
    tipsItems: [
      'Embed all fonts in the document',
      'Avoid transparency and special effects',
      'Use consistent RGB or CMYK colors',
      'Include appropriate XMP metadata',
      'Test files with names like "invalid.pdf" or "warning.pdf" to see different results',
    ],
    pdfOnlyAlert: 'Please select only PDF files.',
  },
};

/* =======================
 * LOCAIS
 * ======================= */

// pt-BR (com páginas e navegação + chaves adicionais)
const PT_BR = {
  // Site Meta
  siteTitle: 'Ferramentas Online Gratuitas',
  siteName: 'NICOLLAUTOOLS',
  siteDescription:
    'Acesse uma ampla coleção de ferramentas online gratuitas para editar PDFs, converter vídeos, processar imagens e gerar QR Codes. Converta, compacte e otimize arquivos com segurança direto no navegador.',

  // Navegação
  home: 'Início',
  tools: 'Ferramentas',
  about: 'Sobre',
  contact: 'Contato',
  privacyPolicy: 'Política de Privacidade',
  termsOfUse: 'Termos de Uso',
  sitemap: 'Mapa do Site',

  // Páginas
  toolsPageTitle: 'Ferramentas',
  toolsPageDescription: 'Explore nossa lista de ferramentas online gratuitas.',
  toolsPageKeywords: ['ferramentas online', 'utilidades', 'ferramentas gratuitas'],
  aboutPageTitle: 'Sobre',
  aboutPageDescription: 'Saiba mais sobre o NICOLLAUTOOLS.',
  aboutPageKeywords: ['sobre', 'ferramentas online', 'informações'],

  // Hero Section
  heroTitle: 'Ferramentas Online Gratuitas',
  heroSubtitle: 'Tudo que você precisa em um só lugar',
  heroDescription:
    'Acesse uma coleção completa de ferramentas online gratuitas para facilitar seu trabalho e aumentar sua produtividade.',

  // Busca e Filtro
  searchPlaceholder: 'Buscar ferramentas...',
  allCategories: 'Todos',
  totalTools: 'Total:',
  toolsCounter: 'ferramentas disponíveis',

  // Rodapé
  footerText: 'Todos os direitos reservados.',
  privacyText: 'Usamos cookies para melhorar sua experiência.',
  cookieMessage: 'Este site utiliza cookies para garantir a melhor experiência.',
  acceptCookies: 'Aceitar',

  // Bloco de Notas
  notebookTitle: 'Bloco de Notas',
  notebookDescription: 'Escreva e salve suas notas rapidamente.',
  notebook: {
    confirmClear: 'Tem certeza que deseja limpar as notas?',
    saved: 'Salvo',
    save: 'Salvar',
    download: 'Baixar',
    clear: 'Limpar',
    placeholder: 'Digite suas notas aqui...',
    characterCount: 'caracteres',
    yourNotes: 'Suas Notas',
    lastModified: 'Última alteração',
    autoSaveTitle: 'Salvamento automático',
    autoSaveDescription:
      'Suas notas são salvas automaticamente a cada poucos segundos.',
    privacyTitle: 'Privacidade',
    privacyDescription: 'Todo o conteúdo é armazenado apenas no seu navegador.',
    exportTitle: 'Exportar',
    exportDescription: 'Baixe suas notas como um arquivo de texto.',
  },

  // OCR
  ocrTitle: 'Extrair Texto (OCR)',
  ocrDescription:
    'Extraia texto de imagens usando reconhecimento óptico de caracteres.',
  ocr: {
    selectOrDrag: 'Selecione ou arraste imagens',
    supportedFormats: 'Formatos suportados: JPG, PNG, BMP ou WEBP',
    chooseImages: 'Escolher imagens',
    ocrSettings: 'Configurações do OCR',
    textLanguage: 'Idioma do texto',
    showPreview: 'Mostrar prévia',
    selectedImages: 'Imagens selecionadas',
    processing: 'Processando...',
    extractText: 'Extrair texto',
    processingOcr: 'Processando OCR...',
    textExtracted: 'Texto extraído',
    confidence: 'Confiança',
    noTextFound: 'Nenhum texto encontrado',
    copy: 'Copiar',
    download: 'Baixar',
    removeFile: 'Remover arquivo',
    downloadAll: 'Baixar todos',
    noImagesSelected: 'Nenhuma imagem selecionada',
    selectImagesHint: 'Selecione imagens para iniciar',
    aboutOcr: 'Sobre OCR',
    imageQuality: 'Imagens de boa qualidade melhoram os resultados.',
    contrast: 'Ajuste o contraste para maior precisão.',
    orientation: 'Mantenha o texto na orientação correta.',
    languages: 'Escolha o idioma certo para o texto.',
    supportedFormatsInfo: 'Formatos suportados: JPG, PNG, BMP ou WEBP.',
    localProcessing: 'O processamento acontece localmente no seu navegador.',
    tipsTitle: 'Dicas',
    tip1: 'Use imagens nítidas.',
    tip2: 'Evite fundos com muito ruído.',
    tip3: 'Iluminação adequada ajuda na leitura.',
    tip4: 'Recorte a área que contém o texto.',
    tip5: 'Utilize o idioma correto para melhores resultados.',
    onlyImagesSupported: 'Apenas imagens são suportadas.',
    errorProcessingImage: 'Erro ao processar imagem.',
    errorInitializingOcr: 'Erro ao iniciar OCR.',
    textCopied: 'Texto copiado para a área de transferência.',
  },

  // Gerador de Senhas
  passwordGeneratorTitle: 'Gerador de Senhas',
  passwordGeneratorDescription: 'Crie senhas seguras e personalizadas.',
  passwordGenerator: {
    generatedPassword: 'Senha gerada',
    copy: 'Copiar',
    copied: 'Copiado!',
    generate: 'Gerar',
    settings: 'Configurações',
    length: 'Comprimento',
    includeUppercase: 'Incluir letras maiúsculas',
    includeLowercase: 'Incluir letras minúsculas',
    includeNumbers: 'Incluir números',
    includeSymbols: 'Incluir símbolos',
    excludeAmbiguous: 'Excluir caracteres ambíguos',
    selectAtLeastOne: 'Selecione pelo menos uma opção',
    passwordSelected: 'Senha selecionada. Pressione Ctrl+C para copiar.',
    passwordStrength: 'Força da senha',
    strengthWeak: 'Fraca',
    strengthMedium: 'Média',
    strengthStrong: 'Forte',
    strengthVeryStrong: 'Muito forte',
  },

  // Contador de Caracteres
  characterCounterTitle: 'Contador de Caracteres',
  characterCounterDescription: 'Conte caracteres, palavras, frases e mais.',
  characterCounter: {
    textAreaTitle: 'Texto',
    sampleText: 'Texto de exemplo',
    clear: 'Limpar',
    enterText: 'Digite ou cole seu texto aqui...',
    characters: 'Caracteres',
    charactersNoSpaces: 'Caracteres (sem espaços)',
    words: 'Palavras',
    sentences: 'Frases',
    paragraphs: 'Parágrafos',
    lines: 'Linhas',
    additionalInfo: 'Informações adicionais',
    estimatedReadingTime: 'Tempo estimado de leitura',
    minutes: 'minutos',
    estimatedSpeakingTime: 'Tempo estimado de fala',
    averageWordsPerSentence: 'Média de palavras por frase',
    averageCharsPerWord: 'Média de caracteres por palavra',
  },

  // QR Code
  qrGeneratorTitle: 'Gerador de QR Code',
  qrGeneratorDescription: 'Crie códigos QR personalizados.',
  qrGenerator: {
    enterContent: 'Digite o conteúdo para gerar o QR Code',
    errorGenerating: 'Erro ao gerar QR Code.',
    settings: 'Configurações',
    contentType: 'Tipo de conteúdo',
    contentTypes: {
      text: 'Texto',
      url: 'URL',
      wifi: 'Wi-Fi',
      vcard: 'vCard',
      sms: 'SMS',
    },
    content: 'Conteúdo',
    placeholders: {
      text: 'Digite o texto aqui...',
      url: 'Digite a URL aqui...',
      wifi: 'SSID;senha;criptografia',
      vcard: 'Informações do contato',
      sms: 'Número;Mensagem',
    },
    size: 'Tamanho',
    color: 'Cor',
    generate: 'Gerar QR Code',
    preview: 'Pré-visualização',
    generated: 'QR Code gerado',
    download: 'Baixar',
    previewText: 'O QR Code aparecerá aqui após a geração.',
  },

  // PDF/A
  pdfaValidatorTitle: 'Validador PDF/A',
  pdfaValidatorDescription:
    'Valide se documentos PDF estão em conformidade com os padrões PDF/A para arquivamento de longo prazo',
  pdfaValidator: {
    selectFileTitle: 'Selecionar Arquivo PDF',
    dragDropHint: 'Arraste um arquivo PDF aqui ou clique para selecionar',
    onlyPdfHint: 'Apenas arquivos PDF são aceitos',
    selectButton: 'Selecionar Arquivo',
    validating: 'Validando PDF/A...',
    checkingPdfa: 'Verificando conformidade com padrões PDF/A',
    resultTitle: 'Resultado da Validação',
    clear: 'Limpar',
    fileLabel: 'Arquivo:',
    sizeLabel: 'Tamanho:',
    validatedAt: 'Validado em:',
    valid: 'PDF/A Válido',
    invalid: 'PDF/A Inválido',
    detectedLevel: 'Nível detectado:',
    issues: 'Problemas Encontrados',
    warnings: 'Avisos',
    aboutTitle: 'ℹ️ Sobre PDF/A',
    aboutItems: [
      'PDF/A é um padrão ISO para arquivamento de documentos eletrônicos',
      'Garante que documentos possam ser visualizados no futuro',
      'PDF/A-1: Baseado em PDF 1.4, mais restritivo',
      'PDF/A-2: Baseado em PDF 1.7, permite mais recursos',
      'PDF/A-3: Permite anexos de arquivos externos',
    ],
    tipsTitle: '💡 Dicas para PDF/A',
    tipsItems: [
      'Incorpore todas as fontes no documento',
      'Evite transparências e efeitos especiais',
      'Use cores RGB ou CMYK consistentes',
      'Inclua metadados XMP apropriados',
      'Teste arquivos com nomes como "invalid.pdf" ou "warning.pdf" para ver diferentes resultados',
    ],
    pdfOnlyAlert: 'Por favor, selecione apenas arquivos PDF.',
  },
};

// Demais idiomas: herdando EN + sobrescrevendo o essencial
const ES = {
  ...EN_TRANSLATIONS,
  siteTitle: 'Herramientas Online Gratuitas',
  siteName: 'Herramientas Online',
  siteDescription:
    'Accede a una colección completa de herramientas en línea gratuitas para editar PDF, convertir videos, procesar imágenes y generar códigos QR. Convierte, comprime y optimiza archivos de forma segura en tu navegador.',
  home: 'Inicio',
  tools: 'Herramientas',
  about: 'Acerca de',
  contact: 'Contacto',
  heroTitle: 'Herramientas Online Gratuitas',
  heroSubtitle: 'Todo lo que necesitas en un solo lugar',
  heroDescription:
    'Accede a una colección completa de herramientas en línea gratuitas para facilitar tu trabajo y aumentar tu productividad.',
  searchPlaceholder: 'Buscar herramientas...',
  allCategories: 'Todos',
  totalTools: 'Total:',
  toolsCounter: 'herramientas disponibles',
  notebookTitle: 'Bloc de Notas',
  notebookDescription: 'Escribe y guarda tus notas rápidamente.',
  notebook: {
    ...EN_TRANSLATIONS.notebook,
    confirmClear: '¿Seguro que deseas borrar las notas?',
    saved: 'Guardado',
    save: 'Guardar',
    download: 'Descargar',
    clear: 'Borrar',
    placeholder: 'Escribe tus notas aquí...',
    characterCount: 'caracteres',
    yourNotes: 'Tus Notas',
    lastModified: 'Última modificación',
    autoSaveTitle: 'Guardado automático',
    autoSaveDescription:
      'Tus notas se guardan automáticamente cada pocos segundos.',
    privacyTitle: 'Privacidad',
    privacyDescription: 'Todo el contenido se almacena solo en tu navegador.',
    exportTitle: 'Exportar',
    exportDescription: 'Descarga tus notas como un archivo de texto.',
  },
};

const ZH = {
  ...EN_TRANSLATIONS,
  siteTitle: '免费在线工具',
  siteName: '在线工具',
  siteDescription:
    '访问完整的免费在线工具集合，用于PDF编辑、视频转换、图像处理和二维码生成。在浏览器中安全地转换、压缩和优化文件。',
  home: '首页',
  tools: '工具',
  about: '关于',
  contact: '联系',
  heroTitle: '免费在线工具',
  heroSubtitle: '所需的一切尽在一个地方',
  heroDescription:
    '访问完整的免费在线工具集合，方便工作并提升效率。',
  searchPlaceholder: '搜索工具...',
  allCategories: '全部',
  totalTools: '总计:',
  toolsCounter: '个可用工具',
  notebookTitle: '记事本',
  notebookDescription: '快速编写并保存你的笔记。',
  notebook: {
    ...EN_TRANSLATIONS.notebook,
    confirmClear: '确定要清空笔记吗？',
    saved: '已保存',
    save: '保存',
    download: '下载',
    clear: '清空',
    placeholder: '在此输入你的笔记...',
    characterCount: '字符',
    yourNotes: '你的笔记',
    lastModified: '最后修改',
    autoSaveTitle: '自动保存',
    autoSaveDescription: '你的笔记会每隔几秒自动保存。',
    privacyTitle: '隐私',
    privacyDescription: '所有内容仅存储在你的浏览器中。',
    exportTitle: '导出',
    exportDescription: '将你的笔记下载为文本文件。',
  },
};

const HI = {
  ...EN_TRANSLATIONS,
  siteTitle: 'मुफ़्त ऑनलाइन उपकरण',
  siteName: 'ऑनलाइन उपकरण',
  siteDescription:
    'PDF संपादन, वीडियो रूपांतरण, छवि प्रोसेसिंग और QR कोड जनरेशन के लिए मुफ़्त ऑनलाइन उपकरणों का पूरा संग्रह एक्सेस करें। अपने ब्राउज़र में सुरक्षित रूप से फ़ाइलों को कन्वर्ट, कंप्रेस और ऑप्टिमाइज़ करें।',
  home: 'मुखपृष्ठ',
  tools: 'उपकरण',
  about: 'परिचय',
  contact: 'संपर्क',
  heroTitle: 'मुफ़्त ऑनलाइन उपकरण',
  heroSubtitle: 'जो कुछ आपको चाहिए, सब एक जगह',
  heroDescription:
    'अपने कार्य को आसान बनाने और उत्पादकता बढ़ाने के लिए मुफ़्त ऑनलाइन उपकरणों का पूरा संग्रह एक्सेस करें।',
  searchPlaceholder: 'उपकरण खोजें...',
  allCategories: 'सभी',
  totalTools: 'कुल:',
  toolsCounter: 'उपलब्ध उपकरण',
  notebookTitle: 'नोटपैड',
  notebookDescription: 'जल्दी से अपनी नोट्स लिखें और सहेजें।',
  notebook: {
    ...EN_TRANSLATIONS.notebook,
    confirmClear: 'क्या आप वास्तव में नोट्स साफ़ करना चाहते हैं?',
    saved: 'सहेजा गया',
    save: 'सहेजें',
    download: 'डाउनलोड',
    clear: 'साफ़ करें',
    placeholder: 'यहाँ अपनी नोट्स टाइप करें...',
    characterCount: 'अक्षर',
    yourNotes: 'आपकी नोट्स',
    lastModified: 'अंतिम संशोधन',
    autoSaveTitle: 'स्वचालित सहेजना',
    autoSaveDescription: 'आपकी नोट्स कुछ सेकंड में स्वतः सहेजी जाती हैं।',
    privacyTitle: 'गोपनीयता',
    privacyDescription: 'सारी सामग्री केवल आपके ब्राउज़र में संग्रहीत होती है।',
    exportTitle: 'निर्यात',
    exportDescription: 'अपनी नोट्स को टेक्स्ट फ़ाइल के रूप में डाउनलोड करें।',
  },
};

const AR = {
  ...EN_TRANSLATIONS,
  siteTitle: 'أدوات مجانية على الإنترنت',
  siteName: 'أدوات الإنترنت',
  siteDescription:
    'الوصول إلى مجموعة كاملة من الأدوات المجانية على الإنترنت لتحرير ملفات PDF وتحويل الفيديو ومعالجة الصور وإنشاء رموز QR. حوّل واضغط وحسّن الملفات بأمان داخل متصفحك.',
  home: 'الرئيسية',
  tools: 'الأدوات',
  about: 'حول',
  contact: 'اتصل',
  heroTitle: 'أدوات مجانية على الإنترنت',
  heroSubtitle: 'كل ما تحتاجه في مكان واحد',
  heroDescription:
    'الوصول إلى مجموعة كاملة من الأدوات المجانية على الإنترنت لتسهيل عملك وزيادة إنتاجيتك.',
  searchPlaceholder: 'ابحث عن الأدوات...',
  allCategories: 'الكل',
  totalTools: 'المجموع:',
  toolsCounter: 'أدوات متاحة',
  notebookTitle: 'المفكرة',
  notebookDescription: 'اكتب واحفظ ملاحظاتك بسرعة.',
  notebook: {
    ...EN_TRANSLATIONS.notebook,
    confirmClear: 'هل أنت متأكد أنك تريد مسح الملاحظات؟',
    saved: 'تم الحفظ',
    save: 'حفظ',
    download: 'تحميل',
    clear: 'مسح',
    placeholder: 'اكتب ملاحظاتك هنا...',
    characterCount: 'أحرف',
    yourNotes: 'ملاحظاتك',
    lastModified: 'آخر تعديل',
    autoSaveTitle: 'حفظ تلقائي',
    autoSaveDescription: 'يتم حفظ ملاحظاتك تلقائيًا كل بضع ثوانٍ.',
    privacyTitle: 'الخصوصية',
    privacyDescription: 'يتم تخزين كل المحتوى في متصفحك فقط.',
    exportTitle: 'تصدير',
    exportDescription: 'قم بتنزيل ملاحظاتك كملف نصي.',
  },
};

const BN = {
  ...EN_TRANSLATIONS,
  siteTitle: 'বিনামূল্যের অনলাইন টুলস',
  siteName: 'অনলাইন টুলস',
  siteDescription:
    'PDF সম্পাদনা, ভিডিও রূপান্তর, ইমেজ প্রক্রিয়াকরণ এবং QR কোড তৈরির জন্য বিনামূল্যের অনলাইন টুলসের পূর্ণ সংগ্রহে প্রবেশ করুন। আপনার ব্রাউজারে নিরাপদে ফাইল রূপান্তর, সংকুচিত ও অপ্টিমাইজ করুন।',
  home: 'হোম',
  tools: 'টুলস',
  about: 'সম্পর্কে',
  contact: 'যোগাযোগ',
  heroTitle: 'বিনামূল্যের অনলাইন টুলস',
  heroSubtitle: 'যা কিছু আপনার প্রয়োজন, সব এক জায়গায়',
  heroDescription:
    'আপনার কাজ সহজ করতে এবং উৎপাদনশীলতা বাড়াতে বিনামূল্যের অনলাইন টুলসের পূর্ণ সংগ্রহ অ্যাক্সেস করুন।',
  searchPlaceholder: 'টুলস খুঁজুন...',
  allCategories: 'সব',
  totalTools: 'মোট:',
  toolsCounter: 'উপলব্ধ টুলস',
  notebookTitle: 'নোটপ্যাড',
  notebookDescription: 'দ্রুত আপনার নোট লিখুন এবং সংরক্ষণ করুন।',
  notebook: {
    ...EN_TRANSLATIONS.notebook,
    confirmClear: 'আপনি কি নিশ্চিত যে নোটগুলি মুছে ফেলবেন?',
    saved: 'সংরক্ষিত',
    save: 'সংরক্ষণ করুন',
    download: 'ডাউনলোড',
    clear: 'মুছুন',
    placeholder: 'এখানে আপনার নোট লিখুন...',
    characterCount: 'অক্ষর',
    yourNotes: 'আপনার নোট',
    lastModified: 'শেষ সংশোধন',
    autoSaveTitle: 'স্বয়ংক্রিয় সংরক্ষণ',
    autoSaveDescription:
      'আপনার নোট কয়েক সেকেন্ড পরপর স্বয়ংক্রিয়ভাবে সংরক্ষণ করা হয়।',
    privacyTitle: 'গোপনীয়তা',
    privacyDescription:
      'সমস্ত বিষয়বস্তু শুধুমাত্র আপনার ব্রাউজারে সংরক্ষিত হয়।',
    exportTitle: 'রপ্তানি',
    exportDescription: 'আপনার নোটগুলি টেক্সট ফাইল হিসাবে ডাউনলোড করুন।',
  },
};

const RU = {
  ...EN_TRANSLATIONS,
  siteTitle: 'Бесплатные онлайн-инструменты',
  siteName: 'Онлайн-инструменты',
  siteDescription:
    'Получите доступ к полной коллекции бесплатных онлайн‑инструментов для редактирования PDF, преобразования видео, обработки изображений и генерации QR‑кодов. Конвертируйте, сжимайте и оптимизируйте файлы безопасно прямо в браузере.',
  home: 'Главная',
  tools: 'Инструменты',
  about: 'О нас',
  contact: 'Контакты',
  heroTitle: 'Бесплатные онлайн-инструменты',
  heroSubtitle: 'Все, что вам нужно, в одном месте',
  heroDescription:
    'Получите доступ к полной коллекции бесплатных онлайн-инструментов, чтобы облегчить вашу работу и повысить продуктивность.',
  searchPlaceholder: 'Поиск инструментов...',
  allCategories: 'Все',
  totalTools: 'Всего:',
  toolsCounter: 'доступных инструментов',
  notebookTitle: 'Блокнот',
  notebookDescription: 'Быстро записывайте и сохраняйте свои заметки.',
  notebook: {
    ...EN_TRANSLATIONS.notebook,
    confirmClear: 'Вы уверены, что хотите очистить заметки?',
    saved: 'Сохранено',
    save: 'Сохранить',
    download: 'Скачать',
    clear: 'Очистить',
    placeholder: 'Введите свои заметки здесь...',
    characterCount: 'символов',
    yourNotes: 'Ваши заметки',
    lastModified: 'Последнее изменение',
    autoSaveTitle: 'Автосохранение',
    autoSaveDescription:
      'Ваши заметки автоматически сохраняются каждые несколько секунд.',
    privacyTitle: 'Конфиденциальность',
    privacyDescription:
      'Все содержимое хранится только в вашем браузере.',
    exportTitle: 'Экспорт',
    exportDescription: 'Скачайте свои заметки как текстовый файл.',
  },
};

const JA = {
  ...EN_TRANSLATIONS,
  siteTitle: '無料オンラインツール',
  siteName: 'オンラインツール',
  siteDescription:
    'PDF編集、動画変換、画像処理、QRコード生成のための無料オンラインツールのフルセットを利用できます。ブラウザ内で安全にファイルを変換・圧縮・最適化しましょう。',
  home: 'ホーム',
  tools: 'ツール',
  about: '概要',
  contact: '連絡先',
  heroTitle: '無料オンラインツール',
  heroSubtitle: '必要なものがすべてここに',
  heroDescription:
    '作業を簡単にし、生産性を高めるための無料オンラインツールの完全なコレクションにアクセスしましょう。',
  searchPlaceholder: 'ツールを検索...',
  allCategories: 'すべて',
  totalTools: '合計:',
  toolsCounter: '利用可能なツール',
  notebookTitle: 'ノートパッド',
  notebookDescription: '素早くメモを書いて保存します。',
  notebook: {
    ...EN_TRANSLATIONS.notebook,
    confirmClear: '本当にメモを消去しますか？',
    saved: '保存済み',
    save: '保存',
    download: 'ダウンロード',
    clear: 'クリア',
    placeholder: 'ここにメモを入力...',
    characterCount: '文字',
    yourNotes: 'あなたのメモ',
    lastModified: '最終更新',
    autoSaveTitle: '自動保存',
    autoSaveDescription:
      'メモは数秒ごとに自動的に保存されます。',
    privacyTitle: 'プライバシー',
    privacyDescription: 'すべての内容はブラウザにのみ保存されます。',
    exportTitle: 'エクスポート',
    exportDescription: 'メモをテキストファイルとしてダウンロードします。',
  },
};

const DE = {
  ...EN_TRANSLATIONS,
  siteTitle: 'Kostenlose Online-Tools',
  siteName: 'Online-Tools',
  siteDescription:
    'Greifen Sie auf eine umfassende Sammlung kostenloser Online‑Tools zur PDF‑Bearbeitung, Videokonvertierung, Bildverarbeitung und QR‑Code‑Erstellung zu. Konvertieren, komprimieren und optimieren Sie Dateien sicher direkt in Ihrem Browser.',
  home: 'Startseite',
  tools: 'Werkzeuge',
  about: 'Über uns',
  contact: 'Kontakt',
  heroTitle: 'Kostenlose Online-Tools',
  heroSubtitle: 'Alles, was Sie brauchen, an einem Ort',
  heroDescription:
    'Greifen Sie auf eine vollständige Sammlung kostenloser Online-Tools zu, um Ihre Arbeit zu erleichtern und Ihre Produktivität zu steigern.',
  searchPlaceholder: 'Werkzeuge suchen...',
  allCategories: 'Alle',
  totalTools: 'Gesamt:',
  toolsCounter: 'verfügbare Werkzeuge',
  notebookTitle: 'Notizblock',
  notebookDescription: 'Schreiben und speichern Sie Ihre Notizen schnell.',
  notebook: {
    ...EN_TRANSLATIONS.notebook,
    confirmClear: 'Möchten Sie die Notizen wirklich löschen?',
    saved: 'Gespeichert',
    save: 'Speichern',
    download: 'Herunterladen',
    clear: 'Löschen',
    placeholder: 'Geben Sie hier Ihre Notizen ein...',
    characterCount: 'Zeichen',
    yourNotes: 'Ihre Notizen',
    lastModified: 'Zuletzt geändert',
    autoSaveTitle: 'Automatisches Speichern',
    autoSaveDescription:
      'Ihre Notizen werden alle paar Sekunden automatisch gespeichert.',
    privacyTitle: 'Datenschutz',
    privacyDescription:
      'Alle Inhalte werden nur in Ihrem Browser gespeichert.',
    exportTitle: 'Exportieren',
    exportDescription: 'Laden Sie Ihre Notizen als Textdatei herunter.',
  },
};

const TRANSLATIONS: Record<Language, typeof EN_TRANSLATIONS> = {
  'pt-BR': PT_BR,
  en: EN_TRANSLATIONS,
  es: ES,
  zh: ZH,
  hi: HI,
  ar: AR,
  bn: BN,
  ru: RU,
  ja: JA,
  de: DE,
};

export const getTranslations = () => TRANSLATIONS[LANGUAGE_CONFIG.currentLanguage];
