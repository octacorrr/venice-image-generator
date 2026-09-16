'use client';

import { useState, useEffect } from 'react';

type GalleryItem = {
  id: string;
  prompt: string;
  image: string;
  createdAt: number;
};

const MODELS = [
  { value: 'flux', label: 'Flux (rápido)' },
  { value: 'black-forest-labs/flux.1-schnell', label: 'Flux Schnell' },
  { value: 'tongyi-mai/z-image-turbo', label: 'Z-Image Turbo' },
  { value: 'bytedance/seedream-4.0', label: 'Seedream 4.0' },
  { value: 'bytedance/seedream-5.0-lite', label: 'Seedream 5.0 Lite' },
  { value: 'openai/gpt-image-1-mini', label: 'GPT Image Mini' },
  { value: 'x-ai/grok-imagine-image', label: 'Grok Imagine' },
];

const QUALITIES = [
  { value: 'default', label: 'Por defecto' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'hd', label: 'HD' },
];

const STYLES = [
  { value: '', label: 'Sin especificar' },
  { value: 'photorealistic, realistic photography', label: 'Realistic' },
  { value: 'anime style, anime', label: 'Anime' },
  { value: 'anime realistic, semi-realistic anime', label: 'Anime Realistic' },
  { value: '3d render, cgi, octane render', label: '3D Render' },
  { value: 'cartoon style, illustration', label: 'Cartoon' },
];

const COUPLE_TYPES = [
  { value: '', label: 'Sin especificar' },
  { value: 'man and woman', label: 'Hombre y Mujer' },
  { value: 'two women, lesbian', label: 'Mujer y Mujer' },
  { value: 'two men, gay', label: 'Hombre y Hombre' },
  { value: 'one woman', label: 'Solo Mujer' },
  { value: 'one man', label: 'Solo Hombre' },
  { value: 'threesome, man and two women', label: 'Trío (H + 2M)' },
  { value: 'threesome, two men and one woman', label: 'Trío (2H + M)' },
];

const LOCATIONS = [
  { value: '', label: 'Sin especificar' },
  { value: 'in a luxury hotel room', label: 'Hotel de lujo' },
  { value: 'in a cozy cabin', label: 'Cabaña' },
  { value: 'on the beach', label: 'Playa' },
  { value: 'in a bedroom', label: 'Habitación' },
  { value: 'in a bathroom', label: 'Baño' },
  { value: 'in a forest', label: 'Bosque' },
  { value: 'in a car', label: 'Coche' },
  { value: 'in a pool', label: 'Piscina' },
  { value: 'in an office', label: 'Oficina' },
];

const POSITIONS = [
  { value: '', label: 'Sin especificar' },
  { value: 'missionary position', label: 'Misionero' },
  { value: 'doggy style, from behind', label: 'Perrito (doggy)' },
  { value: 'cowgirl position, riding on top', label: 'Cowgirl (ella arriba)' },
  { value: 'reverse cowgirl', label: 'Cowgirl inversa' },
  { value: 'standing sex, against the wall', label: 'De pie' },
  { value: 'spooning position', label: 'Cucharita' },
  { value: '69 position', label: '69' },
  { value: 'bent over', label: 'Inclinada' },
  { value: 'on all fours', label: 'A cuatro patas' },
];

const ANGLES = [
  { value: '', label: 'Sin especificar' },
  { value: 'from a low angle looking up', label: 'Ángulo bajo' },
  { value: 'from a high angle looking down', label: 'Ángulo alto' },
  { value: 'eye level shot', label: 'Nivel de ojos' },
  { value: 'from behind', label: 'Desde atrás' },
  { value: 'side view / profile', label: 'Vista de perfil' },
];

const ASPECTS = [
  { value: '1:1', label: 'Cuadrado (1:1)', w: 1024, h: 1024 },
  { value: '3:4', label: 'Retrato (3:4)', w: 768, h: 1024 },
  { value: '4:3', label: 'Paisaje (4:3)', w: 1024, h: 768 },
  { value: '9:16', label: 'Vertical (9:16)', w: 576, h: 1024 },
  { value: '16:9', label: 'Horizontal (16:9)', w: 1024, h: 576 },
];

const QUANTITIES = [
  { value: 1, label: '1 imagen' },
  { value: 2, label: '2 imágenes' },
  { value: 3, label: '3 imágenes' },
  { value: 4, label: '4 imágenes' },
  { value: 5, label: '5 imágenes' },
];

const THEMES = [
  { id: 'dark', name: 'Oscuro', bg: '#0f0f0f', card: '#1a1a1a', text: '#e5e5e5', muted: '#888', border: '#2a2a2a', accent: '#fff' },
  { id: 'purple', name: 'Púrpura', bg: '#13091f', card: '#1e1230', text: '#e8e0f0', muted: '#9b8bb8', border: '#3a2a50', accent: '#c084fc' },
  { id: 'blue', name: 'Azul', bg: '#0a1220', card: '#111b2e', text: '#e0e8f5', muted: '#7a8ba8', border: '#1e2d45', accent: '#60a5fa' },
  { id: 'rose', name: 'Rosa', bg: '#1a0f14', card: '#26151c', text: '#f5e0e8', muted: '#b88a9b', border: '#3d2430', accent: '#f472b6' },
];

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('flux');
  const [quality, setQuality] = useState('high');
  const [style, setStyle] = useState('');
  const [coupleType, setCoupleType] = useState('');
  const [location, setLocation] = useState('');
  const [position, setPosition] = useState('');
  const [angle, setAngle] = useState('');
  const [aspect, setAspect] = useState('1:1');
  const [quantity, setQuantity] = useState(1);
  const [theme, setTheme] = useState('dark');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [showThemes, setShowThemes] = useState(false);

  const currentTheme = THEMES.find(t => t.id === theme) || THEMES[0];

  useEffect(() => {
    try {
      const saved = localStorage.getItem('venice-gallery');
      if (saved) setGallery(JSON.parse(saved));
      const savedTheme = localStorage.getItem('app-theme');
      if (savedTheme) setTheme(savedTheme);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('venice-gallery', JSON.stringify(gallery));
    } catch {}
  }, [gallery]);

  useEffect(() => {
    try {
      localStorage.setItem('app-theme', theme);
    } catch {}
  }, [theme]);

  // Solo añade partes que tengan valor (Sin especificar = no interviene)
  const buildFinalPrompt = () => {
    const parts: string[] = [];

    if (coupleType) parts.push(coupleType);
    if (prompt.trim()) parts.push(prompt.trim());
    if (position) parts.push(position);
    if (angle) parts.push(angle);
    if (location) parts.push(location);
    if (style) parts.push(style);

    return parts.join(', ');
  };

  const generate = async () => {
    const finalPrompt = buildFinalPrompt();
    if (!finalPrompt.trim()) {
      setError('Escribe un prompt o elige al menos una opción');
      return;
    }

    setLoading(true);
    setError('');
    setImages([]);

    const selectedAspect = ASPECTS.find(a => a.value === aspect) || ASPECTS[0];

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: finalPrompt,
          width: selectedAspect.w,
          height: selectedAspect.h,
          model,
          quantity,
          quality,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al generar');
      }

      const resultImages: string[] = data.images || (data.image ? [data.image] : []);
      setImages(resultImages);

      const newItems: GalleryItem[] = resultImages.map((img, i) => ({
        id: `${Date.now()}-${i}`,
        prompt: finalPrompt,
        image: img,
        createdAt: Date.now(),
      }));
      setGallery(prev => [...newItems, ...prev].slice(0, 40));
    } catch (err: any) {
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = async (src: string, name?: string) => {
    try {
      const a = document.createElement('a');
      a.href = src;
      a.download = name || `image-${Date.now()}.jpg`;
      a.click();
    } catch {
      window.open(src, '_blank');
    }
  };

  const removeFromGallery = (id: string) => {
    setGallery(prev => prev.filter(item => item.id !== id));
  };

  const clearGallery = () => {
    if (confirm('¿Borrar toda la galería?')) setGallery([]);
  };

  const selectStyle: React.CSSProperties = {
    width: '100%',
    background: currentTheme.bg,
    border: `1px solid ${currentTheme.border}`,
    borderRadius: '8px',
    padding: '8px 10px',
    color: currentTheme.text,
    fontSize: '13px',
    outline: 'none',
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
      background: currentTheme.bg,
      color: currentTheme.text,
      transition: 'background 0.3s, color 0.3s',
    }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '4px' }}>Image Generator</h1>
          <p style={{ color: currentTheme.muted, fontSize: '13px' }}>Powered by Pollinations.ai</p>
        </div>

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowThemes(!showThemes)}
            style={{
              background: currentTheme.card,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '10px',
              padding: '8px 14px',
              color: currentTheme.text,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Tema ▾
          </button>

          {showThemes && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '110%',
              background: currentTheme.card,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '12px',
              padding: '8px',
              zIndex: 50,
              minWidth: '140px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            }}>
              {THEMES.map(t => (
                <button
                  key={t.id}
                  onClick={() => { setTheme(t.id); setShowThemes(false); }}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: theme === t.id ? t.accent : 'transparent',
                    color: theme === t.id ? '#000' : currentTheme.text,
                    fontSize: '13px',
                    cursor: 'pointer',
                    marginBottom: '2px',
                  }}
                >
                  {t.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <div style={{
        background: currentTheme.card,
        borderRadius: '16px',
        padding: '20px',
        border: `1px solid ${currentTheme.border}`,
      }}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe lo que quieres generar..."
          rows={3}
          style={{
            width: '100%',
            background: currentTheme.bg,
            border: `1px solid ${currentTheme.border}`,
            borderRadius: '12px',
            padding: '14px',
            color: currentTheme.text,
            fontSize: '15px',
            outline: 'none',
            marginBottom: '16px',
            resize: 'none',
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px',
          marginBottom: '16px',
        }}>
          <div>
            <label style={{ fontSize: '12px', color: currentTheme.muted, display: 'block', marginBottom: '4px' }}>Modelo</label>
            <select value={model} onChange={(e) => setModel(e.target.value)} style={selectStyle}>
              {MODELS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', color: currentTheme.muted, display: 'block', marginBottom: '4px' }}>Calidad</label>
            <select value={quality} onChange={(e) => setQuality(e.target.value)} style={selectStyle}>
              {QUALITIES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', color: currentTheme.muted, display: 'block', marginBottom: '4px' }}>Cantidad</label>
            <select value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} style={selectStyle}>
              {QUANTITIES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', color: currentTheme.muted, display: 'block', marginBottom: '4px' }}>Tipo de pareja</label>
            <select value={coupleType} onChange={(e) => setCoupleType(e.target.value)} style={selectStyle}>
              {COUPLE_TYPES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', color: currentTheme.muted, display: 'block', marginBottom: '4px' }}>Estilo</label>
            <select value={style} onChange={(e) => setStyle(e.target.value)} style={selectStyle}>
              {STYLES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', color: currentTheme.muted, display: 'block', marginBottom: '4px' }}>Lugar</label>
            <select value={location} onChange={(e) => setLocation(e.target.value)} style={selectStyle}>
              {LOCATIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', color: currentTheme.muted, display: 'block', marginBottom: '4px' }}>Posición</label>
            <select value={position} onChange={(e) => setPosition(e.target.value)} style={selectStyle}>
              {POSITIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', color: currentTheme.muted, display: 'block', marginBottom: '4px' }}>Ángulo</label>
            <select value={angle} onChange={(e) => setAngle(e.target.value)} style={selectStyle}>
              {ANGLES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', color: currentTheme.muted, display: 'block', marginBottom: '4px' }}>Formato</label>
            <select value={aspect} onChange={(e) => setAspect(e.target.value)} style={selectStyle}>
              {ASPECTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={generate}
            disabled={loading}
            style={{
              background: loading ? currentTheme.border : currentTheme.accent,
              color: '#000',
              padding: '11px 26px',
              borderRadius: '999px',
              fontWeight: 600,
              fontSize: '14px',
              opacity: loading ? 0.6 : 1,
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
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
          height: '340px',
          background: currentTheme.card,
          borderRadius: '16px',
          border: `1px solid ${currentTheme.border}`,
        }}>
          <div style={{ textAlign: 'center', color: currentTheme.muted }}>
            <div style={{
              width: '36px',
              height: '36px',
              border: `3px solid ${currentTheme.border}`,
              borderTopColor: currentTheme.accent,
              borderRadius: '50%',
              animation: 'spin 0.9s linear infinite',
              margin: '0 auto 14px',
            }} />
            Generando {quantity > 1 ? `${quantity} imágenes` : 'imagen'}...
          </div>
        </div>
      )}

      {images.length > 0 && !loading && (
        <div style={{
          background: currentTheme.card,
          borderRadius: '16px',
          padding: '16px',
          border: `1px solid ${currentTheme.border}`,
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: images.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px',
          }}>
            {images.map((img, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <img
                  src={img}
                  alt={`Generated ${i + 1}`}
                  style={{
                    maxWidth: '100%',
                    borderRadius: '12px',
                    display: 'block',
                    margin: '0 auto',
                  }}
                />
                <button
                  onClick={() => downloadImage(img, `image-${Date.now()}-${i}.jpg`)}
                  style={{
                    marginTop: '10px',
                    background: 'transparent',
                    color: currentTheme.muted,
                    fontSize: '13px',
                    padding: '6px 14px',
                    border: `1px solid ${currentTheme.border}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  Descargar
                </button>
              </div>
            ))}
          </div>
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
            <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Galería ({gallery.length})</h2>
            <button
              onClick={clearGallery}
              style={{
                background: 'transparent',
                color: currentTheme.muted,
                fontSize: '12px',
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '6px',
                padding: '4px 10px',
                cursor: 'pointer',
              }}
            >
              Borrar todo
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '12px',
          }}>
            {gallery.map(item => (
              <div
                key={item.id}
                style={{
                  background: currentTheme.card,
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: `1px solid ${currentTheme.border}`,
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
                  onClick={() => setImages([item.image])}
                  title={item.prompt}
                />
                <div style={{ padding: '8px', display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => downloadImage(item.image, `image-${item.id}.jpg`)}
                    style={{
                      flex: 1,
                      background: currentTheme.bg,
                      color: currentTheme.muted,
                      fontSize: '11px',
                      padding: '5px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
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
                      cursor: 'pointer',
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
