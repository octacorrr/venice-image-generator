'use client';

import { useState } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    setImage(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al generar');
      }

      setImage(data.image);
    } catch (err: any) {
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{
      maxWidth: '900px',
      margin: '0 auto',
      padding: '40px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      minHeight: '100vh',
    }}>
      <header style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '8px' }}>
          Venice Image Generator
        </h1>
        <p style={{ color: '#888', fontSize: '14px' }}>
          Estilo Grok · Powered by Venice.ai (NSFW enabled)
        </p>
      </header>

      <div style={{
        background: '#1a1a1a',
        borderRadius: '16px',
        padding: '20px',
        border: '1px solid #2a2a2a',
      }}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe la imagen que quieres generar..."
          rows={4}
          style={{
            width: '100%',
            background: '#0f0f0f',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '16px',
            color: '#fff',
            fontSize: '16px',
            outline: 'none',
            marginBottom: '16px',
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              generate();
            }
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={generate}
            disabled={loading || !prompt.trim()}
            style={{
              background: loading ? '#333' : '#fff',
              color: loading ? '#888' : '#000',
              padding: '12px 28px',
              borderRadius: '999px',
              fontWeight: 600,
              fontSize: '15px',
              opacity: loading || !prompt.trim() ? 0.6 : 1,
              transition: 'all 0.2s',
            }}
          >
            {loading ? 'Generando...' : 'Generar'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          background: '#3a1515',
          color: '#ff6b6b',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '14px',
        }}>
          {error}
        </div>
      )}

      {loading && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '400px',
          background: '#1a1a1a',
          borderRadius: '16px',
          border: '1px solid #2a2a2a',
        }}>
          <div style={{ textAlign: 'center', color: '#888' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid #333',
              borderTopColor: '#fff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px',
            }} />
            Generando imagen...
          </div>
        </div>
      )}

      {image && !loading && (
        <div style={{
          background: '#1a1a1a',
          borderRadius: '16px',
          padding: '16px',
          border: '1px solid #2a2a2a',
          textAlign: 'center',
        }}>
          <img
            src={image}
            alt="Generated"
            style={{
              maxWidth: '100%',
              borderRadius: '12px',
              display: 'block',
              margin: '0 auto',
            }}
          />
          <a
            href={image}
            download="venice-image.png"
            style={{
              display: 'inline-block',
              marginTop: '16px',
              color: '#888',
              fontSize: '14px',
              textDecoration: 'none',
            }}
          >
            Descargar imagen
          </a>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}