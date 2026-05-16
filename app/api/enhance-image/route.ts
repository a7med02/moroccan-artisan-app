import { NextRequest, NextResponse } from 'next/server';

// NOTE: Groq does not support image generation.
// This endpoint returns a no-op response so the generate flow still works.
// The frontend will fall back to showing the original image.
export async function POST(_req: NextRequest) {
  return NextResponse.json({ imageBase64: null, mimeType: null });
}
