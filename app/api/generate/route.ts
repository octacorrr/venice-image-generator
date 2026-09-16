import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      prompt,
      width = 1024,
      height = 1024,
    } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt requerido' }, { status: 400 });
    }

    // Boosters cortos y efectivos (evita que la URL se rompa)
    const qualityBoost = ", highly detailed, sharp focus, realistic skin, perfect anatomy, photorealistic, 8k";

    const fullPrompt = prompt.trim() + qualityBoost;

    const encodedPrompt = encodeURIComponent(fullPrompt);
    const params = new URLSearchParams({
      width: String(Math.min(width, 1024)),
      height: String(Math.min(height, 1024)),
      model: 'flux',
      nologo: 'true',
      private: 'true',
      enhance: 'true',
    });

    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?${params.toString()}`;

    return NextResponse.json({ image: imageUrl });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || 'Error interno' },
      { status: 500 }
    );
  }
}