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
  // 🟡 Editar PDF
  {
    id: 'edit-pdf',
    title: 'Edit PDF',
    description: 'Edite conteúdo de documentos PDF diretamente no navegador',
    href: '/edit-pdf',
    icon: Edit,
    category: 'PDF'
  },
  {
    id: 'merge-pdf',
    title: 'Merge PDF',
    description: 'Combine múltiplos arquivos PDF em um único documento',
    href: '/merge-pdf',
    icon: Merge,
    category: 'PDF'
  },
  {
    id: 'split-pdf',
    title: 'Split PDF',
    description: 'Divida documentos PDF em páginas ou seções individuais',
    href: '/split-pdf',
    icon: Split,
    category: 'PDF'
  },
  {
    id: 'sort-pages',
    title: 'Sort and Delete PDF Pages',
    description: 'Reorganize e exclua páginas de documentos PDF',
    href: '/sort-pages',
    icon: Settings,
    category: 'PDF'
  },
  {
    id: 'rotate-pages',
    title: 'Rotate PDF Pages',
    description: 'Rotacione páginas de documentos PDF em qualquer ângulo',
    href: '/rotate-pages',
    icon: RotateCw,
    category: 'PDF'
  },
  {
    id: 'pdf-creator',
    title: 'PDF Creator',
    description: 'Crie documentos PDF do zero com texto, imagens e formatação',
    href: '/pdf-creator',
    icon: Plus,
    category: 'PDF'
  },
  {
    id: 'crop-pdf',
    title: 'Crop PDF',
    description: 'Recorte áreas específicas de páginas PDF',
    href: '/crop-pdf',
    icon: Crop,
    category: 'PDF'
  },
  {
    id: 'compare-pdf',
    title: 'Compare PDF',
    description: 'Compare dois documentos PDF e identifique diferenças',
    href: '/compare-pdf',
    icon: Eye,
    category: 'PDF'
  },
  {
    id: 'extract-assets',
    title: 'Extract Assets',
    description: 'Extraia imagens, fontes e outros recursos de documentos PDF',
    href: '/extract-assets',
    icon: Archive,
    category: 'PDF'
  },
  {
    id: 'remove-assets',
    title: 'PDF Asset Remover',
    description: 'Remova imagens, metadados e outros recursos de documentos PDF',
    href: '/remove-assets',
    icon: Wrench,
    category: 'PDF'
  },
  // 🔴 Melhorar PDF
  {
    id: 'compress-pdf',
    title: 'Compress PDF',
    description: 'Reduza o tamanho de arquivos PDF mantendo a qualidade',
    href: '/compress-pdf',
    icon: FileText,
    category: 'PDF'
  },
  {
    id: 'protect-pdf',
    title: 'Protect PDF',
    description: 'Adicione senha e permissões de segurança a documentos PDF',
    href: '/protect-pdf',
    icon: Shield,
    category: 'PDF'
  },
  {
    id: 'unlock-pdf',
    title: 'Unlock PDF',
    description: 'Remova senhas e restrições de documentos PDF protegidos',
    href: '/unlock-pdf',
    icon: Unlock,
    category: 'PDF'
  },
  {
    id: 'resize-pdf',
    title: 'Change PDF Page Size',
    description: 'Altere o tamanho das páginas de documentos PDF',
    href: '/resize-pdf',
    icon: Settings,
    category: 'PDF'
  },
  {
    id: 'repair-pdf',
    title: 'Repair PDF',
    description: 'Repare documentos PDF corrompidos ou danificados',
    href: '/repair-pdf',
    icon: Wrench,
    category: 'PDF'
  },
  {
    id: 'optimize-pdf',
    title: 'Optimize PDF for Web',
    description: 'Otimize documentos PDF para carregamento rápido na web',
    href: '/optimize-pdf',
    icon: Settings,
    category: 'PDF'
  },
  {
    id: 'searchable-pdf',
    title: 'Make PDF Searchable',
    description: 'Torne documentos PDF pesquisáveis usando OCR',
    href: '/searchable-pdf',
    icon: Search,
    category: 'PDF'
  },
  {
    id: 'validate-pdfa',
    title: 'Validate PDF/A',
    description: 'Valide se documentos PDF estão em conformidade com o padrão PDF/A',
    href: '/validate-pdfa',
    icon: CheckCircle,
    category: 'PDF'
  },
  // 🟣 Converter de PDF
  {
    id: 'pdf-to-word',
    title: 'PDF to Word',
    description: 'Converta documentos PDF para formato Word (.docx)',
    href: '/pdf-to-word',
    icon: FileText,
    category: 'PDF'
  },
  {
    id: 'pdf-to-jpg',
    title: 'PDF to JPG',
    description: 'Converta páginas PDF para imagens JPG de alta qualidade',
    href: '/pdf-to-jpg',
    icon: FileImage,
    category: 'PDF'
  },
  {
    id: 'pdf-to-ppt',
    title: 'PDF to PowerPoint',
    description: 'Converta documentos PDF para apresentações PowerPoint (.pptx)',
    href: '/pdf-to-ppt',
    icon: FileText,
    category: 'PDF'
  },
  {
    id: 'pdf-to-excel',
    title: 'PDF to Excel',
    description: 'Converta tabelas de documentos PDF para planilhas Excel (.xlsx)',
    href: '/pdf-to-excel',
    icon: FileText,
    category: 'PDF'
  },
  {
    id: 'pdf-to-text',
    title: 'PDF to Text',
    description: 'Extraia texto de documentos PDF para formato de texto puro',
    href: '/pdf-to-text',
    icon: Type,
    category: 'PDF'
  },
  {
    id: 'pdf-to-speech',
    title: 'Text to Speech',
    description: 'Converta texto de documentos PDF para áudio usando síntese de voz',
    href: '/pdf-to-speech',
    icon: Mic,
    category: 'PDF'
  },
  // 🟢 Converter para PDF
  {
    id: 'word-to-pdf',
    title: 'Word to PDF',
    description: 'Converta documentos Word (.docx, .doc) para formato PDF',
    href: '/word-to-pdf',
    icon: FileText,
    category: 'PDF'
  },
  {
    id: 'jpg-to-pdf',
    title: 'JPG to PDF',
    description: 'Converta imagens JPG para documentos PDF',
    href: '/jpg-to-pdf',
    icon: Image,
    category: 'PDF'
  },
  {
    id: 'ppt-to-pdf',
    title: 'PowerPoint to PDF',
    description: 'Converta apresentações PowerPoint (.pptx, .ppt) para formato PDF',
    href: '/ppt-to-pdf',
    icon: FileText,
    category: 'PDF'
  },
  {
    id: 'excel-to-pdf',
    title: 'Excel to PDF',
    description: 'Converta planilhas Excel (.xlsx, .xls) para formato PDF',
    href: '/excel-to-pdf',
    icon: FileText,
    category: 'PDF'
  },
  {
    id: 'epub-to-pdf',
    title: 'EPUB to PDF',
    description: 'Converta livros eletrônicos EPUB para formato PDF',
    href: '/epub-to-pdf',
    icon: Book,
    category: 'PDF'
  },
  {
    id: 'speech-to-text',
    title: 'Speech to Text',
    description: 'Converta áudio para texto e gere documentos PDF',
    href: '/speech-to-text',
    icon: Mic,
    category: 'PDF'
  },
  {
    id: 'djvu-to-pdf',
    title: 'DJVU to PDF',
    description: 'Converta arquivos DJVU para formato PDF',
    href: '/djvu-to-pdf',
    icon: Archive,
    category: 'PDF'
  },
  {
    id: 'pdf-to-pdfa',
    title: 'PDF to PDF/A',
    description: 'Converta documentos PDF para o padrão de arquivo PDF/A',
    href: '/pdf-to-pdfa',
    icon: CheckCircle,
    category: 'PDF'
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
