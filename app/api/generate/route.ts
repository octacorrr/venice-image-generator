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
      // `enhance` apagado por defecto: con enhance=true Pollinations corre
      // una mejora de prompt con LLM en CADA llamada, así que con cantidad
      // > 1 se pagaba esa llamada N veces por el mismo prompt.
      enhance = false,
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
    const enhancePrompt = enhance === true;
    const startedAt = Date.now();

    // Generación en paralelo: antes era un `for` secuencial y N imágenes
    // tardaban la suma de las N. Con Promise.allSettled tardan lo que tarde
    // la más lenta, y las que fallen no cancelan a las demás.
    const results = await Promise.allSettled(
      Array.from({ length: count }, async () => {
        const seed = Math.floor(Math.random() * 999999999);

        const params = new URLSearchParams({
          model: String(model),
          width: String(Math.min(Number(width) || 1024, 1024)),
          height: String(Math.min(Number(height) || 1024, 1024)),
          nologo: 'true',
          private: 'true',
          seed: String(seed),
        });

        // `enhance` solo si el usuario lo activó explícitamente.
        if (enhancePrompt) {
          params.set('enhance', 'true');
        }

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
          throw new Error(
            `Error de Pollinations (${response.status}): ${errorText.slice(0, 200) || response.statusText}`
          );
        }

        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        const contentType = response.headers.get('content-type') || 'image/jpeg';
        return `data:${contentType};base64,${base64}`;
      })
    );

    const images: string[] = [];
    const errors: string[] = [];
    for (const r of results) {
      if (r.status === 'fulfilled') images.push(r.value);
      else errors.push(r.reason?.message || 'Error desconocido');
    }
    for (const message of errors) {
      console.error('Pollinations error:', message);
    }

    // Registro por generación para medir el gasto real en los logs de Vercel.
    console.log(
      JSON.stringify({
        event: 'generate',
        model: String(model),
        quantity: count,
        generated: images.length,
        failed: errors.length,
        enhance: enhancePrompt,
        quality: quality || 'default',
        promptChars: prompt.trim().length,
        promptTokensApprox: Math.ceil(prompt.trim().length / 4),
        ms: Date.now() - startedAt,
      })
    );

    if (images.length === 0) {
      return NextResponse.json({ error: errors[0] || 'No se pudo generar ninguna imagen' }, { status: 500 });
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