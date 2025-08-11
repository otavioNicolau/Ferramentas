const envLanguage =
  (process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE === 'en'
    ? 'en'
    : 'pt-BR') as 'pt-BR' | 'en';

export const LANGUAGE_CONFIG = {
  defaultLanguage: envLanguage,
  currentLanguage: envLanguage,
  
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

      // Páginas
      toolsPageTitle: 'Ferramentas',
      toolsPageDescription: 'Explore nossa lista de ferramentas online gratuitas.',
      toolsPageKeywords: ['ferramentas online', 'utilidades', 'ferramentas gratuitas'],
      aboutPageTitle: 'Sobre',
      aboutPageDescription: 'Saiba mais sobre o Ferramentas Online.',
      aboutPageKeywords: ['sobre', 'ferramentas online', 'informações'],

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
      },

      // QR Code Generator
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
          sms: 'SMS'
        },
        content: 'Conteúdo',
        placeholders: {
          text: 'Digite o texto aqui...',
          url: 'Digite a URL aqui...',
          wifi: 'SSID;senha;criptografia',
          vcard: 'Informações do contato',
          sms: 'Número;Mensagem'
        },
        size: 'Tamanho',
        color: 'Cor',
        generate: 'Gerar QR Code',
        preview: 'Pré-visualização',
        generated: 'QR Code gerado',
        download: 'Baixar',
        previewText: 'O QR Code aparecerá aqui após a geração.'
      },

      // PDF/A Validator
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
          'PDF/A-3: Permite anexos de arquivos externos'
        ],
        tipsTitle: '💡 Dicas para PDF/A',
        tipsItems: [
          'Incorpore todas as fontes no documento',
          'Evite transparências e efeitos especiais',
          'Use cores RGB ou CMYK consistentes',
          'Inclua metadados XMP apropriados',
          'Teste arquivos com nomes como "invalid.pdf" ou "warning.pdf" para ver diferentes resultados'
        ],
        pdfOnlyAlert: 'Por favor, selecione apenas arquivos PDF.'
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
          sms: 'SMS'
        },
        content: 'Content',
        placeholders: {
          text: 'Enter text here...',
          url: 'Enter URL here...',
          wifi: 'SSID;password;encryption',
          vcard: 'Contact information',
          sms: 'Number;Message'
        },
        size: 'Size',
        color: 'Color',
        generate: 'Generate QR Code',
        preview: 'Preview',
        generated: 'QR Code generated',
        download: 'Download',
        previewText: 'The QR Code will appear here after generation.'
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
          'PDF/A-3: Allows attachments of external files'
        ],
        tipsTitle: '💡 PDF/A Tips',
        tipsItems: [
          'Embed all fonts in the document',
          'Avoid transparency and special effects',
          'Use consistent RGB or CMYK colors',
          'Include appropriate XMP metadata',
          'Test files with names like "invalid.pdf" or "warning.pdf" to see different results'
        ],
        pdfOnlyAlert: 'Please select only PDF files.'
      }
    }
  };

  return translations[lang];
};
