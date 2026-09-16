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

    // Boosters fuertes de calidad + anatomía
    const qualityBoost = ", ultra detailed, sharp focus, intricate details, realistic skin texture, detailed genitals, perfect anatomy, high resolution, 8k uhd, masterpiece, best quality, photorealistic, professional photography, cinematic lighting";
    
    // Negative más agresivo
    const negative = "blurry, low quality, deformed, bad anatomy, extra limbs, missing limbs, fused fingers, too many fingers, mutated hands, poorly drawn hands, poorly drawn face, mutation, ugly, tiling, out of frame, extra arms, extra legs, disfigured, gross proportions, malformed limbs, missing arms, missing legs, floating limbs, disconnected limbs, watermark, text, logo, soft focus, oversaturated";

    const fullPrompt = `${prompt}${qualityBoost}. Negative prompt: ${negative}`;

    const encodedPrompt = encodeURIComponent(fullPrompt);
    const params = new URLSearchParams({
      width: String(width),
      height: String(height),
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