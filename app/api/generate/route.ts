import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      prompt,
      width = 1024,
      height = 1024,
      model = 'flux',
      quantity = 1,
      quality = 'high',
    } = body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json({ error: 'Prompt requerido' }, { status: 400 });
    }

    const apiKey = process.env.POLLINATIONS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Falta POLLINATIONS_API_KEY en las variables de entorno de Vercel' },
        { status: 500 }
      );
    }

    const count = Math.min(Math.max(Number(quantity) || 1, 1), 5);
    const encodedPrompt = encodeURIComponent(prompt.trim());
    const images: string[] = [];

    for (let i = 0; i < count; i++) {
      const seed = Math.floor(Math.random() * 999999999);

      const params = new URLSearchParams({
        model: String(model),
        width: String(Math.min(Number(width) || 1024, 1024)),
        height: String(Math.min(Number(height) || 1024, 1024)),
        nologo: 'true',
        private: 'true',
        enhance: 'true',
        seed: String(seed),
      });

      // quality solo en modelos que lo soportan
      if (quality && quality !== 'default') {
        params.set('quality', String(quality));
      }

      const imageUrl = `https://gen.pollinations.ai/image/${encodedPrompt}?${params.toString()}`;

      const response = await fetch(imageUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.error('Pollinations error:', response.status, errorText);
        // Si falla una, seguimos con las demás si hay más
        if (count === 1) {
          return NextResponse.json(
            { error: `Error de Pollinations (${response.status}): ${errorText.slice(0, 200) || response.statusText}` },
            { status: 500 }
          );
        }
        continue;
      }

      const arrayBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      images.push(`data:${contentType};base64,${base64}`);
    }

    if (images.length === 0) {
      return NextResponse.json({ error: 'No se pudo generar ninguna imagen' }, { status: 500 });
    }

    // Compatibilidad: si es 1 imagen devolvemos "image", si son varias "images"
    if (images.length === 1) {
      return NextResponse.json({ image: images[0], images });
    }
    return NextResponse.json({ images, image: images[0] });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || 'Error interno' },
      { status: 500 }
    );
  }
}