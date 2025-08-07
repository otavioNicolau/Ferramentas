'use client';

import { useState, useRef } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { FileText, Download, Plus, Trash2, Type, AlignLeft, AlignCenter, AlignRight, Bold, Italic } from 'lucide-react';
import jsPDF from 'jspdf';

interface TextElement {
  id: string;
  content: string;
  x: number;
  y: number;
  fontSize: number;
  fontStyle: 'normal' | 'bold' | 'italic';
  alignment: 'left' | 'center' | 'right';
  color: string;
}

interface Page {
  id: string;
  elements: TextElement[];
  title: string;
}

export default function PdfCreatorPage() {
  const [pages, setPages] = useState<Page[]>([
    {
      id: '1',
      title: 'Página 1',
      elements: []
    }
  ]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [documentTitle, setDocumentTitle] = useState('Meu Documento');
  
  // Configurações do elemento atual
  const [newElementText, setNewElementText] = useState('');
  const [newElementFontSize, setNewElementFontSize] = useState(12);
  const [newElementFontStyle, setNewElementFontStyle] = useState<'normal' | 'bold' | 'italic'>('normal');
  const [newElementAlignment, setNewElementAlignment] = useState<'left' | 'center' | 'right'>('left');
  const [newElementColor, setNewElementColor] = useState('#000000');

  const currentPage = pages[currentPageIndex];

  const addTextElement = () => {
    if (!newElementText.trim()) return;

    const newElement: TextElement = {
      id: Date.now().toString(),
      content: newElementText,
      x: 20,
      y: 50 + (currentPage.elements.length * 20),
      fontSize: newElementFontSize,
      fontStyle: newElementFontStyle,
      alignment: newElementAlignment,
      color: newElementColor
    };

    const updatedPages = [...pages];
    updatedPages[currentPageIndex].elements.push(newElement);
    setPages(updatedPages);
    setNewElementText('');
  };

  const updateElement = (elementId: string, updates: Partial<TextElement>) => {
    const updatedPages = [...pages];
    const elementIndex = updatedPages[currentPageIndex].elements.findIndex(el => el.id === elementId);
    if (elementIndex !== -1) {
      updatedPages[currentPageIndex].elements[elementIndex] = {
        ...updatedPages[currentPageIndex].elements[elementIndex],
        ...updates
      };
      setPages(updatedPages);
    }
  };

  const deleteElement = (elementId: string) => {
    const updatedPages = [...pages];
    updatedPages[currentPageIndex].elements = updatedPages[currentPageIndex].elements.filter(
      el => el.id !== elementId
    );
    setPages(updatedPages);
    setSelectedElement(null);
  };

  const addPage = () => {
    const newPage: Page = {
      id: Date.now().toString(),
      title: `Página ${pages.length + 1}`,
      elements: []
    };
    setPages([...pages, newPage]);
    setCurrentPageIndex(pages.length);
  };

  const deletePage = (pageIndex: number) => {
    if (pages.length <= 1) return;
    
    const updatedPages = pages.filter((_, index) => index !== pageIndex);
    setPages(updatedPages);
    
    if (currentPageIndex >= updatedPages.length) {
      setCurrentPageIndex(updatedPages.length - 1);
    } else if (currentPageIndex > pageIndex) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      const pdf = new jsPDF();
      
      // Configurar metadados
      pdf.setProperties({
        title: documentTitle,
        creator: 'Utilidade Web - PDF Creator',
        author: 'Usuário'
      });

      pages.forEach((page, pageIndex) => {
        if (pageIndex > 0) {
          pdf.addPage();
        }

        // Adicionar elementos de texto
        page.elements.forEach(element => {
          // Configurar fonte
          let fontName = 'helvetica';
          if (element.fontStyle === 'bold') {
            fontName = 'helvetica';
            pdf.setFont(fontName, 'bold');
          } else if (element.fontStyle === 'italic') {
            fontName = 'helvetica';
            pdf.setFont(fontName, 'italic');
          } else {
            pdf.setFont(fontName, 'normal');
          }

          pdf.setFontSize(element.fontSize);
          
          // Configurar cor
          const hex = element.color.replace('#', '');
          const r = parseInt(hex.substr(0, 2), 16) / 255;
          const g = parseInt(hex.substr(2, 2), 16) / 255;
          const b = parseInt(hex.substr(4, 2), 16) / 255;
          pdf.setTextColor(r, g, b);

          // Calcular posição X baseada no alinhamento
          let xPosition = element.x;
          const pageWidth = pdf.internal.pageSize.getWidth();
          const textWidth = pdf.getTextWidth(element.content);
          
          if (element.alignment === 'center') {
            xPosition = (pageWidth - textWidth) / 2;
          } else if (element.alignment === 'right') {
            xPosition = pageWidth - textWidth - 20;
          }

          pdf.text(element.content, xPosition, element.y);
        });
      });

      // Download do PDF
      pdf.save(`${documentTitle}.pdf`);
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedElementData = selectedElement 
    ? currentPage.elements.find(el => el.id === selectedElement)
    : null;

  return (
    <ToolLayout
      title="Criador de PDF"
      description="Crie documentos PDF personalizados com texto, formatação e múltiplas páginas"
    >
      <div className="space-y-6">
        {/* Configurações do Documento */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={20} className="text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-800">Configurações do Documento</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título do Documento
              </label>
              <input
                type="text"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Digite o título do documento"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={generatePDF}
                disabled={isGenerating || pages.every(page => page.elements.length === 0)}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Gerando...
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Gerar PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Gerenciamento de Páginas */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Páginas</h3>
            <button
              onClick={addPage}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              Nova Página
            </button>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2">
            {pages.map((page, index) => (
              <div
                key={page.id}
                className={`flex-shrink-0 border rounded-lg p-3 cursor-pointer transition-colors ${
                  index === currentPageIndex
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => setCurrentPageIndex(index)}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{page.title}</span>
                  {pages.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePage(index);
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {page.elements.length} elemento(s)
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Adicionar Elemento de Texto */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Type size={20} className="text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-800">Adicionar Texto</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conteúdo do Texto
              </label>
              <textarea
                value={newElementText}
                onChange={(e) => setNewElementText(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 h-24 resize-none"
                placeholder="Digite o texto que deseja adicionar..."
              />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tamanho da Fonte
                </label>
                <input
                  type="number"
                  value={newElementFontSize}
                  onChange={(e) => setNewElementFontSize(Number(e.target.value))}
                  min="8"
                  max="72"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estilo
                </label>
                <select
                  value={newElementFontStyle}
                  onChange={(e) => setNewElementFontStyle(e.target.value as 'normal' | 'bold' | 'italic')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="normal">Normal</option>
                  <option value="bold">Negrito</option>
                  <option value="italic">Itálico</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alinhamento
                </label>
                <select
                  value={newElementAlignment}
                  onChange={(e) => setNewElementAlignment(e.target.value as 'left' | 'center' | 'right')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="left">Esquerda</option>
                  <option value="center">Centro</option>
                  <option value="right">Direita</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor
                </label>
                <input
                  type="color"
                  value={newElementColor}
                  onChange={(e) => setNewElementColor(e.target.value)}
                  className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
                />
              </div>
            </div>
            
            <button
              onClick={addTextElement}
              disabled={!newElementText.trim()}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Plus size={16} />
              Adicionar Texto
            </button>
          </div>
        </div>

        {/* Elementos da Página Atual */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Elementos - {currentPage.title}
          </h3>
          
          {currentPage.elements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Type className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <p>Nenhum elemento adicionado ainda</p>
              <p className="text-sm">Adicione texto usando o formulário acima</p>
            </div>
          ) : (
            <div className="space-y-3">
              {currentPage.elements.map((element) => (
                <div
                  key={element.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedElement === element.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedElement(element.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p
                        className="font-medium mb-2"
                        style={{
                          fontSize: `${Math.min(element.fontSize, 16)}px`,
                          fontWeight: element.fontStyle === 'bold' ? 'bold' : 'normal',
                          fontStyle: element.fontStyle === 'italic' ? 'italic' : 'normal',
                          color: element.color,
                          textAlign: element.alignment
                        }}
                      >
                        {element.content}
                      </p>
                      <div className="text-xs text-gray-500">
                        Tamanho: {element.fontSize}px | Estilo: {element.fontStyle} | Alinhamento: {element.alignment}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteElement(element.id);
                      }}
                      className="text-red-600 hover:text-red-700 ml-2"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Editor de Elemento Selecionado */}
        {selectedElementData && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Editar Elemento Selecionado
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conteúdo
                </label>
                <textarea
                  value={selectedElementData.content}
                  onChange={(e) => updateElement(selectedElement!, { content: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 h-24 resize-none"
                />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Posição X
                  </label>
                  <input
                    type="number"
                    value={selectedElementData.x}
                    onChange={(e) => updateElement(selectedElement!, { x: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Posição Y
                  </label>
                  <input
                    type="number"
                    value={selectedElementData.y}
                    onChange={(e) => updateElement(selectedElement!, { y: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tamanho
                  </label>
                  <input
                    type="number"
                    value={selectedElementData.fontSize}
                    onChange={(e) => updateElement(selectedElement!, { fontSize: Number(e.target.value) })}
                    min="8"
                    max="72"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estilo
                  </label>
                  <select
                    value={selectedElementData.fontStyle}
                    onChange={(e) => updateElement(selectedElement!, { fontStyle: e.target.value as 'normal' | 'bold' | 'italic' })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="normal">Normal</option>
                    <option value="bold">Negrito</option>
                    <option value="italic">Itálico</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alinhamento
                  </label>
                  <select
                    value={selectedElementData.alignment}
                    onChange={(e) => updateElement(selectedElement!, { alignment: e.target.value as 'left' | 'center' | 'right' })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="left">Esquerda</option>
                    <option value="center">Centro</option>
                    <option value="right">Direita</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Informações */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Como Usar</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Adicione texto usando o formulário "Adicionar Texto"</li>
            <li>• Clique em um elemento para selecioná-lo e editá-lo</li>
            <li>• Use múltiplas páginas para documentos maiores</li>
            <li>• Ajuste posições X e Y para posicionar elementos precisamente</li>
            <li>• O PDF será gerado com todas as páginas e elementos</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}
