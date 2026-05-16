import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { imageBase64, imageType } = await req.json();

  if (!imageBase64 || !imageType?.startsWith('image/')) {
    return NextResponse.json({ error: 'No image provided' }, { status: 400 });
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: `Enhance this product photo for social media marketing:
- Improve brightness, contrast, and sharpness
- Clean up the background (make it white or warm neutral)
- Keep the product exactly as-is, do not change it
- Make it look professional, commercial quality
- Square crop (1:1) suitable for Instagram`,
            },
            {
              inlineData: {
                mimeType: imageType,
                data: imageBase64,
              },
            },
          ],
        }],
        generationConfig: {
          responseModalities: ['IMAGE'],
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return NextResponse.json(
      { error: err?.error?.message ?? `Gemini error ${res.status}` },
      { status: res.status }
    );
  }

  const data = await res.json();

  // Find the image part in the response
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  const imagePart = parts.find((p: { inlineData?: { data: string; mimeType: string } }) => p.inlineData);

  if (!imagePart) {
    return NextResponse.json({ error: 'No image returned from Gemini' }, { status: 500 });
  }

  return NextResponse.json({
    imageBase64: imagePart.inlineData.data,
    mimeType: imagePart.inlineData.mimeType,
  });
}