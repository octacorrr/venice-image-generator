# Venice Image Generator (estilo Grok)

Generador de imágenes AI usando Venice.ai con soporte NSFW.

## Cómo usarlo

1. Clona el repo
2. Instala dependencias:
```bash
npm install
```

3. Crea un archivo `.env.local` y pon tu clave:
```
VENICE_API_KEY=tu_clave_de_venice
```

4. Ejecuta en local:
```bash
npm run dev
```

5. Para desplegar en Vercel:
   - Sube el repo a Vercel
   - En Project Settings → Environment Variables agrega `VENICE_API_KEY`
   - Deploy

## Modelo usado
- `lustify-v8` (uncensored / bueno para NSFW)
- `safe_mode: false`

Cambia el modelo en `app/api/generate/route.ts` si quieres otro.
