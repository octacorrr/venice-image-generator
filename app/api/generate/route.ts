import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      prompt,
      width = 1024,
      height = 1024,
      model = 'flux',
    } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt requerido' }, { status: 400 });
    }

    const apiKey = process.env.POLLINATIONS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Falta POLLINATIONS_API_KEY en las variables de entorno de Vercel' },
        { status: 500 }
      );
    }

    const qualityBoost = ', highly detailed, sharp focus, realistic skin, photorealistic, 8k';
    const fullPrompt = prompt.trim() + qualityBoost;
    const encodedPrompt = encodeURIComponent(fullPrompt);

    const params = new URLSearchParams({
      model: String(model),
      width: String(Math.min(Number(width) || 1024, 1024)),
      height: String(Math.min(Number(height) || 1024, 1024)),
      nologo: 'true',
      private: 'true',
      enhance: 'true',
    });

    const imageUrl = `https://gen.pollinations.ai/image/${encodedPrompt}?${params.toString()}`;

    // Llamada con Authorization Bearer (como indican las docs)
    const response = await fetch(imageUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('Pollinations error:', response.status, errorText);
      return NextResponse.json(
        { error: `Error de Pollinations (${response.status}): ${errorText.slice(0, 200) || response.statusText}` },
        { status: 500 }
      );
    }

    // Convertimos la imagen a base64 para devolverla al frontend
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const dataUrl = `data:${contentType};base64,${base64}`;

    return NextResponse.json({ image: dataUrl });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || 'Error interno' },
      { status: 500 }
    );
  }
}