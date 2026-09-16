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

    const apiKey = process.env.POLLINATIONS_API_KEY;

    // Boosters de calidad
    const qualityBoost = ", highly detailed, sharp focus, realistic skin, perfect anatomy, photorealistic, 8k";
    const fullPrompt = prompt.trim() + qualityBoost;

    const encodedPrompt = encodeURIComponent(fullPrompt);

    let imageUrl: string;

    if (apiKey) {
      // Con API key → endpoint mejor (gen.pollinations.ai)
      const params = new URLSearchParams({
        width: String(Math.min(width, 1024)),
        height: String(Math.min(height, 1024)),
        model: 'flux',
        nologo: 'true',
        private: 'true',
        enhance: 'true',
        key: apiKey,
      });
      imageUrl = `https://gen.pollinations.ai/image/${encodedPrompt}?${params.toString()}`;
    } else {
      // Sin API key → endpoint público
      const params = new URLSearchParams({
        width: String(Math.min(width, 1024)),
        height: String(Math.min(height, 1024)),
        model: 'flux',
        nologo: 'true',
        private: 'true',
        enhance: 'true',
      });
      imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?${params.toString()}`;
    }

    return NextResponse.json({ image: imageUrl });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || 'Error interno' },
      { status: 500 }
    );
  }
}