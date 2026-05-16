import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { caption } = body;

    if (!caption) {
      return NextResponse.json({ error: 'Missing caption content' }, { status: 400 });
    }

    // 💡 HACKATHON SHORTCUT: A stunning, public Moroccan artisan placeholder image link.
    // Buffer demands a live public web link to post successfully to Instagram.
    const publicDemoImageUrl = "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?q=80&w=1000&auto=format&fit=crop";

    const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL;

    if (!MAKE_WEBHOOK_URL) {
      return NextResponse.json({ error: 'Missing MAKE_WEBHOOK_URL environment variable' }, { status: 500 });
    }

    // Send clean JSON instead of multipart form data. This makes Make configuration 10x easier!
    const response = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        caption: caption,
        imageUrl: publicDemoImageUrl
      }),
    });

    if (!response.ok) {
      throw new Error(`Make.com connection error: ${response.status}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Publish error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}