'use client';

import { useState, useEffect } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Copy, RefreshCw, Palette } from 'lucide-react';

interface Color {
  hex: string;
  rgb: string;
  hsl: string;
}

export default function GeradorCoresPage() {
  const [color, setColor] = useState<Color>({
    hex: '#3B82F6',
    rgb: 'rgb(59, 130, 246)',
    hsl: 'hsl(217, 91%, 60%)'
  });
  const [palette, setPalette] = useState<Color[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s;
    const l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        default: h = 0;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  const updateColor = (hex: string) => {
    const rgb = hexToRgb(hex);
    if (rgb) {
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      setColor({
        hex: hex.toUpperCase(),
        rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
        hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
      });
    }
  };

  const generateRandomColor = () => {
    const hex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    updateColor(hex);
  };

  const generatePalette = () => {
    const colors: Color[] = [];
    for (let i = 0; i < 8; i++) {
      const hex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
      const rgb = hexToRgb(hex);
      if (rgb) {
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        colors.push({
          hex: hex.toUpperCase(),
          rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
          hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
        });
      }
    }
    setPalette(colors);
  };

  const copyToClipboard = async (text: string, format: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(format);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  useEffect(() => {
    generatePalette();
  }, []);

  const ColorBlock = ({ color, size = 'large' }: { color: Color; size?: 'large' | 'small' }) => (
    <div className={`border border-gray-300 rounded-lg overflow-hidden ${size === 'large' ? 'h-48' : 'h-24'}`}>
      <div 
        className={`${size === 'large' ? 'h-32' : 'h-16'} cursor-pointer transition-transform hover:scale-105`}
        style={{ backgroundColor: color.hex }}
        onClick={() => updateColor(color.hex)}
        title="Clique para selecionar esta cor"
      />
      <div className={`p-2 bg-white ${size === 'large' ? 'space-y-1' : ''}`}>
        <button
          onClick={() => copyToClipboard(color.hex, 'hex')}
          className={`block w-full text-left text-xs font-mono hover:bg-gray-100 p-1 rounded ${
            copied === 'hex' && color.hex === color.hex ? 'bg-green-100' : ''
          }`}
        >
          {color.hex}
        </button>
        {size === 'large' && (
          <>
            <button
              onClick={() => copyToClipboard(color.rgb, 'rgb')}
              className={`block w-full text-left text-xs font-mono hover:bg-gray-100 p-1 rounded ${
                copied === 'rgb' && color.rgb === color.rgb ? 'bg-green-100' : ''
              }`}
            >
              {color.rgb}
            </button>
            <button
              onClick={() => copyToClipboard(color.hsl, 'hsl')}
              className={`block w-full text-left text-xs font-mono hover:bg-gray-100 p-1 rounded ${
                copied === 'hsl' && color.hsl === color.hsl ? 'bg-green-100' : ''
              }`}
            >
              {color.hsl}
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <ToolLayout
      title="Gerador de Cores"
      description="Gere cores aleatórias e paletas de cores para seus projetos."
    >
      <div className="space-y-6">
        {/* Cor Principal */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Cor Selecionada</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <ColorBlock color={color} size="large" />
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecionar Cor
                </label>
                <input
                  type="color"
                  value={color.hex}
                  onChange={(e) => updateColor(e.target.value)}
                  className="w-full h-12 border border-gray-300 rounded-md cursor-pointer"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código HEX
                </label>
                <input
                  type="text"
                  value={color.hex}
                  onChange={(e) => updateColor(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 font-mono"
                />
              </div>
              
              <button
                onClick={generateRandomColor}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} />
                Gerar Cor Aleatória
              </button>
            </div>
          </div>
        </div>

        {/* Paleta de Cores */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Paleta de Cores</h3>
            <button
              onClick={generatePalette}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <Palette size={16} />
              Nova Paleta
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {palette.map((paletteColor, index) => (
              <ColorBlock key={index} color={paletteColor} size="small" />
            ))}
          </div>
        </div>

        {copied && (
          <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg">
            Código {copied.toUpperCase()} copiado!
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
