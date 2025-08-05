'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Download, Edit3, Type, MousePointer, Palette, Square, Circle, ImageIcon, Undo, Redo, ZoomIn, ZoomOut, Copy, Lock, Unlock, Trash2, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, RotateCw, Layers, ArrowUp, ArrowDown, Group, Ungroup, PenTool } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import { PDFDocument, rgb } from 'pdf-lib';

// Dynamic import for pdfjs-dist to avoid SSR issues
let pdfjsLib: any = null;
if (typeof window !== 'undefined') {
  import('pdfjs-dist').then((module) => {
    pdfjsLib = module;
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
  });
}

interface PDFElement {
  id: string;
  type: 'text' | 'image' | 'rectangle' | 'circle' | 'highlight' | 'annotation' | 'line' | 'arrow' | 'draw';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  opacity?: number;
  imageData?: string;
  locked?: boolean;
  zIndex?: number;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline';
  textAlign?: 'left' | 'center' | 'right';
  rotation?: number;
  groupId?: string;
  pathData?: string; // Para desenho livre
}

interface PDFPage {
  canvas: HTMLCanvasElement;
  elements: PDFElement[];
}

type ToolType = 'select' | 'text' | 'image' | 'rectangle' | 'circle' | 'highlight' | 'annotation' | 'line' | 'arrow' | 'draw';

export default function EditPDFPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pdfPages, setPdfPages] = useState<PDFPage[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTool, setSelectedTool] = useState<ToolType>('select');
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [selectedElements, setSelectedElements] = useState<Set<string>>(new Set());
  const [zoom, setZoom] = useState(100);
  const [history, setHistory] = useState<PDFPage[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPath, setDrawingPath] = useState<string>('');
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [gridSize, setGridSize] = useState(20);
  const [showRulers, setShowRulers] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            undo();
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
          case 'd':
            e.preventDefault();
            if (selectedElement) {
              duplicateElement(selectedElement);
            }
            break;
          case 's':
            e.preventDefault();
            savePDF();
            break;
          case 'l':
            e.preventDefault();
            setShowLayerPanel(!showLayerPanel);
            break;
          case '=':
          case '+':
            e.preventDefault();
            setZoom(Math.min(500, zoom + 25));
            break;
          case '-':
            e.preventDefault();
            setZoom(Math.max(25, zoom - 25));
            break;
          case '0':
            e.preventDefault();
            setZoom(100);
            break;
          case 'g':
            e.preventDefault();
            groupSelectedElements();
            break;
          case 'u':
            e.preventDefault();
            ungroupSelectedElement();
            break;
        }
      } else if (e.shiftKey) {
        switch (e.key.toLowerCase()) {
          case 'l':
            e.preventDefault();
            if (selectedElement) {
              updateElement(selectedElement, { locked: !getCurrentPage()?.elements.find(el => el.id === selectedElement)?.locked });
            }
            break;
        }
      } else {
        switch (e.key.toLowerCase()) {
          case 'v':
            setSelectedTool('select');
            break;
          case 't':
            setSelectedTool('text');
            break;
          case 'h':
            setSelectedTool('highlight');
            break;
          case 'a':
            setSelectedTool('annotation');
            break;
          case 'r':
            setSelectedTool('rectangle');
            break;
          case 'c':
            setSelectedTool('circle');
            break;
          case 'i':
            imageInputRef.current?.click();
            break;
          case 'l':
            setSelectedTool('line');
            break;
          case 'd':
            setSelectedTool('draw');
            break;
          case 'escape':
            setSelectedElement(null);
            setSelectedTool('select');
            break;
          case 'delete':
          case 'backspace':
            if (selectedElement) {
              deleteElement(selectedElement);
            }
            break;
          case 'f1':
            e.preventDefault();
            alert('Atalhos do teclado:\nV - Seleção\nT - Texto\nH - Destaque\nA - Anotação\nR - Retângulo\nC - Círculo\nL - Linha\nD - Desenho Livre\nI - Imagem\nCtrl+Z - Desfazer\nCtrl+Y - Refazer\nCtrl+D - Duplicar\nCtrl+S - Salvar\nCtrl+L - Camadas\nCtrl+G - Agrupar\nCtrl+U - Desagrupar\nCtrl +/- - Zoom\nShift+L - Bloquear/Desbloquear\nEsc - Cancelar seleção\nDel - Excluir\nF2 - Editar texto selecionado\nF1 - Ajuda');
            break;
          case 'f2':
            e.preventDefault();
            if (selectedElement) {
              const element = getCurrentPage()?.elements.find(el => el.id === selectedElement);
              if (element && element.type === 'text') {
                setEditingElementId(selectedElement);
                setEditingText(element.content || '');
                setTimeout(() => {
                  textInputRef.current?.focus();
                  textInputRef.current?.select();
                }, 100);
              }
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement]);

  const saveToHistory = useCallback((pages: PDFPage[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(pages)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setPdfPages(JSON.parse(JSON.stringify(history[historyIndex - 1])));
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setPdfPages(JSON.parse(JSON.stringify(history[historyIndex + 1])));
    }
  }, [history, historyIndex]);

  const loadPDF = async (file: File) => {
    try {
      // Ensure pdfjsLib is loaded
      if (!pdfjsLib) {
        const module = await import('pdfjs-dist');
        pdfjsLib = module;
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      const pages: PDFPage[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        if (context) {
          const renderContext = {
            canvasContext: context,
            viewport: viewport,
            canvas: canvas
          };
          
          await page.render(renderContext).promise;
        }
        
        pages.push({
          canvas,
          elements: []
        });
      }

      setPdfPages(pages);
      setCurrentPage(1);
      saveToHistory(pages);
    } catch (error) {
      console.error('Erro ao carregar PDF:', error);
      alert('Erro ao carregar o arquivo PDF. Verifique se o arquivo não está corrompido.');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      loadPDF(file);
    } else {
      alert('Por favor, selecione um arquivo PDF válido.');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      loadPDF(file);
    } else {
      alert('Por favor, arraste um arquivo PDF válido.');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        addElement('image', { imageData });
      };
      reader.readAsDataURL(file);
    }
  };

  const getCurrentPage = () => {
    return pdfPages[currentPage - 1] || null;
  };

  const addElement = (type: PDFElement['type'], extraData?: Partial<PDFElement>) => {
    const currentPageData = getCurrentPage();
    if (!currentPageData) return;

    const newElement: PDFElement = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      x: 100,
      y: 100,
      width: type === 'text' ? 200 : type === 'line' || type === 'arrow' ? 150 : 100,
      height: type === 'text' ? 30 : type === 'line' || type === 'arrow' ? 3 : 100,
      fontSize: 14,
      fontFamily: 'Arial',
      color: '#000000',
      backgroundColor: type === 'highlight' ? '#FFFF00' : type === 'annotation' ? '#FFF3CD' : 'transparent',
      opacity: type === 'highlight' ? 0.5 : 1,
      content: type === 'text' ? 'Novo texto' : type === 'annotation' ? 'Nova anotação' : '',
      locked: false,
      zIndex: currentPageData.elements.length,
      fontWeight: 'normal',
      fontStyle: 'normal',
      textDecoration: 'none',
      textAlign: 'left',
      rotation: 0,
      ...extraData
    };

    const updatedPages = [...pdfPages];
    updatedPages[currentPage - 1].elements.push(newElement);
    setPdfPages(updatedPages);
    saveToHistory(updatedPages);
    setSelectedElement(newElement.id);
  };

  const updateElement = (id: string, updates: Partial<PDFElement>) => {
    const updatedPages = [...pdfPages];
    const currentPageData = updatedPages[currentPage - 1];
    const elementIndex = currentPageData.elements.findIndex(el => el.id === id);
    
    if (elementIndex !== -1) {
      currentPageData.elements[elementIndex] = {
        ...currentPageData.elements[elementIndex],
        ...updates
      };
      setPdfPages(updatedPages);
      saveToHistory(updatedPages);
    }
  };

  const deleteElement = (id: string) => {
    const updatedPages = [...pdfPages];
    updatedPages[currentPage - 1].elements = updatedPages[currentPage - 1].elements.filter(el => el.id !== id);
    setPdfPages(updatedPages);
    saveToHistory(updatedPages);
    setSelectedElement(null);
  };

  const duplicateElement = (id: string) => {
    const currentPageData = getCurrentPage();
    if (!currentPageData) return;

    const element = currentPageData.elements.find(el => el.id === id);
    if (element) {
      const newElement = {
        ...element,
        id: `${element.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        x: element.x + 20,
        y: element.y + 20,
        zIndex: currentPageData.elements.length
      };

      const updatedPages = [...pdfPages];
      updatedPages[currentPage - 1].elements.push(newElement);
      setPdfPages(updatedPages);
      saveToHistory(updatedPages);
      setSelectedElement(newElement.id);
    }
  };

  const moveElementLayer = (id: string, direction: 'up' | 'down' | 'top' | 'bottom') => {
    const currentPageData = getCurrentPage();
    if (!currentPageData) return;

    const updatedPages = [...pdfPages];
    const elements = updatedPages[currentPage - 1].elements;
    const elementIndex = elements.findIndex(el => el.id === id);
    
    if (elementIndex === -1) return;

    const element = elements[elementIndex];
    
    switch (direction) {
      case 'up':
        if (elementIndex < elements.length - 1) {
          [elements[elementIndex], elements[elementIndex + 1]] = [elements[elementIndex + 1], elements[elementIndex]];
          elements[elementIndex].zIndex = elementIndex;
          elements[elementIndex + 1].zIndex = elementIndex + 1;
        }
        break;
      case 'down':
        if (elementIndex > 0) {
          [elements[elementIndex], elements[elementIndex - 1]] = [elements[elementIndex - 1], elements[elementIndex]];
          elements[elementIndex].zIndex = elementIndex;
          elements[elementIndex - 1].zIndex = elementIndex - 1;
        }
        break;
      case 'top':
        elements.splice(elementIndex, 1);
        elements.push(element);
        elements.forEach((el, idx) => el.zIndex = idx);
        break;
      case 'bottom':
        elements.splice(elementIndex, 1);
        elements.unshift(element);
        elements.forEach((el, idx) => el.zIndex = idx);
        break;
    }

    setPdfPages(updatedPages);
    saveToHistory(updatedPages);
  };

  // Função para atualizar elemento selecionado
  const updateSelectedElement = (updates: Partial<PDFElement>) => {
    if (!selectedElement || !getCurrentPage()) return;

    const currentPageData = getCurrentPage()!;
    const elementIndex = currentPageData.elements.findIndex(el => el.id === selectedElement);
    if (elementIndex === -1) return;

    const updatedElement = { ...currentPageData.elements[elementIndex], ...updates };
    const updatedElements = [...currentPageData.elements];
    updatedElements[elementIndex] = updatedElement;

    const updatedPages = [...pdfPages];
    updatedPages[currentPage - 1] = {
      ...currentPageData,
      elements: updatedElements
    };

    setPdfPages(updatedPages);
    saveToHistory(updatedPages);
  };

  // Funções para agrupar e desagrupar elementos
  const groupSelectedElements = () => {
    const currentPageData = getCurrentPage();
    if (!currentPageData || !selectedElement) return;

    const selectedElements = currentPageData.elements.filter(el => 
      selectedElement === el.id // Por simplicidade, só um elemento selecionado por vez
    );

    if (selectedElements.length < 2) {
      alert('Selecione pelo menos 2 elementos para agrupar');
      return;
    }

    const groupId = `group_${Date.now()}`;
    const updatedElements = currentPageData.elements.map(element => 
      selectedElements.some(sel => sel.id === element.id)
        ? { ...element, groupId }
        : element
    );

    const updatedPages = [...pdfPages];
    updatedPages[currentPage - 1] = {
      ...currentPageData,
      elements: updatedElements
    };

    setPdfPages(updatedPages);
    saveToHistory(updatedPages);
  };

  const distributeElements = (direction: 'horizontal' | 'vertical') => {
    if (selectedElements.size < 3) return;
    
    const elements = Array.from(selectedElements).map(id => 
      getCurrentPage()?.elements.find(el => el.id === id)
    ).filter(Boolean) as PDFElement[];
    
    if (elements.length < 3) return;
    
    const updatedPages = [...pdfPages];
    const currentPageData = updatedPages[currentPage - 1];
    
    if (direction === 'horizontal') {
      // Ordenar por posição X
      elements.sort((a, b) => a.x - b.x);
      const first = elements[0];
      const last = elements[elements.length - 1];
      const totalSpace = last.x - first.x;
      const spacing = totalSpace / (elements.length - 1);
      
      elements.forEach((element, index) => {
        if (index > 0 && index < elements.length - 1) {
          const index = currentPageData.elements.findIndex(el => el.id === element.id);
          if (index !== -1) {
            currentPageData.elements[index].x = first.x + (spacing * index);
          }
        }
      });
    } else {
      // Ordenar por posição Y
      elements.sort((a, b) => a.y - b.y);
      const first = elements[0];
      const last = elements[elements.length - 1];
      const totalSpace = last.y - first.y;
      const spacing = totalSpace / (elements.length - 1);
      
      elements.forEach((element, index) => {
        if (index > 0 && index < elements.length - 1) {
          const index = currentPageData.elements.findIndex(el => el.id === element.id);
          if (index !== -1) {
            currentPageData.elements[index].y = first.y + (spacing * index);
          }
        }
      });
    }
    
    setPdfPages(updatedPages);
    saveToHistory(updatedPages);
  };

  const alignElements = (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (selectedElements.size < 2) return;
    
    const elements = Array.from(selectedElements).map(id => 
      getCurrentPage()?.elements.find(el => el.id === id)
    ).filter(Boolean) as PDFElement[];
    
    if (elements.length < 2) return;
    
    const updatedPages = [...pdfPages];
    const currentPageData = updatedPages[currentPage - 1];
    
    let referenceValue: number;
    
    switch (alignment) {
      case 'left':
        referenceValue = Math.min(...elements.map(el => el.x));
        elements.forEach(element => {
          const index = currentPageData.elements.findIndex(el => el.id === element.id);
          if (index !== -1) {
            currentPageData.elements[index].x = referenceValue;
          }
        });
        break;
      case 'center':
        referenceValue = elements.reduce((sum, el) => sum + el.x + el.width / 2, 0) / elements.length;
        elements.forEach(element => {
          const index = currentPageData.elements.findIndex(el => el.id === element.id);
          if (index !== -1) {
            currentPageData.elements[index].x = referenceValue - element.width / 2;
          }
        });
        break;
      case 'right':
        referenceValue = Math.max(...elements.map(el => el.x + el.width));
        elements.forEach(element => {
          const index = currentPageData.elements.findIndex(el => el.id === element.id);
          if (index !== -1) {
            currentPageData.elements[index].x = referenceValue - element.width;
          }
        });
        break;
      case 'top':
        referenceValue = Math.min(...elements.map(el => el.y));
        elements.forEach(element => {
          const index = currentPageData.elements.findIndex(el => el.id === element.id);
          if (index !== -1) {
            currentPageData.elements[index].y = referenceValue;
          }
        });
        break;
      case 'middle':
        referenceValue = elements.reduce((sum, el) => sum + el.y + el.height / 2, 0) / elements.length;
        elements.forEach(element => {
          const index = currentPageData.elements.findIndex(el => el.id === element.id);
          if (index !== -1) {
            currentPageData.elements[index].y = referenceValue - element.height / 2;
          }
        });
        break;
      case 'bottom':
        referenceValue = Math.max(...elements.map(el => el.y + el.height));
        elements.forEach(element => {
          const index = currentPageData.elements.findIndex(el => el.id === element.id);
          if (index !== -1) {
            currentPageData.elements[index].y = referenceValue - element.height;
          }
        });
        break;
    }
    
    setPdfPages(updatedPages);
    saveToHistory(updatedPages);
  };

  const ungroupSelectedElement = () => {
    const currentPageData = getCurrentPage();
    if (!currentPageData || !selectedElement) return;

    const element = currentPageData.elements.find(el => el.id === selectedElement);
    if (!element?.groupId) return;

    const groupId = element.groupId;
    const updatedElements = currentPageData.elements.map(el => 
      el.groupId === groupId
        ? { ...el, groupId: undefined }
        : el
    );

    const updatedPages = [...pdfPages];
    updatedPages[currentPage - 1] = {
      ...currentPageData,
      elements: updatedElements
    };

    setPdfPages(updatedPages);
    saveToHistory(updatedPages);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedTool === 'select') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / (zoom / 100));
    const y = ((e.clientY - rect.top) / (zoom / 100));

    if (selectedTool === 'draw') {
      setIsDrawing(true);
      setDrawingPath(`M ${x} ${y}`);
    } else {
      addElement(selectedTool, { x, y });
      setSelectedTool('select');
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || selectedTool !== 'draw') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / (zoom / 100));
    const y = ((e.clientY - rect.top) / (zoom / 100));

    setDrawingPath(prev => `${prev} L ${x} ${y}`);
  };

  const handleCanvasMouseUp = () => {
    if (isDrawing && selectedTool === 'draw') {
      setIsDrawing(false);
      if (drawingPath) {
        addElement('draw', { 
          x: 0, 
          y: 0, 
          width: 100, 
          height: 100, 
          pathData: drawingPath,
          color: '#000000'
        });
        setDrawingPath('');
      }
      setSelectedTool('select');
    }
  };

  const handleElementClick = (elementId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const element = getCurrentPage()?.elements.find(el => el.id === elementId);
    
    // Se a ferramenta de texto estiver selecionada e o elemento for texto, iniciar edição
    if (selectedTool === 'text' && element?.type === 'text') {
      setEditingElementId(elementId);
      setEditingText(element.content || '');
      setTimeout(() => {
        textInputRef.current?.focus();
        textInputRef.current?.select();
      }, 100);
    } else {
      // Seleção múltipla com Ctrl/Cmd
      if (e.ctrlKey || e.metaKey) {
        const newSelectedElements = new Set(selectedElements);
        if (newSelectedElements.has(elementId)) {
          newSelectedElements.delete(elementId);
        } else {
          newSelectedElements.add(elementId);
        }
        setSelectedElements(newSelectedElements);
        setSelectedElement(elementId);
      } else {
        // Seleção única
        setSelectedElement(selectedElement === elementId ? null : elementId);
        setSelectedElements(new Set([elementId]));
      }
    }
  };

  const [editingText, setEditingText] = useState<string | null>(null);
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  const handleElementDoubleClick = (elementId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const element = getCurrentPage()?.elements.find(el => el.id === elementId);
    if (element && element.type === 'text') {
      setEditingElementId(elementId);
      setEditingText(element.content || '');
      // Focus the input after a short delay to ensure it's rendered
      setTimeout(() => {
        textInputRef.current?.focus();
        textInputRef.current?.select();
      }, 100);
    }
  };

  const handleTextEditSave = () => {
    if (editingElementId && editingText !== null) {
      updateElement(editingElementId, { content: editingText });
    }
    setEditingElementId(null);
    setEditingText(null);
  };

  const handleTextEditCancel = () => {
    setEditingElementId(null);
    setEditingText(null);
  };

  const handleTextEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTextEditSave();
    } else if (e.key === 'Escape') {
      handleTextEditCancel();
    }
  };

  const handleElementMouseDown = (elementId: string, e: React.MouseEvent) => {
    if (selectedTool !== 'select') return;
    
    e.stopPropagation();
    setSelectedElement(elementId);
    
    // Verificar se o clique foi em um resize handle
    const target = e.target as HTMLElement;
    if (target.classList.contains('resize-handle')) {
      setIsResizing(true);
      setResizeHandle(target.dataset.handle || null);
    } else {
      setIsDragging(true);
    }
    
    const element = getCurrentPage()?.elements.find(el => el.id === elementId);
    if (element) {
      const rect = e.currentTarget.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const snapToGridValue = (value: number) => {
    if (!snapToGrid) return value;
    return Math.round(value / gridSize) * gridSize;
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!selectedElement) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const canvasRect = canvas.getBoundingClientRect();
    const scale = zoom / 100;

    if (isDragging) {
      const newX = ((e.clientX - canvasRect.left - dragOffset.x) / scale);
      const newY = ((e.clientY - canvasRect.top - dragOffset.y) / scale);
      updateElement(selectedElement, { 
        x: Math.max(0, snapToGridValue(newX)), 
        y: Math.max(0, snapToGridValue(newY)) 
      });
    } else if (isResizing && resizeHandle) {
      const element = getCurrentPage()?.elements.find(el => el.id === selectedElement);
      if (!element) return;

      const mouseX = (e.clientX - canvasRect.left) / scale;
      const mouseY = (e.clientY - canvasRect.top) / scale;
      
      let newWidth = element.width;
      let newHeight = element.height;
      let newX = element.x;
      let newY = element.y;

      switch (resizeHandle) {
        case 'nw':
          newWidth = element.x + element.width - mouseX;
          newHeight = element.y + element.height - mouseY;
          newX = mouseX;
          newY = mouseY;
          break;
        case 'n':
          newHeight = element.y + element.height - mouseY;
          newY = mouseY;
          break;
        case 'ne':
          newWidth = mouseX - element.x;
          newHeight = element.y + element.height - mouseY;
          newY = mouseY;
          break;
        case 'e':
          newWidth = mouseX - element.x;
          break;
        case 'se':
          newWidth = mouseX - element.x;
          newHeight = mouseY - element.y;
          break;
        case 's':
          newHeight = mouseY - element.y;
          break;
        case 'sw':
          newWidth = element.x + element.width - mouseX;
          newHeight = mouseY - element.y;
          newX = mouseX;
          break;
        case 'w':
          newWidth = element.x + element.width - mouseX;
          newX = mouseX;
          break;
      }

      // Garantir tamanho mínimo e aplicar snap to grid
      newWidth = Math.max(10, snapToGridValue(newWidth));
      newHeight = Math.max(10, snapToGridValue(newHeight));
      newX = snapToGridValue(newX);
      newY = snapToGridValue(newY);

      updateElement(selectedElement, { x: newX, y: newY, width: newWidth, height: newHeight });
    }
  }, [isDragging, isResizing, selectedElement, dragOffset, zoom, resizeHandle, updateElement]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const renderElements = () => {
    const currentPageData = getCurrentPage();
    if (!currentPageData) return null;

    return currentPageData.elements
      .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
      .map((element) => (
      <div
        key={element.id}
        className={`absolute border-2 cursor-pointer transition-all ${
          selectedElement === element.id 
            ? 'border-blue-500 shadow-lg' 
            : selectedElements.has(element.id)
              ? 'border-blue-400 shadow-md'
              : element.locked 
                ? 'border-orange-300' 
                : 'border-transparent hover:border-gray-300'
        } ${element.locked ? 'cursor-not-allowed' : element.type === 'text' ? 'cursor-text' : selectedTool === 'select' ? 'cursor-move' : 'cursor-pointer'}`}
        style={{
          left: element.x * (zoom / 100),
          top: element.y * (zoom / 100),
          width: element.width * (zoom / 100),
          height: element.height * (zoom / 100),
          backgroundColor: element.backgroundColor,
          opacity: element.opacity,
          zIndex: element.zIndex || 0,
          pointerEvents: element.locked ? 'none' : 'auto'
        }}
        onClick={(e) => handleElementClick(element.id, e)}
        onDoubleClick={(e) => handleElementDoubleClick(element.id, e)}
        onMouseDown={(e) => handleElementMouseDown(element.id, e)}
      >
        {element.type === 'text' && (
          <div 
            className="w-full h-full flex items-center justify-center text-center p-1 whitespace-pre-wrap overflow-hidden"
            style={{
              fontSize: (element.fontSize || 14) * (zoom / 100),
              fontFamily: element.fontFamily,
              color: element.color,
              lineHeight: '1.2',
              fontWeight: element.fontWeight,
              fontStyle: element.fontStyle,
              textDecoration: element.textDecoration,
              textAlign: element.textAlign,
              transform: `rotate(${element.rotation || 0}deg)`
            }}
          >
            {editingElementId === element.id ? (
              <div className="w-full h-full flex items-center justify-center">
                <input
                  ref={textInputRef}
                  type="text"
                  value={editingText || ''}
                  onChange={(e) => setEditingText(e.target.value)}
                  onKeyDown={handleTextEditKeyDown}
                  onBlur={handleTextEditSave}
                  className="w-full h-full text-center bg-white border-2 border-blue-500 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    fontSize: (element.fontSize || 14) * (zoom / 100),
                    fontFamily: element.fontFamily,
                    color: element.color,
                    fontWeight: element.fontWeight,
                    fontStyle: element.fontStyle,
                    textDecoration: element.textDecoration,
                    textAlign: element.textAlign,
                  }}
                  autoFocus
                />
              </div>
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center cursor-text hover:bg-blue-50 hover:bg-opacity-30 transition-colors duration-200 rounded"
                title="Duplo-clique para editar"
              >
                {element.content || (
                  <span className="text-gray-400 italic text-sm">
                    Clique duas vezes para editar
                  </span>
                )}
              </div>
            )}
          </div>
        )}
        
        {element.type === 'image' && element.imageData && (
          <img 
            src={element.imageData} 
            alt="Inserted" 
            className="w-full h-full object-contain"
            draggable={false}
            style={{
              transform: `rotate(${element.rotation || 0}deg)`
            }}
          />
        )}
        
        {element.type === 'rectangle' && (
          <div 
            className="w-full h-full border-2"
            style={{
              borderColor: element.color,
              backgroundColor: element.backgroundColor === 'transparent' ? 'transparent' : element.backgroundColor,
              transform: `rotate(${element.rotation || 0}deg)`
            }}
          />
        )}
        
        {element.type === 'circle' && (
          <div 
            className="w-full h-full border-2 rounded-full"
            style={{
              borderColor: element.color,
              backgroundColor: element.backgroundColor === 'transparent' ? 'transparent' : element.backgroundColor,
              transform: `rotate(${element.rotation || 0}deg)`
            }}
          />
        )}

        {element.type === 'line' && (
          <div 
            className="w-full h-full"
            style={{
              backgroundColor: element.color,
              transform: `rotate(${element.rotation || 0}deg)`
            }}
          />
        )}

        {element.type === 'arrow' && (
          <div 
            className="w-full h-full relative"
            style={{
              backgroundColor: element.color,
              transform: `rotate(${element.rotation || 0}deg)`
            }}
          >
            <div 
              className="absolute right-0 top-1/2 transform -translate-y-1/2"
              style={{
                width: 0,
                height: 0,
                borderLeft: `${Math.min(20, element.width * 0.2)}px solid ${element.color}`,
                borderTop: `${Math.min(10, element.height * 2)}px solid transparent`,
                borderBottom: `${Math.min(10, element.height * 2)}px solid transparent`,
              }}
            />
          </div>
        )}

        {element.type === 'draw' && element.pathData && (
          <svg 
            className="w-full h-full"
            style={{
              transform: `rotate(${element.rotation || 0}deg)`
            }}
          >
            <path
              d={element.pathData}
              stroke={element.color || '#000000'}
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        
        {element.type === 'highlight' && (
          <div 
            className="w-full h-full"
            style={{ 
              backgroundColor: element.backgroundColor, 
              opacity: element.opacity,
              transform: `rotate(${element.rotation || 0}deg)`
            }}
          />
        )}
        
        {element.type === 'annotation' && (
          <div 
            className="w-full h-full p-2 text-xs border border-gray-400 rounded shadow-md"
            style={{
              backgroundColor: element.backgroundColor,
              fontSize: Math.max(8, (element.fontSize || 12) * (zoom / 100)),
              color: element.color,
              transform: `rotate(${element.rotation || 0}deg)`
            }}
          >
            {element.content}
          </div>
        )}

        {selectedElement === element.id && !element.locked && (
          <>
            {/* Delete button */}
            <div className="absolute -top-2 -right-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteElement(element.id);
                }}
                className="bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600 shadow-md"
              >
                <Trash2 size={12} />
              </button>
            </div>

            {/* Resize handles */}
            <div 
              className="resize-handle absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-nw-resize border border-white shadow-sm"
              data-handle="nw"
              onMouseDown={(e) => e.stopPropagation()}
            ></div>
            <div 
              className="resize-handle absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-n-resize border border-white shadow-sm"
              data-handle="n"
              onMouseDown={(e) => e.stopPropagation()}
            ></div>
            <div 
              className="resize-handle absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-ne-resize border border-white shadow-sm"
              data-handle="ne"
              onMouseDown={(e) => e.stopPropagation()}
            ></div>
            <div 
              className="resize-handle absolute top-1/2 -right-1 transform -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-e-resize border border-white shadow-sm"
              data-handle="e"
              onMouseDown={(e) => e.stopPropagation()}
            ></div>
            <div 
              className="resize-handle absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize border border-white shadow-sm"
              data-handle="se"
              onMouseDown={(e) => e.stopPropagation()}
            ></div>
            <div 
              className="resize-handle absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-s-resize border border-white shadow-sm"
              data-handle="s"
              onMouseDown={(e) => e.stopPropagation()}
            ></div>
            <div 
              className="resize-handle absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-sw-resize border border-white shadow-sm"
              data-handle="sw"
              onMouseDown={(e) => e.stopPropagation()}
            ></div>
            <div 
              className="resize-handle absolute top-1/2 -left-1 transform -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-w-resize border border-white shadow-sm"
              data-handle="w"
              onMouseDown={(e) => e.stopPropagation()}
            ></div>

            {/* Rotation handle */}
            <div 
              className="absolute -top-8 left-1/2 transform -translate-x-1/2 cursor-pointer"
              onMouseDown={(e) => {
                e.stopPropagation();
                const handleRotation = (e: MouseEvent) => {
                  const element = getCurrentPage()?.elements.find(el => el.id === selectedElement);
                  if (!element) return;
                  
                  const canvas = canvasRef.current;
                  if (!canvas) return;
                  
                  const canvasRect = canvas.getBoundingClientRect();
                  const elementCenterX = (element.x + element.width / 2) * (zoom / 100) + canvasRect.left;
                  const elementCenterY = (element.y + element.height / 2) * (zoom / 100) + canvasRect.top;
                  
                  const angle = Math.atan2(e.clientY - elementCenterY, e.clientX - elementCenterX);
                  const degrees = (angle * 180) / Math.PI + 90;
                  
                  updateElement(selectedElement, { rotation: degrees });
                };
                
                const handleMouseUp = () => {
                  window.removeEventListener('mousemove', handleRotation);
                  window.removeEventListener('mouseup', handleMouseUp);
                };
                
                window.addEventListener('mousemove', handleRotation);
                window.addEventListener('mouseup', handleMouseUp);
              }}
            >
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border border-white shadow-sm hover:bg-green-600 transition-colors">
                <RotateCw size={12} className="text-white" />
              </div>
            </div>
          </>
        )}

        {selectedElement === element.id && (
          <div className="absolute -bottom-8 -left-2 flex gap-1">
            <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded shadow-md font-medium">
              {element.type === 'text' && '📝 Texto'}
              {element.type === 'image' && '🖼️ Imagem'}
              {element.type === 'rectangle' && '⬜ Retângulo'}
              {element.type === 'circle' && '⭕ Círculo'}
              {element.type === 'highlight' && '🟡 Destaque'}
              {element.type === 'annotation' && '📝 Nota'}
              {element.type === 'line' && '📏 Linha'}
              {element.type === 'arrow' && '➡️ Seta'}
            </div>
          </div>
        )}
      </div>
    ));
  };

  const exportAsImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `pdf-edit-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const savePDF = async () => {
    if (!selectedFile || pdfPages.length === 0) return;

    setIsSaving(true);
    try {
      const existingPdfBytes = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes);

      // Processar cada página
      for (let pageIndex = 0; pageIndex < pdfPages.length; pageIndex++) {
        const page = pdfDoc.getPage(pageIndex);
        const { width, height } = page.getSize();
        const pageData = pdfPages[pageIndex];

        // Adicionar elementos à página
        for (const element of pageData.elements) {
          const x = (element.x / pageData.canvas.width) * width;
          const y = height - ((element.y + element.height) / pageData.canvas.height) * height;
          const elementWidth = (element.width / pageData.canvas.width) * width;
          const elementHeight = (element.height / pageData.canvas.height) * height;

          if (element.type === 'text' && element.content) {
            const fontSize = (element.fontSize || 14) * (width / pageData.canvas.width);
            page.drawText(element.content, {
              x,
              y: y + elementHeight,
              size: fontSize,
              color: rgb(
                parseInt(element.color?.slice(1, 3) || '00', 16) / 255,
                parseInt(element.color?.slice(3, 5) || '00', 16) / 255,
                parseInt(element.color?.slice(5, 7) || '00', 16) / 255
              )
            });
          } else if (element.type === 'rectangle') {
            page.drawRectangle({
              x,
              y,
              width: elementWidth,
              height: elementHeight,
              borderColor: rgb(
                parseInt(element.color?.slice(1, 3) || '00', 16) / 255,
                parseInt(element.color?.slice(3, 5) || '00', 16) / 255,
                parseInt(element.color?.slice(5, 7) || '00', 16) / 255
              ),
              borderWidth: 2
            });
          } else if (element.type === 'highlight') {
            page.drawRectangle({
              x,
              y,
              width: elementWidth,
              height: elementHeight,
              color: rgb(
                parseInt(element.backgroundColor?.slice(1, 3) || 'FF', 16) / 255,
                parseInt(element.backgroundColor?.slice(3, 5) || 'FF', 16) / 255,
                parseInt(element.backgroundColor?.slice(5, 7) || '00', 16) / 255
              ),
              opacity: element.opacity || 0.5
            });
          } else if (element.type === 'line') {
            page.drawLine({
              start: { x, y: y + elementHeight / 2 },
              end: { x: x + elementWidth, y: y + elementHeight / 2 },
              thickness: elementHeight,
              color: rgb(
                parseInt(element.color?.slice(1, 3) || '00', 16) / 255,
                parseInt(element.color?.slice(3, 5) || '00', 16) / 255,
                parseInt(element.color?.slice(5, 7) || '00', 16) / 255
              )
            });
          }
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedFile.name.replace('.pdf', '')}_editado.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Show success message
      alert('PDF salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar PDF:', error);
      alert('Erro ao salvar o PDF. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedElementData = getCurrentPage()?.elements.find(el => el.id === selectedElement);

  return (
    <ToolLayout
      title="Edit PDF"
      description="Edite conteúdo de documentos PDF diretamente no navegador com ferramentas avançadas."
    >
      <div className="space-y-6">
        {/* Upload Area */}
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            Arraste seu PDF aqui ou clique para selecionar
          </h3>
          <p className="text-gray-600 mb-4">
            Editor PDF completo com texto, anotações, destaques e imagens
          </p>
          <div className="flex items-center justify-center gap-3">
            <Upload size={20} className="text-blue-600" />
            <span className="text-blue-600 font-medium">Selecionar PDF</span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Ferramentas de Edição */}
        {pdfPages.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            {/* Toolbar Principal */}
            <div className="flex flex-wrap items-center gap-3 mb-4 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Ferramentas:</span>
                <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setSelectedTool('select')}
                    className={`p-2 rounded-md transition-colors ${
                      selectedTool === 'select' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'
                    }`}
                    title="Selecionar (V)"
                  >
                    <MousePointer size={16} />
                  </button>
                  <button
                    onClick={() => setSelectedTool('text')}
                    className={`p-2 rounded-md transition-colors ${
                      selectedTool === 'text' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'
                    }`}
                    title="Adicionar Texto (T)"
                  >
                    <Type size={16} />
                  </button>
                  <button
                    onClick={() => setSelectedTool('highlight')}
                    className={`p-2 rounded-md transition-colors ${
                      selectedTool === 'highlight' ? 'bg-yellow-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'
                    }`}
                    title="Destacar Texto (H)"
                  >
                    <Palette size={16} />
                  </button>
                  <button
                    onClick={() => setSelectedTool('annotation')}
                    className={`p-2 rounded-md transition-colors ${
                      selectedTool === 'annotation' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'
                    }`}
                    title="Anotação (A)"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    className="p-2 rounded-md text-gray-600 hover:bg-gray-200 transition-colors"
                    title="Inserir Imagem (I)"
                  >
                    <ImageIcon size={16} />
                  </button>
                </div>
              </div>

              <div className="h-6 w-px bg-gray-300"></div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Formas:</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setSelectedTool('rectangle')}
                    className={`p-2 rounded-md transition-colors ${
                      selectedTool === 'rectangle' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'
                    }`}
                    title="Retângulo (R)"
                  >
                    <Square size={16} />
                  </button>
                  <button
                    onClick={() => setSelectedTool('circle')}
                    className={`p-2 rounded-md transition-colors ${
                      selectedTool === 'circle' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'
                    }`}
                    title="Círculo (C)"
                  >
                    <Circle size={16} />
                  </button>
                  <button
                    onClick={() => setSelectedTool('line')}
                    className={`p-2 rounded-md transition-colors ${
                      selectedTool === 'line' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'
                    }`}
                    title="Linha (L)"
                  >
                    <Square size={16} />
                  </button>
                  <button
                    onClick={() => setSelectedTool('draw')}
                    className={`p-2 rounded-md transition-colors ${
                      selectedTool === 'draw' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'
                    }`}
                    title="Desenho Livre (D)"
                  >
                    <PenTool size={16} />
                  </button>
                </div>
              </div>

              <div className="h-6 w-px bg-gray-300"></div>

              <div className="flex items-center gap-2">
                <button
                  onClick={undo}
                  disabled={historyIndex <= 0}
                  className="p-2 rounded-md text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Desfazer (Ctrl+Z)"
                >
                  <Undo size={16} />
                </button>
                <button
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                  className="p-2 rounded-md text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Refazer (Ctrl+Y)"
                >
                  <Redo size={16} />
                </button>
                {selectedElementData?.type === 'text' && (
                  <button
                    onClick={() => {
                      setEditingElementId(selectedElementData.id);
                      setEditingText(selectedElementData.content || '');
                      setTimeout(() => {
                        textInputRef.current?.focus();
                        textInputRef.current?.select();
                      }, 100);
                    }}
                    className="p-2 rounded-md text-blue-600 hover:bg-blue-100 transition-colors"
                    title="Editar Texto (F2)"
                  >
                    <Edit3 size={16} />
                  </button>
                )}

                {/* Alinhamento para seleção múltipla */}
                {selectedElements.size > 1 && (
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={() => alignElements('left')}
                      className="p-2 rounded-md text-gray-600 hover:bg-gray-200 transition-colors"
                      title="Alinhar à Esquerda"
                    >
                      <AlignLeft size={16} />
                    </button>
                    <button
                      onClick={() => alignElements('center')}
                      className="p-2 rounded-md text-gray-600 hover:bg-gray-200 transition-colors"
                      title="Alinhar ao Centro"
                    >
                      <AlignCenter size={16} />
                    </button>
                    <button
                      onClick={() => alignElements('right')}
                      className="p-2 rounded-md text-gray-600 hover:bg-gray-200 transition-colors"
                      title="Alinhar à Direita"
                    >
                      <AlignRight size={16} />
                    </button>
                  </div>
                )}

                {/* Distribuição para seleção múltipla */}
                {selectedElements.size > 2 && (
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={() => distributeElements('horizontal')}
                      className="p-2 rounded-md text-gray-600 hover:bg-gray-200 transition-colors"
                      title="Distribuir Horizontalmente"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      onClick={() => distributeElements('vertical')}
                      className="p-2 rounded-md text-gray-600 hover:bg-gray-200 transition-colors"
                      title="Distribuir Verticalmente"
                    >
                      <ArrowDown size={16} />
                    </button>
                  </div>
                )}
              </div>

              <div className="h-6 w-px bg-gray-300"></div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Zoom:</span>
                <button
                  onClick={() => setZoom(Math.max(25, zoom - 25))}
                  className="p-1 rounded text-gray-600 hover:bg-gray-200"
                  title="Diminuir Zoom"
                >
                  <ZoomOut size={14} />
                </button>
                <span className="text-sm font-mono min-w-[50px] text-center">{zoom}%</span>
                <button
                  onClick={() => setZoom(Math.min(200, zoom + 25))}
                  className="p-1 rounded text-gray-600 hover:bg-gray-200"
                  title="Aumentar Zoom"
                >
                  <ZoomIn size={14} />
                </button>
                <button
                  onClick={() => setZoom(100)}
                  className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
                  title="Zoom 100%"
                >
                  Ajustar
                </button>
              </div>

              <div className="flex-1"></div>

              <button
                onClick={() => setShowRulers(!showRulers)}
                className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                  showRulers
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title="Mostrar Réguas"
              >
                <Square size={16} />
                Réguas
              </button>

              <button
                onClick={() => setSnapToGrid(!snapToGrid)}
                className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                  snapToGrid
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title="Snap to Grid"
              >
                <Square size={16} />
                Grid
              </button>

              <button
                onClick={() => setShowLayerPanel(!showLayerPanel)}
                className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                  showLayerPanel
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title="Gerenciar Camadas"
              >
                <Layers size={16} />
                Camadas
              </button>

              <button
                onClick={exportAsImage}
                className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center gap-2 shadow-sm"
                title="Exportar como Imagem"
              >
                <ImageIcon size={16} />
                Exportar PNG
              </button>

              <button
                onClick={savePDF}
                disabled={isSaving}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Salvar PDF
                  </>
                )}
              </button>
            </div>

            {/* Text Formatting Panel */}
            {selectedElementData && selectedElementData.type === 'text' && (
              <div className="flex items-center gap-4 px-4 py-2 bg-gray-50 border-t border-gray-200">
                {/* Bold, Italic, Underline */}
                <div className="flex gap-1">
                  <button
                    onClick={() => updateSelectedElement({ fontWeight: selectedElementData.fontWeight === 'bold' ? 'normal' : 'bold' })}
                    className={`p-2 rounded transition-colors ${
                      selectedElementData.fontWeight === 'bold' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white hover:bg-gray-100 border'
                    }`}
                    title="Negrito"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => updateSelectedElement({ fontStyle: selectedElementData.fontStyle === 'italic' ? 'normal' : 'italic' })}
                    className={`p-2 rounded transition-colors ${
                      selectedElementData.fontStyle === 'italic'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white hover:bg-gray-100 border'
                    }`}
                    title="Itálico"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => updateSelectedElement({ textDecoration: selectedElementData.textDecoration === 'underline' ? 'none' : 'underline' })}
                    className={`p-2 rounded transition-colors ${
                      selectedElementData.textDecoration === 'underline'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white hover:bg-gray-100 border'
                    }`}
                    title="Sublinhado"
                  >
                    <Underline className="w-4 h-4" />
                  </button>
                </div>

                {/* Text Alignment */}
                <div className="flex gap-1">
                  {(['left', 'center', 'right'] as const).map((align) => (
                    <button
                      key={align}
                      onClick={() => updateSelectedElement({ textAlign: align })}
                      className={`p-2 rounded transition-colors ${
                        selectedElementData.textAlign === align || (!selectedElementData.textAlign && align === 'left')
                          ? 'bg-blue-500 text-white'
                          : 'bg-white hover:bg-gray-100 border'
                      }`}
                      title={`Alinhar ${align === 'left' ? 'à esquerda' : align === 'center' ? 'ao centro' : 'à direita'}`}
                    >
                      {align === 'left' && <AlignLeft className="w-4 h-4" />}
                      {align === 'center' && <AlignCenter className="w-4 h-4" />}
                      {align === 'right' && <AlignRight className="w-4 h-4" />}
                    </button>
                  ))}
                </div>

                {/* Font Size */}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Tamanho:</label>
                  <input
                    type="number"
                    value={selectedElementData.fontSize || 14}
                    onChange={(e) => updateSelectedElement({ fontSize: parseInt(e.target.value) || 14 })}
                    className="w-16 px-2 py-1 border rounded text-center"
                    min="8"
                    max="72"
                  />
                </div>

                {/* Color Picker */}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Cor:</label>
                  <input
                    type="color"
                    value={selectedElementData.color || '#000000'}
                    onChange={(e) => updateSelectedElement({ color: e.target.value })}
                    className="w-8 h-8 border rounded cursor-pointer"
                  />
                </div>
              </div>
            )}

            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {/* Painel de Propriedades */}
            {selectedElementData && (
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-4">
                <h4 className="font-semibold mb-3 text-gray-800">Propriedades do Elemento</h4>
                
                {selectedElementData.type === 'text' && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Texto</label>
                      <input
                        type="text"
                        value={selectedElementData.content || ''}
                        onChange={(e) => updateElement(selectedElementData.id, { content: e.target.value })}
                        className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Digite o texto..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Tamanho</label>
                      <div className="flex">
                        <input
                          type="number"
                          value={selectedElementData.fontSize || 14}
                          onChange={(e) => updateElement(selectedElementData.id, { fontSize: parseInt(e.target.value) })}
                          className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="8"
                          max="72"
                        />
                        <span className="px-2 text-xs text-gray-500 flex items-center">px</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Fonte</label>
                      <select
                        value={selectedElementData.fontFamily || 'Arial'}
                        onChange={(e) => updateElement(selectedElementData.id, { fontFamily: e.target.value })}
                        className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Arial">Arial</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Courier New">Courier New</option>
                        <option value="Helvetica">Helvetica</option>
                        <option value="Verdana">Verdana</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Cor</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={selectedElementData.color || '#000000'}
                          onChange={(e) => updateElement(selectedElementData.id, { color: e.target.value })}
                          className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={selectedElementData.color || '#000000'}
                          onChange={(e) => updateElement(selectedElementData.id, { color: e.target.value })}
                          className="flex-1 p-2 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {selectedElementData.type === 'highlight' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Cor do Destaque</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={selectedElementData.backgroundColor || '#FFFF00'}
                          onChange={(e) => updateElement(selectedElementData.id, { backgroundColor: e.target.value })}
                          className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={selectedElementData.backgroundColor || '#FFFF00'}
                          onChange={(e) => updateElement(selectedElementData.id, { backgroundColor: e.target.value })}
                          className="flex-1 p-2 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Transparência</label>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.1"
                        value={selectedElementData.opacity || 0.5}
                        onChange={(e) => updateElement(selectedElementData.id, { opacity: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}

                {selectedElementData.type === 'annotation' && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Anotação</label>
                      <textarea
                        value={selectedElementData.content || ''}
                        onChange={(e) => updateElement(selectedElementData.id, { content: e.target.value })}
                        className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={2}
                        placeholder="Digite sua anotação..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Cor de Fundo</label>
                      <input
                        type="color"
                        value={selectedElementData.backgroundColor || '#FFF3CD'}
                        onChange={(e) => updateElement(selectedElementData.id, { backgroundColor: e.target.value })}
                        className="w-full h-8 border border-gray-300 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => duplicateElement(selectedElementData.id)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center gap-1 transition-colors"
                  >
                    <Copy size={12} />
                    Duplicar
                  </button>
                  <button
                    onClick={() => updateElement(selectedElementData.id, { locked: !selectedElementData.locked })}
                    className={`px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors ${
                      selectedElementData.locked 
                        ? 'bg-orange-600 text-white hover:bg-orange-700' 
                        : 'bg-gray-600 text-white hover:bg-gray-700'
                    }`}
                  >
                    {selectedElementData.locked ? <Unlock size={12} /> : <Lock size={12} />}
                    {selectedElementData.locked ? 'Desbloquear' : 'Bloquear'}
                  </button>
                  {selectedElementData.groupId ? (
                    <button
                      onClick={ungroupSelectedElement}
                      className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 flex items-center gap-1 transition-colors"
                    >
                      <Ungroup size={12} />
                      Desagrupar
                    </button>
                  ) : (
                    <button
                      onClick={groupSelectedElements}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center gap-1 transition-colors"
                    >
                      <Group size={12} />
                      Agrupar
                    </button>
                  )}
                  <button
                    onClick={() => deleteElement(selectedElementData.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 size={12} />
                    Excluir
                  </button>
                </div>
              </div>
            )}

            {/* Layer Management Panel */}
            {showLayerPanel && (
              <div className="fixed right-4 top-20 w-64 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold">Camadas</h3>
                  <button
                    onClick={() => setShowLayerPanel(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {getCurrentPage()?.elements.map((element, index) => (
                    <div
                      key={element.id}
                      className={`p-2 border rounded cursor-pointer hover:bg-gray-50 ${
                        selectedElement === element.id ? 'bg-blue-50 border-blue-300' : ''
                      }`}
                      onClick={() => setSelectedElement(element.id)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm">
                          {element.type === 'text' ? `Texto: ${element.content?.slice(0, 15)}...` : 
                           element.type === 'rectangle' ? 'Retângulo' :
                           element.type === 'highlight' ? 'Destaque' :
                           element.type === 'line' ? 'Linha' :
                           element.type === 'arrow' ? 'Seta' :
                           element.type}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveElementLayer(element.id, 'up');
                            }}
                            className="p-1 hover:bg-gray-200 rounded"
                            title="Mover para frente"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveElementLayer(element.id, 'down');
                            }}
                            className="p-1 hover:bg-gray-200 rounded"
                            title="Mover para trás"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Visualização do PDF */}
        {pdfPages.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                Página {currentPage} de {pdfPages.length}
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ←
                  </button>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max={pdfPages.length}
                      value={currentPage}
                      onChange={(e) => {
                        const page = parseInt(e.target.value);
                        if (page >= 1 && page <= pdfPages.length) {
                          setCurrentPage(page);
                        }
                      }}
                      className="w-16 px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <span className="text-sm text-gray-600">de {pdfPages.length}</span>
                  </div>
                  <button
                    onClick={() => setCurrentPage(Math.min(pdfPages.length, currentPage + 1))}
                    disabled={currentPage === pdfPages.length}
                    className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex justify-center">
                <div className="relative inline-block shadow-lg rounded-lg overflow-hidden">
                  {/* Rulers */}
                  {showRulers && (
                    <>
                      {/* Horizontal ruler */}
                      <div 
                        className="absolute -top-6 left-0 right-0 h-6 bg-gray-100 border-b border-gray-300 text-xs text-gray-600"
                        style={{ width: (getCurrentPage()?.canvas.width || 0) * (zoom / 100) }}
                      >
                        {Array.from({ length: Math.floor((getCurrentPage()?.canvas.width || 0) / 50) }, (_, i) => (
                          <div 
                            key={i}
                            className="absolute top-0 h-full border-l border-gray-300 flex items-end justify-center pb-1"
                            style={{ left: (i + 1) * 50 * (zoom / 100) }}
                          >
                            {(i + 1) * 50}
                          </div>
                        ))}
                      </div>
                      
                      {/* Vertical ruler */}
                      <div 
                        className="absolute -left-6 top-0 bottom-0 w-6 bg-gray-100 border-r border-gray-300 text-xs text-gray-600"
                        style={{ height: (getCurrentPage()?.canvas.height || 0) * (zoom / 100) }}
                      >
                        {Array.from({ length: Math.floor((getCurrentPage()?.canvas.height || 0) / 50) }, (_, i) => (
                          <div 
                            key={i}
                            className="absolute left-0 w-full border-t border-gray-300 flex items-center justify-end pr-1"
                            style={{ top: (i + 1) * 50 * (zoom / 100) }}
                          >
                            {(i + 1) * 50}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  <canvas
                    ref={canvasRef}
                    width={(getCurrentPage()?.canvas.width || 0) * (zoom / 100)}
                    height={(getCurrentPage()?.canvas.height || 0) * (zoom / 100)}
                    className="border border-gray-300 cursor-crosshair bg-white"
                    style={{
                      backgroundImage: getCurrentPage() ? `url(${getCurrentPage()!.canvas.toDataURL()})` : undefined,
                      backgroundSize: `${zoom}%`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'top left'
                    }}
                    onClick={selectedTool !== 'select' ? handleCanvasClick : undefined}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                  />
                  {renderElements()}
                  
                  {/* Grid overlay */}
                  {snapToGrid && (
                    <div 
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
                        backgroundSize: `${gridSize * (zoom / 100)}px ${gridSize * (zoom / 100)}px`
                      }}
                    />
                  )}
                  
                  {selectedTool !== 'select' && (
                    <div className="absolute top-2 left-2 bg-blue-600 text-white px-3 py-1 rounded-md text-sm shadow-md">
                      {selectedTool === 'text' && '📝 Clique para adicionar texto ou clique em texto existente para editar'}
                      {selectedTool === 'highlight' && '🟡 Clique para destacar área'}
                      {selectedTool === 'annotation' && '📝 Clique para adicionar anotação'}
                      {selectedTool === 'rectangle' && '⬜ Clique para adicionar retângulo'}
                      {selectedTool === 'circle' && '⭕ Clique para adicionar círculo'}
                      {selectedTool === 'line' && '📏 Clique para adicionar linha'}
                      {selectedTool === 'draw' && '✏️ Arraste para desenhar livremente'}
                    </div>
                  )}
                  
                  {editingElementId && (
                    <div className="absolute top-2 right-2 bg-green-600 text-white px-3 py-1 rounded-md text-sm shadow-md">
                      ✏️ Editando texto... Pressione Enter para salvar ou Esc para cancelar
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Estado vazio */}
        {!selectedFile && (
          <div className="text-center py-12 text-gray-600">
            <Edit3 className="mx-auto h-20 w-20 text-gray-400 mb-6" />
            <p className="font-medium text-gray-700 text-lg mb-2">Editor PDF Profissional</p>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Edite PDFs como um profissional. Arraste elementos, duplo-clique para editar texto, use atalhos do teclado.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto text-sm">
              <div className="flex flex-col items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <Type size={20} className="text-blue-600" />
                <span className="font-medium">Texto</span>
                <span className="text-xs text-gray-600">Fontes e cores personalizáveis</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 bg-yellow-50 rounded-lg">
                <Palette size={20} className="text-yellow-600" />
                <span className="font-medium">Destaque</span>
                <span className="text-xs text-gray-600">Marque trechos importantes</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 bg-orange-50 rounded-lg">
                <Edit3 size={20} className="text-orange-600" />
                <span className="font-medium">Anotações</span>
                <span className="text-xs text-gray-600">Notas e comentários</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 bg-green-50 rounded-lg">
                <ImageIcon size={20} className="text-green-600" />
                <span className="font-medium">Imagens</span>
                <span className="text-xs text-gray-600">Logos e ilustrações</span>
              </div>
            </div>
          </div>
        )}

        {/* Informações e Atalhos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-3">🎯 Como Usar:</h4>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• <strong>Selecionar (V):</strong> Arraste elementos, redimensione e mova</li>
              <li>• <strong>Duplo-clique:</strong> Edite texto rapidamente</li>
              <li>• <strong>Ferramenta Texto (T):</strong> Clique em texto existente para editar</li>
              <li>• <strong>F2:</strong> Editar texto do elemento selecionado</li>
              <li>• <strong>Ctrl+Clique:</strong> Seleção múltipla de elementos</li>
              <li>• <strong>Desenho Livre (D):</strong> Arraste para desenhar livremente</li>
              <li>• <strong>Grid:</strong> Ative para alinhamento preciso</li>
              <li>• <strong>Réguas:</strong> Visualize medidas em pixels</li>
              <li>• <strong>Alinhamento:</strong> Alinhe elementos selecionados</li>
              <li>• <strong>Distribuição:</strong> Distribua elementos uniformemente</li>
              <li>• <strong>Propriedades:</strong> Personalize cores, fontes e tamanhos</li>
              <li>• <strong>Camadas:</strong> Elementos ficam em camadas organizadas</li>
              <li>• <strong>Zoom:</strong> Aproxime para edição detalhada</li>
              <li>• <strong>Histórico:</strong> Desfaça e refaça qualquer alteração</li>
            </ul>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-3">⌨️ Atalhos Rápidos:</h4>
            <ul className="text-sm text-green-800 space-y-2">
              <li>• <strong>V:</strong> Ferramenta seleção</li>
              <li>• <strong>T:</strong> Adicionar texto</li>
              <li>• <strong>H:</strong> Ferramenta destaque</li>
              <li>• <strong>A:</strong> Adicionar anotação</li>
              <li>• <strong>R:</strong> Retângulo</li>
              <li>• <strong>C:</strong> Círculo</li>
              <li>• <strong>L:</strong> Linha</li>
              <li>• <strong>D:</strong> Desenho livre</li>
              <li>• <strong>Ctrl+Z:</strong> Desfazer</li>
              <li>• <strong>Ctrl+Y:</strong> Refazer</li>
              <li>• <strong>Ctrl+Clique:</strong> Seleção múltipla</li>
            </ul>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
