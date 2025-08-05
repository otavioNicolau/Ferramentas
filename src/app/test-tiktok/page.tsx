'use client';

import { useState } from 'react';

export default function TikTokTestPage() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testInfo = async () => {
    if (!url) return;
    
    setLoading(true);
    setError('');
    setResult(null);
    
    try {
      const response = await fetch('/api/tiktok/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      
      const data = await response.json();
      setResult(data);
      
      if (!response.ok) {
        setError(data.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const testDownload = async (type: 'video' | 'audio') => {
    if (!url) return;
    
    setLoading(true);
    setError('');
    
    try {
      console.log(`Testando download de ${type}...`);
      
      const response = await fetch('/api/tiktok/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, type }),
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorData = await response.json();
        setError(`Erro ${response.status}: ${errorData.message}`);
        return;
      }
      
      const blob = await response.blob();
      console.log('Blob recebido:', { size: blob.size, type: blob.type });
      
      setError(`Sucesso! Arquivo ${type} recebido: ${blob.size} bytes, tipo: ${blob.type}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      console.error('Erro completo:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Teste TikTok API</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">URL do TikTok:</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.tiktok.com/..."
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={testInfo}
            disabled={loading || !url}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
          >
            {loading ? 'Testando...' : 'Testar Info'}
          </button>
          
          <button
            onClick={() => testDownload('video')}
            disabled={loading || !url}
            className="bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
          >
            Testar Vídeo
          </button>
          
          <button
            onClick={() => testDownload('audio')}
            disabled={loading || !url}
            className="bg-purple-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
          >
            Testar Áudio
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {result && (
          <div className="bg-gray-50 border border-gray-200 rounded p-3">
            <h3 className="font-semibold mb-2">Resultado:</h3>
            <pre className="text-xs bg-white p-2 rounded overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
