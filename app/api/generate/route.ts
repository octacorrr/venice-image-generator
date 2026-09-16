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
      model: model,
      width: String(Math.min(Number(width) || 1024, 1024)),
      height: String(Math.min(Number(height) || 1024, 1024)),
      nologo: 'true',
      private: 'true',
      enhance: 'true',
      key: apiKey,
    });

    const imageUrl = `https://gen.pollinations.ai/image/${encodedPrompt}?${params.toString()}`;

    return NextResponse.json({ image: imageUrl });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || 'Error interno' },
      { status: 500 }
    );
  }
}