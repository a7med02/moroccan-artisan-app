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
  const { productName, description, language, platforms } = body;

  if (!productName) {
    return NextResponse.json({ error: 'productName is required' }, { status: 400 });
  }

  const systemPrompt = SYSTEM_PROMPTS[language] ?? SYSTEM_PROMPTS.english;
  const platformList = (platforms as string[]).join(', ');

  let userText = `Product name: ${productName}\n`;
  if (description) userText += `Details: ${description}\n`;
  userText += `Target platforms: ${platformList}\n`;
  userText += `\nWrite a compelling social media post for this Moroccan artisan product.`;

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'http://localhost:3000',
    },
    body: JSON.stringify({
      model: 'qwen/qwen3-next-80b-a3b-instruct:free',
      max_tokens: 1000,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userText },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return NextResponse.json(
      { error: err?.error?.message ?? `OpenRouter error ${res.status}` },
      { status: res.status }
    );
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content ?? '';

  return NextResponse.json({ post: text });
}