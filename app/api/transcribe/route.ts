import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File | null;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Forward the audio to Groq Whisper
    const groqForm = new FormData();
    groqForm.append('file', audioFile, audioFile.name || 'audio.webm');
    groqForm.append('model', 'whisper-large-v3');
    groqForm.append('response_format', 'json');

    const groqRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: groqForm,
    });

    if (!groqRes.ok) {
      const err = await groqRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: err?.error?.message ?? `Groq Whisper error ${groqRes.status}` },
        { status: groqRes.status }
      );
    }

    const data = await groqRes.json();
    return NextResponse.json({ transcript: data.text ?? '' });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Transcription failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
