'use client';

import { useState, useEffect } from 'react';

type GalleryItem = {
  id: string;
  prompt: string;
  image: string;
  createdAt: number;
};

const ANGLES = [
  { value: '', label: 'Automático' },
  { value: 'from a low angle looking up', label: 'Ángulo bajo (looking up)' },
  { value: 'from a high angle looking down', label: 'Ángulo alto (looking down)' },
  { value: 'eye level shot', label: 'Nivel de ojos' },
  { value: 'dutch angle', label: 'Ángulo holandés' },
  { value: 'from behind', label: 'Desde atrás' },
  { value: 'side view / profile', label: 'Vista de perfil' },
  { value: 'three-quarter view', label: 'Vista tres cuartos' },
];

const POSITIONS = [
  { value: '', label: 'Sin posición específica' },
  { value: 'missionary position', label: 'Misionero' },
  { value: 'doggy style, from behind', label: 'Perrito (doggy)' },
  { value: 'cowgirl position, riding on top', label: 'Cowgirl (ella arriba)' },
  { value: 'reverse cowgirl', label: 'Cowgirl inversa' },
  { value: 'standing sex, against the wall', label: 'De pie (contra la pared)' },
  { value: 'spooning position', label: 'Cucharita' },
  { value: '69 position', label: '69' },
  { value: 'lotus position', label: 'Loto' },
  { value: 'prone bone', label: 'Prone bone' },
  { value: 'mating press', label: 'Mating press' },
  { value: 'amazon position', label: 'Amazon' },
  { value: 'full nelson', label: 'Full nelson' },
  { value: 'bent over', label: 'Inclinada / bent over' },
  { value: 'legs over shoulders', label: 'Piernas sobre hombros' },
  { value: 'on all fours', label: 'A cuatro patas' },
];

const ASPECTS = [
  { value: '1:1', label: 'Cuadrado (1:1)', w: 1024, h: 1024 },
  { value: '3:4', label: 'Retrato (3:4)', w: 768, h: 1024 },
  { value: '4:3', label: 'Paisaje (4:3)', w: 1024, h: 768 },
  { value: '9:16', label: 'Vertical móvil (9:16)', w: 576, h: 1024 },
  { value: '16:9', label: 'Horizontal (16:9)', w: 1024, h: 576 },
];

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('blurry, low quality, deformed, bad anatomy, extra limbs, watermark, text');
  const [angle, setAngle] = useState('');
  const [position, setPosition] = useState('');
  const [aspect, setAspect] = useState('1:1');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gallery, setGallery] = useState<GalleryItem[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('venice-gallery');
      if (saved) setGallery(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('venice-gallery', JSON.stringify(gallery));
    } catch {}
  }, [gallery]);

  const buildFinalPrompt = () => {
    let final = prompt.trim();
    if (position) final += `, ${position}`;
    if (angle) final += `, ${angle}`;
    if (negativePrompt.trim()) {
      final += `. Avoid: ${negativePrompt}`;
    }
    return final;
  };

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    setImage(null);

    const selectedAspect = ASPECTS.find(a => a.value === aspect) || ASPECTS[0];

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: buildFinalPrompt(),
          width: selectedAspect.w,
          height: selectedAspect.h,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al generar');
      }

      // Añadimos un timestamp para forzar recarga de la imagen
      const imageWithCacheBust = `${data.image}&t=${Date.now()}`;
      setImage(imageWithCacheBust);

      const newItem: GalleryItem = {
        id: Date.now().toString(),
        prompt: buildFinalPrompt(),
        image: imageWithCacheBust,
        createdAt: Date.now(),
      };
      setGallery(prev => [newItem, ...prev].slice(0, 30));
    } catch (err: any) {
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = async (src: string, name?: string) => {
    try {
      const res = await fetch(src);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name || `pollinations-${Date.now()}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: abrir en nueva pestaña
      window.open(src, '_blank');
    }
  };

  const removeFromGallery = (id: string) => {
    setGallery(prev => prev.filter(item => item.id !== id));
  };

  const clearGallery = () => {
    if (confirm('¿Borrar toda la galería?')) {
      setGallery([]);
    }
  };

  return (
    <main style={{
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '32px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      minHeight: '100vh',
    }}>
      <header style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 600, marginBottom: '6px' }}>
          Image Generator
        </h1>
        <p style={{ color: '#888', fontSize: '13px' }}>
          Powered by Pollinations.ai · Gratis · Sin API key
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
          rows={3}
          style={{
            width: '100%',
            background: '#0f0f0f',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '14px',
            color: '#fff',
            fontSize: '15px',
            outline: 'none',
            marginBottom: '14px',
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              generate();
            }
          }}
        />

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          marginBottom: '14px',
        }}>
          <div>
            <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' }}>Posición sexual</label>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              style={selectStyle}
            >
              {POSITIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' }}>Ángulo / Cámara</label>
            <select
              value={angle}
              onChange={(e) => setAngle(e.target.value)}
              style={selectStyle}
            >
              {ANGLES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' }}>Formato</label>
            <select
              value={aspect}
              onChange={(e) => setAspect(e.target.value)}
              style={selectStyle}
            >
              {ASPECTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' }}>
            Negative prompt (lo que NO quieres)
          </label>
          <input
            type="text"
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            style={{
              width: '100%',
              background: '#0f0f0f',
              border: '1px solid #333',
              borderRadius: '8px',
              padding: '10px 12px',
              color: '#ccc',
              fontSize: '13px',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={generate}
            disabled={loading || !prompt.trim()}
            style={{
              background: loading ? '#333' : '#fff',
              color: loading ? '#888' : '#000',
              padding: '11px 26px',
              borderRadius: '999px',
              fontWeight: 600,
              fontSize: '14px',
              opacity: loading || !prompt.trim() ? 0.55 : 1,
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
          height: '360px',
          background: '#1a1a1a',
          borderRadius: '16px',
          border: '1px solid #2a2a2a',
        }}>
          <div style={{ textAlign: 'center', color: '#888' }}>
            <div style={{
              width: '36px',
              height: '36px',
              border: '3px solid #333',
              borderTopColor: '#fff',
              borderRadius: '50%',
              animation: 'spin 0.9s linear infinite',
              margin: '0 auto 14px',
            }} />
            Generando imagen (puede tardar 10-20 segundos)...
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
          <button
            onClick={() => downloadImage(image)}
            style={{
              marginTop: '14px',
              background: 'transparent',
              color: '#aaa',
              fontSize: '13px',
              padding: '6px 14px',
              border: '1px solid #444',
              borderRadius: '8px',
            }}
          >
            Descargar imagen
          </button>
        </div>
      )}

      {gallery.length > 0 && (
        <section>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600 }}>
              Galería ({gallery.length})
            </h2>
            <button
              onClick={clearGallery}
              style={{
                background: 'transparent',
                color: '#888',
                fontSize: '12px',
                border: '1px solid #444',
                borderRadius: '6px',
                padding: '4px 10px',
              }}
            >
              Borrar todo
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '12px',
          }}>
            {gallery.map(item => (
              <div
                key={item.id}
                style={{
                  background: '#1a1a1a',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid #2a2a2a',
                  position: 'relative',
                }}
              >
                <img
                  src={item.image}
                  alt={item.prompt}
                  style={{
                    width: '100%',
                    aspectRatio: '1',
                    objectFit: 'cover',
                    display: 'block',
                    cursor: 'pointer',
                  }}
                  onClick={() => setImage(item.image)}
                  title={item.prompt}
                />
                <div style={{
                  padding: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '6px',
                }}>
                  <button
                    onClick={() => downloadImage(item.image, `pollinations-${item.id}.jpg`)}
                    style={{
                      flex: 1,
                      background: '#222',
                      color: '#ccc',
                      fontSize: '11px',
                      padding: '5px',
                      borderRadius: '6px',
                      border: 'none',
                    }}
                  >
                    Descargar
                  </button>
                  <button
                    onClick={() => removeFromGallery(item.id)}
                    style={{
                      background: '#331111',
                      color: '#ff8888',
                      fontSize: '11px',
                      padding: '5px 8px',
                      borderRadius: '6px',
                      border: 'none',
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}

const selectStyle: React.CSSProperties = {
  width: '100%',
  background: '#0f0f0f',
  border: '1px solid #333',
  borderRadius: '8px',
  padding: '8px 10px',
  color: '#eee',
  fontSize: '13px',
  outline: 'none',
};