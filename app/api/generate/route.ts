import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPTS: Record<string, string> = {
  darija: `أنت خبير في التسويق الرقمي للصناع التقليديين المغاربة. تكتب بالدارجة المغربية.
حلل الصورة وأنشئ منشور جذاب يتضمن:
- عنوان مميز مع إيموجيات مناسبة
- وصف المنتوج من الصورة بأسلوب بيعي جذاب
- مميزات المنتوج (الجودة، الصنع اليدوي، المواد)
- دعوة واضحة للتواصل أو الشراء
- هاشتاغات بالدارجة والعربية والإنجليزية
اكتب بأسلوب طبيعي وودي كأنك الحرفي نفسه.`,

  arabic: `أنت خبير في التسويق الرقمي للحرفيين المغاربة. تكتب بالعربية الفصحى البسيطة.
حلل الصورة وأنشئ منشوراً جذاباً يتضمن عنوان مميز، وصف المنتج، المميزات، دعوة للتواصل، وهاشتاغات.`,

  french: `Tu es un expert en marketing digital pour les artisans marocains. Tu écris en français.
Analyse la photo et crée une publication engageante: titre accrocheur, description, points forts, appel à l'action, hashtags.`,

  english: `You are a social media marketing expert for Moroccan artisans. Write in English.
Analyze the photo and create an engaging post: catchy headline with emojis, product description, key selling points, call to action, relevant hashtags.`,
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { language, platforms, imageBase64, imageType } = body;

  const systemPrompt = SYSTEM_PROMPTS[language] ?? SYSTEM_PROMPTS.english;
  const platformList = (platforms as string[]).join(', ');

  const textPrompt = imageBase64
    ? `Analyze this product photo and write a compelling social media post for: ${platformList}.`
    : `No image provided. Write a general Moroccan artisan product post for: ${platformList}.`;

  const parts: object[] = [];

  if (imageBase64 && imageType?.startsWith('image/')) {
    parts.push({ inlineData: { mimeType: imageType, data: imageBase64 } });
  }
  parts.push({ text: `${systemPrompt}\n\n${textPrompt}` });

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts }] }),
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
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  return NextResponse.json({ post: text });
}