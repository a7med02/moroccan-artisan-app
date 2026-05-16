// app/api/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPTS: Record<string, string> = {
  darija: `أنت خبير في التسويق الرقمي للصناع التقليديين المغاربة. تكتب بالدارجة المغربية.
اكتب منشور جذاب يتضمن عنوان مميز مع إيموجيات، وصف المنتوج، مميزاته، دعوة للتواصل، وهاشتاغات.`,
  arabic: `أنت خبير في التسويق الرقمي للحرفيين المغاربة. تكتب بالعربية الفصحى البسيطة.
اكتب منشوراً جذاباً يتضمن عنوان مميز، وصف المنتج، المميزات، دعوة للتواصل، وهاشتاغات.`,
  french: `Tu es un expert en marketing digital pour les artisans marocains. Tu écris en français.
Crée une publication engageante avec: titre accrocheur, description du produit, points forts, appel à l'action, hashtags.`,
  english: `You are a social media marketing expert for Moroccan artisans. Write in English.
Create an engaging post with: catchy headline, product description, key selling points, call to action, hashtags.`,
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { productName, description, language, platforms, imageBase64, imageType } = body;

  if (!productName) {
    return NextResponse.json({ error: 'productName is required' }, { status: 400 });
  }

  const systemPrompt = SYSTEM_PROMPTS[language] ?? SYSTEM_PROMPTS.english;
  const platformList = Array.isArray(platforms) ? platforms.join(', ') : '';

  let userText = `Product name: ${productName}\n`;
  if (description) userText += `Details: ${description}\n`;
  if (platformList) userText += `Target platforms: ${platformList}\n`;
  userText += imageBase64
    ? `\nAnalyze the product photo and write a compelling post.`
    : `\nNo image — write a compelling post based on the product name and details.`;

  // Build message content — Grok supports vision too
  type ContentBlock =
    | { type: 'text'; text: string }
    | { type: 'image_url'; image_url: { url: string } };

  const content: ContentBlock[] = [];

  if (imageBase64 && imageType?.startsWith('image/')) {
    content.push({
      type: 'image_url',
      image_url: { url: `data:${imageType};base64,${imageBase64}` },
    });
  }
  content.push({ type: 'text', text: userText });

  const grokRes = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'grok-3-latest',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: 'user', content }],
    }),
  });

  if (!grokRes.ok) {
    const err = await grokRes.json().catch(() => ({}));
    return NextResponse.json(
      { error: err?.error?.message ?? `xAI error ${grokRes.status}` },
      { status: grokRes.status }
    );
  }

  const data = await grokRes.json();
  const text = data.choices?.[0]?.message?.content ?? '';

  return NextResponse.json({ post: text });
}