'use client';

import { useState, useRef } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { QrCode, Download } from 'lucide-react';
import QRCode from 'qrcode';
import { useI18n } from '@/i18n/client';

export default function GerarQrcodePage() {
  const { t } = useI18n();
  const [qrContent, setQrContent] = useState('');
  const [contentType, setContentType] = useState('text');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [size, setSize] = useState('300');
  const [color, setColor] = useState('#000000');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateQRCode = async () => {
    if (!qrContent.trim()) {
      alert(t.qrGenerator.enterContent);
      return;
    }

    try {
      const canvas = canvasRef.current;
      if (canvas) {
        await QRCode.toCanvas(canvas, qrContent, {
          width: parseInt(size),
          color: {
            dark: color,
            light: '#FFFFFF'
          }
        });
        
        const dataUrl = canvas.toDataURL();
        setQrCodeUrl(dataUrl);
      }
    } catch (err) {
      console.error('Erro ao gerar QR Code:', err);
      alert(t.qrGenerator.errorGenerating);
    }
  };

  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = 'qrcode.png';
      link.click();
    }
  };

  const handleContentTypeChange = (type: string) => {
    setContentType(type);
    setQrContent('');
  };

  const getPlaceholder = () => {
    switch (contentType) {
      case 'url': return t.qrGenerator.placeholders.url;
      case 'wifi': return t.qrGenerator.placeholders.wifi;
      case 'vcard': return t.qrGenerator.placeholders.vcard;
      case 'sms': return t.qrGenerator.placeholders.sms;
      default: return t.qrGenerator.placeholders.text;
    }
  };
  return (
    <ToolLayout
      title={t.qrGeneratorTitle}
      description={t.qrGeneratorDescription}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">{t.qrGenerator.settings}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.qrGenerator.contentType}</label>
                <select 
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={contentType}
                  onChange={(e) => handleContentTypeChange(e.target.value)}
                >
                  <option value="text">{t.qrGenerator.contentTypes.text}</option>
                  <option value="url">{t.qrGenerator.contentTypes.url}</option>
                  <option value="wifi">{t.qrGenerator.contentTypes.wifi}</option>
                  <option value="vcard">{t.qrGenerator.contentTypes.vcard}</option>
                  <option value="sms">{t.qrGenerator.contentTypes.sms}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.qrGenerator.content}</label>
                <textarea 
                  placeholder={getPlaceholder()}
                  value={qrContent}
                  onChange={(e) => setQrContent(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.qrGenerator.size}</label>
                  <select 
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                  >
                    <option value="200">200x200</option>
                    <option value="300">300x300</option>
                    <option value="500">500x500</option>
                    <option value="1000">1000x1000</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.qrGenerator.color}</label>
                  <input 
                    type="color" 
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full border border-gray-300 rounded-md h-10" 
                  />
                </div>
              </div>

              <button 
                onClick={generateQRCode}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t.qrGenerator.generate}
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">{t.qrGenerator.preview}</h3>
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              {qrCodeUrl ? (
                <div>
                  <canvas 
                    ref={canvasRef} 
                    style={{ display: 'none' }}
                  />
                  <img 
                    src={qrCodeUrl} 
                    alt={t.qrGenerator.generated} 
                    className="mx-auto mb-4 max-w-full h-auto"
                  />
                  <button 
                    onClick={downloadQRCode}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto"
                  >
                    <Download size={16} />
                    {t.qrGenerator.download}
                  </button>
                </div>
              ) : (
                <div>
                  <QrCode size={150} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">{t.qrGenerator.previewText}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </ToolLayout>
  );
}
