import {
  Video,
  Download,
  FileText,
  Merge,
  Split,
  PenTool,
  Image,
  FileImage,
  ScanText,
  QrCode,
  Eye,
  Key,
  Link2,
  Calculator,
  Timer,
  FileEdit,
  Type,
  DollarSign,
  Wifi,
  Edit,
  RotateCw,
  Crop,
  Shield,
  Unlock,
  Settings,
  Wrench,
  Search,
  CheckCircle,
  Book,
  Mic,
  Archive,
  Plus
} from 'lucide-react';
import { getCurrentLanguage } from '@/config/language';

// Dados das ferramentas movidos para toolsData abaixo

const toolsData = {
  'pt-BR': {
    tools: [
      // Áudio/Vídeo
      {
        id: 'video-para-mp3',
        title: 'Conversor de Vídeo para MP3',
        description: 'Converta vídeos em arquivos de áudio MP3 com alta qualidade',
        href: '/video-para-mp3',
        icon: Video,
        category: 'Áudio/Vídeo'
      },
      {
        id: 'baixar-youtube',
        title: 'Download YouTube',
        description: 'Baixe vídeos do YouTube em diferentes formatos e qualidades',
        href: '/baixar-youtube',
        icon: Download,
        category: 'Áudio/Vídeo'
      },
      {
        id: 'baixar-tiktok',
        title: 'Download TikTok',
        description: 'Baixe vídeos do TikTok sem marca d\'água',
        href: '/baixar-tiktok',
        icon: Download,
        category: 'Áudio/Vídeo'
      },
      {
        id: 'speech-to-text',
        title: 'Fala para Texto',
        description: 'Converta áudio em texto usando reconhecimento de voz',
        href: '/speech-to-text',
        icon: Mic,
        category: 'Áudio/Vídeo'
      },
      {
        id: 'pdf-to-speech',
        title: 'PDF para Fala',
        description: 'Converta texto de PDF em áudio falado',
        href: '/pdf-to-speech',
        icon: Mic,
        category: 'Áudio/Vídeo'
      },
      
      // PDF
      {
        id: 'compactar-pdf',
        title: 'Compactar PDF',
        description: 'Reduza o tamanho dos seus arquivos PDF mantendo a qualidade',
        href: '/compactar-pdf',
        icon: Archive,
        category: 'PDF'
      },
      {
        id: 'juntar-pdfs',
        title: 'Juntar PDFs',
        description: 'Una múltiplos arquivos PDF em um só documento',
        href: '/juntar-pdfs',
        icon: Merge,
        category: 'PDF'
      },
      {
        id: 'juntar-pdf',
        title: 'Juntar PDF',
        description: 'Una múltiplos arquivos PDF em um documento',
        href: '/juntar-pdf',
        icon: Merge,
        category: 'PDF'
      },
      {
        id: 'merge-pdf',
        title: 'Mesclar PDF',
        description: 'Mescle vários documentos PDF em um só',
        href: '/merge-pdf',
        icon: Merge,
        category: 'PDF'
      },
      {
        id: 'dividir-pdf',
        title: 'Dividir PDF',
        description: 'Divida documentos PDF em páginas separadas',
        href: '/dividir-pdf',
        icon: Split,
        category: 'PDF'
      },
      {
        id: 'compress-pdf',
        title: 'Comprimir PDF',
        description: 'Comprima arquivos PDF para reduzir o tamanho',
        href: '/compress-pdf',
        icon: Archive,
        category: 'PDF'
      },
      {
        id: 'split-pdf',
        title: 'Dividir PDF',
        description: 'Divida documentos PDF em páginas individuais ou seções',
        href: '/split-pdf',
        icon: Split,
        category: 'PDF'
      },
      {
        id: 'word-to-pdf',
        title: 'Word para PDF',
        description: 'Converta documentos Word para formato PDF',
        href: '/word-to-pdf',
        icon: FileText,
        category: 'PDF'
      },
      {
        id: 'pdf-to-word',
        title: 'PDF para Word',
        description: 'Converta documentos PDF para formato Word',
        href: '/pdf-to-word',
        icon: FileText,
        category: 'PDF'
      },
      {
        id: 'excel-to-pdf',
        title: 'Excel para PDF',
        description: 'Converta planilhas Excel para formato PDF',
        href: '/excel-to-pdf',
        icon: FileText,
        category: 'PDF'
      },
      {
        id: 'pdf-to-excel',
        title: 'PDF para Excel',
        description: 'Converta tabelas PDF para planilhas Excel',
        href: '/pdf-to-excel',
        icon: FileText,
        category: 'PDF'
      },
      {
        id: 'ppt-to-pdf',
        title: 'PPT para PDF',
        description: 'Converta apresentações PowerPoint para PDF',
        href: '/ppt-to-pdf',
        icon: FileText,
        category: 'PDF'
      },
      {
        id: 'pdf-to-ppt',
        title: 'PDF para PPT',
        description: 'Converta documentos PDF para PowerPoint',
        href: '/pdf-to-ppt',
        icon: FileText,
        category: 'PDF'
      },
      {
        id: 'epub-to-pdf',
        title: 'EPUB para PDF',
        description: 'Converta livros EPUB para formato PDF',
        href: '/epub-to-pdf',
        icon: Book,
        category: 'PDF'
      },
      {
        id: 'djvu-to-pdf',
        title: 'DjVu para PDF',
        description: 'Converta arquivos DjVu para formato PDF',
        href: '/djvu-to-pdf',
        icon: FileText,
        category: 'PDF'
      },
      {
        id: 'pdf-to-text',
        title: 'PDF para Texto',
        description: 'Extraia texto de documentos PDF',
        href: '/pdf-to-text',
        icon: Type,
        category: 'PDF'
      },
      {
        id: 'protect-pdf',
        title: 'Proteger PDF',
        description: 'Adicione senha e proteção aos seus PDFs',
        href: '/protect-pdf',
        icon: Shield,
        category: 'PDF'
      },
      {
        id: 'unlock-pdf',
        title: 'Desbloquear PDF',
        description: 'Remova senhas e proteções de PDFs',
        href: '/unlock-pdf',
        icon: Unlock,
        category: 'PDF'
      },
      {
        id: 'repair-pdf',
        title: 'Reparar PDF',
        description: 'Repare arquivos PDF corrompidos ou danificados',
        href: '/repair-pdf',
        icon: Wrench,
        category: 'PDF'
      },
      {
        id: 'optimize-pdf',
        title: 'Otimizar PDF',
        description: 'Otimize PDFs para web e dispositivos móveis',
        href: '/optimize-pdf',
        icon: Settings,
        category: 'PDF'
      },
      {
        id: 'resize-pdf',
        title: 'Redimensionar PDF',
        description: 'Altere o tamanho das páginas do PDF',
        href: '/resize-pdf',
        icon: Settings,
        category: 'PDF'
      },
      {
        id: 'rotate-pages',
        title: 'Rotacionar Páginas',
        description: 'Rotacione páginas de documentos PDF',
        href: '/rotate-pages',
        icon: RotateCw,
        category: 'PDF'
      },
      {
        id: 'crop-pdf',
        title: 'Recortar PDF',
        description: 'Recorte e ajuste margens de páginas PDF',
        href: '/crop-pdf',
        icon: Crop,
        category: 'PDF'
      },
      {
        id: 'sort-pages',
        title: 'Ordenar Páginas',
        description: 'Reorganize a ordem das páginas do PDF',
        href: '/sort-pages',
        icon: Settings,
        category: 'PDF'
      },
      {
        id: 'edit-pdf',
        title: 'Editar PDF',
        description: 'Editor completo para documentos PDF',
        href: '/edit-pdf',
        icon: Edit,
        category: 'PDF'
      },
      {
        id: 'assinar-pdf',
        title: 'Assinar PDF',
        description: 'Adicione assinatura digital aos seus PDFs',
        href: '/assinar-pdf',
        icon: PenTool,
        category: 'PDF'
      },
      {
        id: 'compare-pdf',
        title: 'Comparar PDF',
        description: 'Compare dois documentos PDF lado a lado',
        href: '/compare-pdf',
        icon: Eye,
        category: 'PDF'
      },
      {
        id: 'pdf-creator',
        title: 'Criador de PDF',
        description: 'Crie documentos PDF do zero',
        href: '/pdf-creator',
        icon: Plus,
        category: 'PDF'
      },
      {
        id: 'pdf-to-pdfa',
        title: 'PDF para PDF/A',
        description: 'Converta PDF para formato PDF/A para arquivamento',
        href: '/pdf-to-pdfa',
        icon: Archive,
        category: 'PDF'
      },
      {
        id: 'validate-pdfa',
        title: 'Validar PDF/A',
        description: 'Valide se um PDF está em conformidade com PDF/A',
        href: '/validate-pdfa',
        icon: CheckCircle,
        category: 'PDF'
      },
      {
        id: 'searchable-pdf',
        title: 'PDF Pesquisável',
        description: 'Torne PDFs pesquisáveis com OCR',
        href: '/searchable-pdf',
        icon: Search,
        category: 'PDF'
      },
      {
        id: 'extract-assets',
        title: 'Extrair Recursos',
        description: 'Extraia imagens e recursos de PDFs',
        href: '/extract-assets',
        icon: Archive,
        category: 'PDF'
      },
      {
        id: 'remove-assets',
        title: 'Remover Recursos',
        description: 'Remova imagens e recursos de PDFs',
        href: '/remove-assets',
        icon: Archive,
        category: 'PDF'
      },
      
      // Imagem
      {
        id: 'imagem-para-pdf',
        title: 'Imagem para PDF',
        description: 'Converta imagens para documentos PDF',
        href: '/imagem-para-pdf',
        icon: Image,
        category: 'Imagem'
      },
      {
        id: 'pdf-para-imagem',
        title: 'PDF para Imagem',
        description: 'Converta páginas PDF para imagens',
        href: '/pdf-para-imagem',
        icon: FileImage,
        category: 'Imagem'
      },
      {
        id: 'extrair-texto-ocr',
        title: 'OCR - Extrair Texto',
        description: 'Extraia texto de imagens usando OCR',
        href: '/extrair-texto-ocr',
        icon: ScanText,
        category: 'Imagem'
      },
      {
        id: 'jpg-to-pdf',
        title: 'JPG para PDF',
        description: 'Converta imagens JPG para documentos PDF',
        href: '/jpg-to-pdf',
        icon: Image,
        category: 'Imagem'
      },
      {
        id: 'pdf-to-jpg',
        title: 'PDF para JPG',
        description: 'Converta páginas PDF para imagens JPG',
        href: '/pdf-to-jpg',
        icon: FileImage,
        category: 'Imagem'
      },
      
      // QR Code
      {
        id: 'gerar-qrcode',
        title: 'Gerar QR Code',
        description: 'Crie códigos QR personalizados para textos, URLs e mais',
        href: '/gerar-qrcode',
        icon: QrCode,
        category: 'QR Code'
      },
      {
        id: 'ler-qrcode',
        title: 'Ler QR Code',
        description: 'Leia códigos QR via upload de imagem ou câmera',
        href: '/ler-qrcode',
        icon: QrCode,
        category: 'QR Code'
      },
      
      // Segurança
      {
        id: 'gerador-senha',
        title: 'Gerador de Senhas',
        description: 'Gere senhas seguras e personalizáveis',
        href: '/gerador-senha',
        icon: Key,
        category: 'Segurança'
      },
      {
        id: 'hash-generator',
        title: 'Gerador de Hash',
        description: 'Gere hashes MD5, SHA-1, SHA-256 e SHA-512',
        href: '/hash-generator',
        icon: Key,
        category: 'Segurança'
      },
      
      // Web
      {
        id: 'encurtador-url',
        title: 'Encurtador de URL',
        description: 'Encurte URLs longas para compartilhamento fácil',
        href: '/encurtador-url',
        icon: Link2,
        category: 'Web'
      },
      {
        id: 'teste-velocidade',
        title: 'Teste de Velocidade',
        description: 'Meça a velocidade da sua conexão com a internet',
        href: '/teste-velocidade',
        icon: Wifi,
        category: 'Web'
      },
      
      // Utilidades
      {
        id: 'calculadora',
        title: 'Calculadora',
        description: 'Calculadora online para operações matemáticas',
        href: '/calculadora',
        icon: Calculator,
        category: 'Utilidades'
      },
      {
        id: 'cronometro',
        title: 'Cronômetro',
        description: 'Cronômetro online preciso com múltiplas funcionalidades',
        href: '/cronometro',
        icon: Timer,
        category: 'Utilidades'
      },
      {
        id: 'conversor-unidades',
        title: 'Conversor de Unidades',
        description: 'Converta medidas, temperaturas e outras unidades',
        href: '/conversor-unidades',
        icon: Settings,
        category: 'Utilidades'
      },
      {
        id: 'conversor-base64',
        title: 'Conversor Base64',
        description: 'Codifique e decodifique texto em Base64',
        href: '/conversor-base64',
        icon: Settings,
        category: 'Utilidades'
      },
      {
        id: 'gerador-cores',
        title: 'Gerador de Cores',
        description: 'Gere paletas de cores para seus projetos',
        href: '/gerador-cores',
        icon: Settings,
        category: 'Utilidades'
      },
      
      // Texto
      {
        id: 'bloco-notas',
        title: 'Bloco de Notas',
        description: 'Editor de texto simples no navegador',
        href: '/bloco-notas',
        icon: FileEdit,
        category: 'Texto'
      },
      {
        id: 'lorem-ipsum',
        title: 'Lorem Ipsum',
        description: 'Gere texto de exemplo Lorem Ipsum personalizado',
        href: '/lorem-ipsum',
        icon: Type,
        category: 'Texto'
      },
      {
        id: 'contador-caracteres',
        title: 'Contador de Caracteres',
        description: 'Conte caracteres, palavras e linhas de texto',
        href: '/contador-caracteres',
        icon: Type,
        category: 'Texto'
      },
      
      // Financeiro
      {
        id: 'conversor-moeda',
        title: 'Conversor de Moedas',
        description: 'Converta moedas com taxas atualizadas',
        href: '/conversor-moeda',
        icon: DollarSign,
        category: 'Financeiro'
      }
    ],
    categories: [
      'Todos',
      'Áudio/Vídeo',
      'PDF',
      'Imagem',
      'QR Code',
      'Segurança',
      'Web',
      'Utilidades',
      'Texto',
      'Financeiro',
      'Internet'
    ]
  },
  'en': {
    tools: [
      // Audio/Video
      {
        id: 'video-para-mp3',
        title: 'Video to MP3 Converter',
        description: 'Convert videos to high-quality MP3 audio files',
        href: '/video-para-mp3',
        icon: Video,
        category: 'Audio/Video'
      },
      {
        id: 'baixar-youtube',
        title: 'YouTube Downloader',
        description: 'Download YouTube videos in different formats and qualities',
        href: '/baixar-youtube',
        icon: Download,
        category: 'Audio/Video'
      },
      {
        id: 'baixar-tiktok',
        title: 'TikTok Downloader',
        description: 'Download TikTok videos without watermark',
        href: '/baixar-tiktok',
        icon: Download,
        category: 'Audio/Video'
      },
      {
        id: 'speech-to-text',
        title: 'Speech to Text',
        description: 'Convert audio to text using voice recognition',
        href: '/speech-to-text',
        icon: Mic,
        category: 'Audio/Video'
      },
      {
        id: 'pdf-to-speech',
        title: 'PDF to Speech',
        description: 'Convert PDF text to spoken audio',
        href: '/pdf-to-speech',
        icon: Mic,
        category: 'Audio/Video'
      },
      
      // PDF
      {
        id: 'compactar-pdf',
        title: 'Compress PDF',
        description: 'Reduce PDF file size while maintaining quality',
        href: '/compactar-pdf',
        icon: Archive,
        category: 'PDF'
      },
      {
        id: 'juntar-pdfs',
        title: 'Merge PDFs',
        description: 'Combine multiple PDF files into one document',
        href: '/juntar-pdfs',
        icon: Merge,
        category: 'PDF'
      },
      {
        id: 'juntar-pdf',
        title: 'Join PDF',
        description: 'Join multiple PDF files into one document',
        href: '/juntar-pdf',
        icon: Merge,
        category: 'PDF'
      },
      {
        id: 'merge-pdf',
        title: 'Merge PDF',
        description: 'Merge several PDF documents into one',
        href: '/merge-pdf',
        icon: Merge,
        category: 'PDF'
      },
      {
        id: 'dividir-pdf',
        title: 'Split PDF',
        description: 'Split PDF documents into separate pages',
        href: '/dividir-pdf',
        icon: Split,
        category: 'PDF'
      },
      {
        id: 'compress-pdf',
        title: 'Compress PDF',
        description: 'Compress PDF files to reduce file size',
        href: '/compress-pdf',
        icon: Archive,
        category: 'PDF'
      },
      {
        id: 'split-pdf',
        title: 'Split PDF',
        description: 'Split PDF documents into individual pages or sections',
        href: '/split-pdf',
        icon: Split,
        category: 'PDF'
      },
      {
        id: 'word-to-pdf',
        title: 'Word to PDF',
        description: 'Convert Word documents to PDF format',
        href: '/word-to-pdf',
        icon: FileText,
        category: 'PDF'
      },
      {
        id: 'pdf-to-word',
        title: 'PDF to Word',
        description: 'Convert PDF documents to Word format',
        href: '/pdf-to-word',
        icon: FileText,
        category: 'PDF'
      },
      {
        id: 'excel-to-pdf',
        title: 'Excel to PDF',
        description: 'Convert Excel spreadsheets to PDF format',
        href: '/excel-to-pdf',
        icon: FileText,
        category: 'PDF'
      },
      {
        id: 'pdf-to-excel',
        title: 'PDF to Excel',
        description: 'Convert PDF tables to Excel spreadsheets',
        href: '/pdf-to-excel',
        icon: FileText,
        category: 'PDF'
      },
      {
        id: 'ppt-to-pdf',
        title: 'PPT to PDF',
        description: 'Convert PowerPoint presentations to PDF',
        href: '/ppt-to-pdf',
        icon: FileText,
        category: 'PDF'
      },
      {
        id: 'pdf-to-ppt',
        title: 'PDF to PPT',
        description: 'Convert PDF documents to PowerPoint',
        href: '/pdf-to-ppt',
        icon: FileText,
        category: 'PDF'
      },
      {
        id: 'epub-to-pdf',
        title: 'EPUB to PDF',
        description: 'Convert EPUB books to PDF format',
        href: '/epub-to-pdf',
        icon: Book,
        category: 'PDF'
      },
      {
        id: 'djvu-to-pdf',
        title: 'DjVu to PDF',
        description: 'Convert DjVu files to PDF format',
        href: '/djvu-to-pdf',
        icon: FileText,
        category: 'PDF'
      },
      {
        id: 'pdf-to-text',
        title: 'PDF to Text',
        description: 'Extract text from PDF documents',
        href: '/pdf-to-text',
        icon: Type,
        category: 'PDF'
      },
      {
        id: 'protect-pdf',
        title: 'Protect PDF',
        description: 'Add password and protection to your PDFs',
        href: '/protect-pdf',
        icon: Shield,
        category: 'PDF'
      },
      {
        id: 'unlock-pdf',
        title: 'Unlock PDF',
        description: 'Remove passwords and protections from PDFs',
        href: '/unlock-pdf',
        icon: Unlock,
        category: 'PDF'
      },
      {
        id: 'repair-pdf',
        title: 'Repair PDF',
        description: 'Repair corrupted or damaged PDF files',
        href: '/repair-pdf',
        icon: Wrench,
        category: 'PDF'
      },
      {
        id: 'optimize-pdf',
        title: 'Optimize PDF',
        description: 'Optimize PDFs for web and mobile devices',
        href: '/optimize-pdf',
        icon: Settings,
        category: 'PDF'
      },
      {
        id: 'resize-pdf',
        title: 'Resize PDF',
        description: 'Change PDF page size',
        href: '/resize-pdf',
        icon: Settings,
        category: 'PDF'
      },
      {
        id: 'rotate-pages',
        title: 'Rotate Pages',
        description: 'Rotate PDF document pages',
        href: '/rotate-pages',
        icon: RotateCw,
        category: 'PDF'
      },
      {
        id: 'crop-pdf',
        title: 'Crop PDF',
        description: 'Crop and adjust PDF page margins',
        href: '/crop-pdf',
        icon: Crop,
        category: 'PDF'
      },
      {
        id: 'sort-pages',
        title: 'Sort Pages',
        description: 'Reorganize PDF page order',
        href: '/sort-pages',
        icon: Settings,
        category: 'PDF'
      },
      {
        id: 'edit-pdf',
        title: 'Edit PDF',
        description: 'Complete PDF document editor',
        href: '/edit-pdf',
        icon: Edit,
        category: 'PDF'
      },
      {
        id: 'assinar-pdf',
        title: 'Sign PDF',
        description: 'Add digital signature to your PDFs',
        href: '/assinar-pdf',
        icon: PenTool,
        category: 'PDF'
      },
      {
        id: 'compare-pdf',
        title: 'Compare PDF',
        description: 'Compare two PDF documents side by side',
        href: '/compare-pdf',
        icon: Eye,
        category: 'PDF'
      },
      {
        id: 'pdf-creator',
        title: 'PDF Creator',
        description: 'Create PDF documents from scratch',
        href: '/pdf-creator',
        icon: Plus,
        category: 'PDF'
      },
      {
        id: 'pdf-to-pdfa',
        title: 'PDF to PDF/A',
        description: 'Convert PDF to PDF/A format for archiving',
        href: '/pdf-to-pdfa',
        icon: Archive,
        category: 'PDF'
      },
      {
        id: 'validate-pdfa',
        title: 'Validate PDF/A',
        description: 'Validate if a PDF is PDF/A compliant',
        href: '/validate-pdfa',
        icon: CheckCircle,
        category: 'PDF'
      },
      {
        id: 'searchable-pdf',
        title: 'Searchable PDF',
        description: 'Make PDFs searchable with OCR',
        href: '/searchable-pdf',
        icon: Search,
        category: 'PDF'
      },
      {
        id: 'extract-assets',
        title: 'Extract Assets',
        description: 'Extract images and resources from PDFs',
        href: '/extract-assets',
        icon: Archive,
        category: 'PDF'
      },
      {
        id: 'remove-assets',
        title: 'Remove Assets',
        description: 'Remove images and resources from PDFs',
        href: '/remove-assets',
        icon: Archive,
        category: 'PDF'
      },
      
      // Image
      {
        id: 'imagem-para-pdf',
        title: 'Image to PDF',
        description: 'Convert images to PDF documents',
        href: '/imagem-para-pdf',
        icon: Image,
        category: 'Image'
      },
      {
        id: 'pdf-para-imagem',
        title: 'PDF to Image',
        description: 'Convert PDF pages to images',
        href: '/pdf-para-imagem',
        icon: FileImage,
        category: 'Image'
      },
      {
        id: 'extrair-texto-ocr',
        title: 'OCR - Extract Text',
        description: 'Extract text from images using OCR',
        href: '/extrair-texto-ocr',
        icon: ScanText,
        category: 'Image'
      },
      {
        id: 'jpg-to-pdf',
        title: 'JPG to PDF',
        description: 'Convert JPG images to PDF documents',
        href: '/jpg-to-pdf',
        icon: Image,
        category: 'Image'
      },
      {
        id: 'pdf-to-jpg',
        title: 'PDF to JPG',
        description: 'Convert PDF pages to JPG images',
        href: '/pdf-to-jpg',
        icon: FileImage,
        category: 'Image'
      },
      
      // QR Code
      {
        id: 'gerar-qrcode',
        title: 'QR Code Generator',
        description: 'Create custom QR codes for text, URLs and more',
        href: '/gerar-qrcode',
        icon: QrCode,
        category: 'QR Code'
      },
      {
        id: 'ler-qrcode',
        title: 'QR Code Reader',
        description: 'Read QR codes via image upload or camera',
        href: '/ler-qrcode',
        icon: QrCode,
        category: 'QR Code'
      },
      
      // Security
      {
        id: 'gerador-senha',
        title: 'Password Generator',
        description: 'Generate secure and customizable passwords',
        href: '/gerador-senha',
        icon: Key,
        category: 'Security'
      },
      {
        id: 'hash-generator',
        title: 'Hash Generator',
        description: 'Generate MD5, SHA-1, SHA-256 and SHA-512 hashes',
        href: '/hash-generator',
        icon: Key,
        category: 'Security'
      },
      
      // Web
      {
        id: 'encurtador-url',
        title: 'URL Shortener',
        description: 'Shorten long URLs for easy sharing',
        href: '/encurtador-url',
        icon: Link2,
        category: 'Web'
      },
      {
        id: 'teste-velocidade',
        title: 'Speed Test',
        description: 'Measure your internet connection speed',
        href: '/teste-velocidade',
        icon: Wifi,
        category: 'Web'
      },
      
      // Utilities
      {
        id: 'calculadora',
        title: 'Calculator',
        description: 'Online calculator for mathematical operations',
        href: '/calculadora',
        icon: Calculator,
        category: 'Utilities'
      },
      {
        id: 'cronometro',
        title: 'Stopwatch',
        description: 'Precise online stopwatch with multiple features',
        href: '/cronometro',
        icon: Timer,
        category: 'Utilities'
      },
      {
        id: 'conversor-unidades',
        title: 'Unit Converter',
        description: 'Convert measurements, temperatures and other units',
        href: '/conversor-unidades',
        icon: Settings,
        category: 'Utilities'
      },
      {
        id: 'conversor-base64',
        title: 'Base64 Converter',
        description: 'Encode and decode text in Base64',
        href: '/conversor-base64',
        icon: Settings,
        category: 'Utilities'
      },
      {
        id: 'gerador-cores',
        title: 'Color Generator',
        description: 'Generate color palettes for your projects',
        href: '/gerador-cores',
        icon: Settings,
        category: 'Utilities'
      },
      
      // Text
      {
        id: 'bloco-notas',
        title: 'Notepad',
        description: 'Simple text editor in the browser',
        href: '/bloco-notas',
        icon: FileEdit,
        category: 'Text'
      },
      {
        id: 'lorem-ipsum',
        title: 'Lorem Ipsum',
        description: 'Generate custom Lorem Ipsum placeholder text',
        href: '/lorem-ipsum',
        icon: Type,
        category: 'Text'
      },
      {
        id: 'contador-caracteres',
        title: 'Character Counter',
        description: 'Count characters, words and lines of text',
        href: '/contador-caracteres',
        icon: Type,
        category: 'Text'
      },
      
      // Financial
      {
        id: 'conversor-moeda',
        title: 'Currency Converter',
        description: 'Convert currencies with updated rates',
        href: '/conversor-moeda',
        icon: DollarSign,
        category: 'Financial'
      }
    ],
    categories: [
      'All',
      'Audio/Video',
      'PDF',
      'Image',
      'QR Code',
      'Security',
      'Web',
      'Utilities',
      'Text',
      'Financial',
      'Internet'
    ]
  }
};

export function getTools() {
  const language = getCurrentLanguage();
  const langData = toolsData[language];
  return langData ? langData.tools : toolsData['pt-BR'].tools;
}

export function getCategories() {
  const language = getCurrentLanguage();
  const langData = toolsData[language];
  return langData ? langData.categories : toolsData['pt-BR'].categories;
}

// Manter compatibilidade com código existente
export const tools = getTools();
export const categories = getCategories();
