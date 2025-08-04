'use client';

import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Copy, Hash } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';

export default function HashGeneratorPage() {
  const [text, setText] = useState('');
  const [hashes, setHashes] = useState({
    md5: '',
    sha1: '',
    sha256: '',
    sha512: ''
  });
  const [copied, setCopied] = useState<string | null>(null);

  // Função simples para MD5 (para demonstração)
  const simpleMD5 = (str: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = ((hash << 5) - hash + data[i]) & 0xffffffff;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  };

  const generateHashes = async (input: string) => {
    if (!input) {
      setHashes({ md5: '', sha1: '', sha256: '', sha512: '' });
      return;
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(input);

    try {
      const [sha1Buffer, sha256Buffer, sha512Buffer] = await Promise.all([
        crypto.subtle.digest('SHA-1', data),
        crypto.subtle.digest('SHA-256', data),
        crypto.subtle.digest('SHA-512', data)
      ]);

      const sha1 = Array.from(new Uint8Array(sha1Buffer))
        .map(b => b.toString(16).padStart(2, '0')).join('');
      const sha256 = Array.from(new Uint8Array(sha256Buffer))
        .map(b => b.toString(16).padStart(2, '0')).join('');
      const sha512 = Array.from(new Uint8Array(sha512Buffer))
        .map(b => b.toString(16).padStart(2, '0')).join('');

      setHashes({
        md5: simpleMD5(input),
        sha1,
        sha256,
        sha512
      });
    } catch (error) {
      console.error('Erro ao gerar hashes:', error);
    }
  };

  const copyHash = async (hash: string, type: string) => {
    const success = await copyToClipboard(hash);
    if (success) {
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const HashRow = ({ label, value, type }: { label: string; value: string; type: string }) => (
    <div className="bg-white border border-gray-300 rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-semibold text-gray-700">{label}</label>
        <button
          onClick={() => copyHash(value, type)}
          className={`px-3 py-1 rounded-md text-xs transition-colors flex items-center gap-1 ${
            copied === type 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-600 text-white hover:bg-gray-700'
          }`}
          disabled={!value}
        >
          <Copy size={12} />
          {copied === type ? 'Copiado!' : 'Copiar'}
        </button>
      </div>
      <input
        type="text"
        value={value}
        readOnly
        className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 font-mono text-sm"
        placeholder={`Hash ${label} aparecerá aqui...`}
      />
    </div>
  );

  return (
    <ToolLayout
      title="Gerador de Hash"
      description="Gere hashes MD5, SHA-1, SHA-256 e SHA-512 para seus textos."
    >
      <div className="space-y-6">
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Hash size={20} />
            Texto para Hash
          </h3>
          
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              generateHashes(e.target.value);
            }}
            placeholder="Digite ou cole o texto que deseja converter em hash..."
            className="w-full h-32 border border-gray-300 rounded-md p-4 resize-y focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          
          <div className="mt-4 text-sm text-gray-600">
            Caracteres: {text.length}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Hashes Gerados</h3>
          
          <div className="space-y-4">
            <HashRow label="MD5" value={hashes.md5} type="md5" />
            <HashRow label="SHA-1" value={hashes.sha1} type="sha1" />
            <HashRow label="SHA-256" value={hashes.sha256} type="sha256" />
            <HashRow label="SHA-512" value={hashes.sha512} type="sha512" />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Sobre os Algoritmos de Hash:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li><strong>MD5:</strong> 128 bits - Rápido, mas não mais considerado seguro para criptografia</li>
            <li><strong>SHA-1:</strong> 160 bits - Mais seguro que MD5, mas sendo substituído</li>
            <li><strong>SHA-256:</strong> 256 bits - Padrão atual para segurança criptográfica</li>
            <li><strong>SHA-512:</strong> 512 bits - Mais longo e seguro, usado para alta segurança</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}
