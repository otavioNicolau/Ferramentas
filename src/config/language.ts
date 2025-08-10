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
      toolsCounter: 'ferramentas disponíveis',
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
        autoSaveDescription: 'Suas notas são salvas automaticamente a cada poucos segundos.',
        privacyTitle: 'Privacidade',
        privacyDescription: 'Todo o conteúdo é armazenado apenas no seu navegador.',
        exportTitle: 'Exportar',
        exportDescription: 'Baixe suas notas como um arquivo de texto.'
      },

      // OCR
      ocrTitle: 'Extrair Texto (OCR)',
      ocrDescription: 'Extraia texto de imagens usando reconhecimento óptico de caracteres.',
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
        textCopied: 'Texto copiado para a área de transferência.'
      },

      // Password Generator
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
        strengthVeryStrong: 'Muito forte'
      },

      // Character Counter
      characterCounterTitle: 'Contador de Caracteres',
      characterCounterDescription: 'Conte caracteres, palavras, frases e mais em seu texto.',
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
        averageCharsPerWord: 'Média de caracteres por palavra'
      }
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
      toolsCounter: 'tools available',
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
        autoSaveDescription: 'Your notes are automatically saved every few seconds.',
        privacyTitle: 'Privacy',
        privacyDescription: 'All content is stored only in your browser.',
        exportTitle: 'Export',
        exportDescription: 'Download your notes as a text file.'
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
        textCopied: 'Text copied to clipboard.'
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
        strengthVeryStrong: 'Very strong'
      },

      // Character Counter
      characterCounterTitle: 'Character Counter',
      characterCounterDescription: 'Count characters, words, sentences and more in your text.',
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
        averageCharsPerWord: 'Average characters per word'
      }
    }
  };

  return translations[lang];
};
