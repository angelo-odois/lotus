'use client';

import { useState, useEffect } from 'react';

export default function DebugCoolifyPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDebugInfo();
  }, []);

  async function fetchDebugInfo() {
    try {
      setLoading(true);
      const response = await fetch('/api/debug-coolify');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao carregar debug info');
      }
      
      setDebugInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Debug Coolify - Carregando...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Debug Coolify - Erro</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🔍 Debug Coolify Environment</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📊 Resumo</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Timestamp:</strong> {debugInfo.timestamp}
            </div>
            <div>
              <strong>Status:</strong> 
              <span className={`ml-2 px-2 py-1 rounded text-sm ${debugInfo.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {debugInfo.success ? 'SUCCESS' : 'ERROR'}
              </span>
            </div>
          </div>
        </div>

        {debugInfo.debug && (
          <>
            {/* Request Info */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">🌐 Request Information</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Protocol:</strong> {debugInfo.debug.protocol}</div>
                <div><strong>Hostname:</strong> {debugInfo.debug.hostname}</div>
                <div><strong>Port:</strong> {debugInfo.debug.port || 'default'}</div>
                <div><strong>Origin:</strong> {debugInfo.debug.origin}</div>
                <div className="col-span-2"><strong>Full URL:</strong> {debugInfo.debug.href}</div>
              </div>
            </div>

            {/* Headers */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">📋 Headers</h2>
              <div className="grid grid-cols-1 gap-2 text-sm font-mono">
                {Object.entries(debugInfo.debug.headers).map(([key, value]) => (
                  <div key={key} className="border-b pb-1">
                    <strong>{key}:</strong> {value || 'null'}
                  </div>
                ))}
              </div>
            </div>

            {/* Environment */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">⚙️ Environment Variables</h2>
              <div className="grid grid-cols-2 gap-4 text-sm font-mono">
                {Object.entries(debugInfo.debug.environment).map(([key, value]) => (
                  <div key={key}>
                    <strong>{key}:</strong> {value || 'undefined'}
                  </div>
                ))}
              </div>
            </div>

            {/* Computed Values */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">🧮 Computed Values</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {Object.entries(debugInfo.debug.computed).map(([key, value]) => (
                  <div key={key}>
                    <strong>{key}:</strong>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      typeof value === 'boolean' 
                        ? value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Cookies */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">🍪 Current Cookies</h2>
              <div className="grid grid-cols-1 gap-2 text-sm">
                {Object.entries(debugInfo.debug.currentCookies).map(([key, value]) => (
                  <div key={key} className="flex justify-between border-b pb-1">
                    <strong>{key}:</strong>
                    <span className={`px-2 py-1 rounded text-xs ${
                      value === 'EXISTS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* IP Detection */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">🔍 IP Detection Logic</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {Object.entries(debugInfo.debug.ipDetection).map(([key, value]) => (
                  <div key={key}>
                    <strong>{key}:</strong>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      typeof value === 'boolean' 
                        ? value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">🔄 Actions</h2>
          <button 
            onClick={fetchDebugInfo}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Refresh Debug Info
          </button>
        </div>
      </div>
    </div>
  );
}