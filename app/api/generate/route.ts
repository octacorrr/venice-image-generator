import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      prompt,
      negative_prompt = 'blurry, low quality, deformed, bad anatomy, extra limbs, watermark, text',
      width = 1024,
      height = 1024,
    } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt requerido' }, { status: 400 });
    }

    const apiKey = process.env.VENICE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Falta VENICE_API_KEY en las variables de entorno' },
        { status: 500 }
      );
    }

    const response = await fetch('https://api.venice.ai/api/v1/image/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'lustify-v8',
        prompt: prompt,
        negative_prompt: negative_prompt,
        width: Number(width) || 1024,
        height: Number(height) || 1024,
        format: 'webp',
        safe_mode: false,
        steps: 25,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Venice error:', data);
      return NextResponse.json(
        { error: data.message || data.error || 'Error de Venice API' },
        { status: response.status }
      );
    }

    const base64 = data.images?.[0];

    if (!base64) {
      return NextResponse.json({ error: 'No se recibió imagen' }, { status: 500 });
    }

    const imageUrl = `data:image/webp;base64,${base64}`;

    return NextResponse.json({ image: imageUrl });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || 'Error interno' },
      { status: 500 }
    );
  }
}