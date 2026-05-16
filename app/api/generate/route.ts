import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPTS: Record<string, string> = {
  darija: `أنت خبير في التسويق الرقمي للصناع التقليديين المغاربة. تكتب بالدارجة المغربية (العربية العامية المغربية).
عند تحليل الصورة وإنشاء المنشور:
- لاحظ المنتوج في الصورة (الشكل، الألوان، المواد، الحرفية)
- اكتب منشور جذاب يتضمن عنوان مميز مع إيموجيات مناسبة
- وصف المنتوج بأسلوب بيعي جذاب
- مميزات المنتوج (الجودة، الصنع اليدوي، المواد)
- دعوة واضحة للتواصل أو الشراء
- هاشتاغات بالدارجة والعربية والإنجليزية
اكتب بأسلوب طبيعي وودي كأنك الحرفي نفسه يتكلم مع زبائنه.`,

  arabic: `أنت خبير في التسويق الرقمي للحرفيين المغاربة. تكتب بالعربية الفصحى البسيطة والواضحة.
عند تحليل الصورة وإنشاء المنشور:
- لاحظ المنتج في الصورة (الشكل، الألوان، المواد، الحرفية)
- اكتب منشوراً جذاباً يتضمن عنوان مميز مع إيموجيات
- وصف المنتج بأسلوب تسويقي احترافي
- المميزات الرئيسية (الجودة، الصنع اليدوي، التراث المغربي)
- دعوة واضحة للتواصل
- هاشتاغات عربية وإنجليزية`,

  french: `Tu es un expert en marketing digital pour les artisans marocains. Tu écris en français.
Quand tu analyses l'image et crées la publication:
- Observe le produit sur la photo (forme, couleurs, matériaux, savoir-faire)
- Rédige une publication engageante avec un titre accrocheur et des emojis
- Description du produit basée sur la photo
- Points forts (qualité, fait main, héritage marocain)
- Appel à l'action clair
- Hashtags en français, arabe et anglais`,

  english: `You are a social media marketing expert for Moroccan artisans. You write in English.
When analyzing the image and creating the post:
- Observe the product in the photo (shape, colors, materials, craftsmanship)
- Write an engaging post with an eye-catching headline and emojis
- Product description based on the photo
- Key selling points (quality, handmade, Moroccan heritage)
- Clear call to action
- Relevant hashtags in English and Arabic`,
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { productName, description, language, platforms, imageBase64, imageType } = body;

  if (!productName) {
    return NextResponse.json({ error: 'productName is required' }, { status: 400 });
  }

  const systemPrompt = SYSTEM_PROMPTS[language] ?? SYSTEM_PROMPTS.english;
  const platformList = (platforms as string[]).join(', ');

  let textPrompt = `${systemPrompt}\n\n`;
  textPrompt += `Product name: ${productName}\n`;
  if (description) textPrompt += `Details: ${description}\n`;
  textPrompt += `Target platforms: ${platformList}\n`;
  textPrompt += imageBase64
    ? `\nAnalyze the product photo carefully and create a compelling social media post.`
    : `\nNo image provided. Create a compelling post based on the product name and details.`;

  // Build parts — text always included, image optional
  const parts: object[] = [];

  if (imageBase64 && imageType?.startsWith('image/')) {
    parts.push({
      inlineData: {
        mimeType: imageType,
        data: imageBase64,
      },
    });
  }

  parts.push({ text: textPrompt });

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
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
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  return NextResponse.json({ post: text });
}
