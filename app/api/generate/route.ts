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

    // Construimos la URL de Pollinations (sin API key)
    const encodedPrompt = encodeURIComponent(prompt);
    const params = new URLSearchParams({
      width: String(width),
      height: String(height),
      model: 'flux',
      nologo: 'true',
      private: 'true',
      enhance: 'false',
    });

    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?${params.toString()}`;

    // Devolvemos la URL directamente (funciona como src de <img>)
    return NextResponse.json({ image: imageUrl });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || 'Error interno' },
      { status: 500 }
    );
  }
}