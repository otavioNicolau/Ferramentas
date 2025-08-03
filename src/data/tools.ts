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
  Wifi
} from 'lucide-react';

export const tools = [
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
    id: 'compactar-pdf',
    title: 'Compactar PDF',
    description: 'Reduza o tamanho de arquivos PDF mantendo a qualidade',
    href: '/compactar-pdf',
    icon: FileText,
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
    id: 'dividir-pdf',
    title: 'Dividir PDF',
    description: 'Divida um PDF em páginas individuais ou intervalos',
    href: '/dividir-pdf',
    icon: Split,
    category: 'PDF'
  },
  {
    id: 'assinar-pdf',
    title: 'Assinar PDF',
    description: 'Adicione assinatura digital aos seus documentos PDF',
    href: '/assinar-pdf',
    icon: PenTool,
    category: 'PDF'
  },
  {
    id: 'imagem-para-pdf',
    title: 'Imagem para PDF',
    description: 'Converta imagens (JPG, PNG) em documentos PDF',
    href: '/imagem-para-pdf',
    icon: Image,
    category: 'PDF'
  },
  {
    id: 'pdf-para-imagem',
    title: 'PDF para Imagem',
    description: 'Converta páginas de PDF em imagens JPG ou PNG',
    href: '/pdf-para-imagem',
    icon: FileImage,
    category: 'PDF'
  },
  {
    id: 'extrair-texto-ocr',
    title: 'OCR - Extrair Texto',
    description: 'Extraia texto de imagens usando tecnologia OCR',
    href: '/extrair-texto-ocr',
    icon: ScanText,
    category: 'Imagem'
  },
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
    description: 'Leia códigos QR através de upload de imagem ou câmera',
    href: '/ler-qrcode',
    icon: Eye,
    category: 'QR Code'
  },
  {
    id: 'gerador-senha',
    title: 'Gerador de Senhas',
    description: 'Gere senhas seguras e personalizáveis',
    href: '/gerador-senha',
    icon: Key,
    category: 'Segurança'
  },
  {
    id: 'encurtador-url',
    title: 'Encurtador de URL',
    description: 'Encurte URLs longas para facilitar o compartilhamento',
    href: '/encurtador-url',
    icon: Link2,
    category: 'Web'
  },
  {
    id: 'conversor-unidades',
    title: 'Conversor de Unidades',
    description: 'Converta medidas, temperatura, peso e outras unidades',
    href: '/conversor-unidades',
    icon: Calculator,
    category: 'Utilidades'
  },
  {
    id: 'cronometro',
    title: 'Cronômetro Online',
    description: 'Cronômetro preciso com controles de start, pause e reset',
    href: '/cronometro',
    icon: Timer,
    category: 'Utilidades'
  },
  {
    id: 'bloco-notas',
    title: 'Bloco de Notas',
    description: 'Editor de texto simples para notas rápidas no navegador',
    href: '/bloco-notas',
    icon: FileEdit,
    category: 'Utilidades'
  },
  {
    id: 'lorem-ipsum',
    title: 'Gerador Lorem Ipsum',
    description: 'Gere texto de exemplo Lorem Ipsum personalizado',
    href: '/lorem-ipsum',
    icon: Type,
    category: 'Texto'
  },
  {
    id: 'conversor-moeda',
    title: 'Conversor de Moedas',
    description: 'Converta moedas com taxas de câmbio atualizadas',
    href: '/conversor-moeda',
    icon: DollarSign,
    category: 'Financeiro'
  },
  {
    id: 'teste-velocidade',
    title: 'Teste de Velocidade',
    description: 'Meça a velocidade da sua conexão de internet',
    href: '/teste-velocidade',
    icon: Wifi,
    category: 'Internet'
  }
];

export const categories = [
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
];
