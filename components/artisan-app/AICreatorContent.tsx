'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage, translations } from '@/app/context/LanguageContext';
import { Upload, ChevronRight, Loader, Play, Copy, RefreshCw, Check, Send, AlertCircle } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Platform = 'instagram' | 'facebook' | 'tiktok' | 'whatsapp';

interface FormData {
  media: File | null;
  mediaPreview: string | null;
  mediaBase64: string | null;
  mediaType: string | null;
  productName: string;
  description: string;
}

interface GeneratedResult {
  post: string;
}

// ─── System prompts per language ──────────────────────────────────────────────

const SYSTEM_PROMPTS: Record<string, string> = {
  darija: `أنت خبير في التسويق الرقمي للصناع التقليديين المغاربة. تكتب بالدارجة المغربية (العربية العامية المغربية).
عند تحليل الصورة وإنشاء المنشور:
1. لاحظ المنتوج في الصورة (الشكل، الألوان، المواد، الحرفية)
2. اكتب منشور جذاب يتضمن:
   - عنوان مميز مع إيموجيات مناسبة
   - وصف المنتوج من الصورة بأسلوب بيعي جذاب
   - مميزات المنتوج (الجودة، الصنع اليدوي، المواد)
   - دعوة واضحة للتواصل أو الشراء
   - هاشتاغات بالدارجة والعربية والإنجليزية
اكتب بأسلوب طبيعي وودي كأنك الحرفي نفسه يتكلم مع زبائنه.`,

  arabic: `أنت خبير في التسويق الرقمي للحرفيين المغاربة. تكتب بالعربية الفصحى البسيطة والواضحة.
عند تحليل الصورة وإنشاء المنشور:
1. لاحظ المنتج في الصورة (الشكل، الألوان، المواد، الحرفية)
2. اكتب منشوراً جذاباً يتضمن:
   - عنوان مميز مع إيموجيات
   - وصف المنتج بأسلوب تسويقي احترافي
   - المميزات الرئيسية (الجودة، الصنع اليدوي، التراث المغربي)
   - دعوة واضحة للتواصل
   - هاشتاغات عربية وإنجليزية
اكتب بأسلوب احترافي وودي في نفس الوقت.`,

  french: `Tu es un expert en marketing digital pour les artisans marocains. Tu écris en français.
Quand tu analyses l'image et crées la publication:
1. Observe le produit sur la photo (forme, couleurs, matériaux, savoir-faire)
2. Rédige une publication engageante incluant:
   - Un titre accrocheur avec des emojis
   - Description du produit basée sur la photo
   - Points forts (qualité, fait main, héritage marocain)
   - Appel à l'action clair
   - Hashtags en français, arabe et anglais
Ton naturel, chaleureux, authentique — comme l'artisan qui parle à ses clients.`,

  english: `You are a social media marketing expert for Moroccan artisans. You write in English.
When analyzing the image and creating the post:
1. Observe the product in the photo (shape, colors, materials, craftsmanship)
2. Write an engaging post including:
   - Eye-catching headline with emojis
   - Product description based on the photo
   - Key selling points (quality, handmade, Moroccan heritage)
   - Clear call to action
   - Relevant hashtags in English and Arabic
Friendly, authentic tone — like the artisan talking directly to their customers.`,
};

const PLATFORM_LABELS: Record<Platform, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  whatsapp: 'WhatsApp',
};

// ─── Main Component ───────────────────────────────────────────────────────────

export function AICreatorContent() {
  const { language } = useLanguage();
  const t = translations[language];

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<Platform>>(new Set(['instagram']));

  const [formData, setFormData] = useState<FormData>({
    media: null,
    mediaPreview: null,
    mediaBase64: null,
    mediaType: null,
    productName: '',
    description: '',
  });
  const [generatedResult, setGeneratedResult] = useState<GeneratedResult | null>(null);

  // ── File upload ─────────────────────────────────────────────────────────────

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      setFormData(prev => ({
        ...prev,
        media: file,
        mediaPreview: dataUrl,
        mediaBase64: base64,
        mediaType: file.type,
      }));
    };
    reader.readAsDataURL(file);
  };

  // ── Platform toggle ─────────────────────────────────────────────────────────

  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms(prev => {
      const next = new Set(prev);
      if (next.has(platform)) {
        if (next.size === 1) return prev; // keep at least one
        next.delete(platform);
      } else {
        next.add(platform);
      }
      return next;
    });
  };

  // ── AI Generation ───────────────────────────────────────────────────────────

const callGeminiAPI = async (): Promise<string> => {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productName: formData.productName,
      description: formData.description,
      language,
      platforms: Array.from(selectedPlatforms),
      imageBase64: formData.mediaBase64,   // sent if user uploaded a photo
      imageType: formData.mediaType,
    }),
  });

  const data = await response.json();

  if (!response.ok) throw new Error(data.error ?? 'Generation failed');

  return data.post as string;
};

const handleGenerate = async () => {
  if (!formData.productName.trim()) return;
  setIsLoading(true);
  setError(null);
  setGeneratedResult(null);
  setStep(3);

  try {
    const post = await callGeminiAPI();
    setGeneratedResult({ post });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Something went wrong.';
    setError(message);
  } finally {
    setIsLoading(false);
  }
};

const handleRegenerate = async () => {
  setGeneratedResult(null);
  setError(null);
  await handleGenerate();
};

  const handleCopy = async () => {
    if (!generatedResult?.post) return;
    try {
      await navigator.clipboard.writeText(generatedResult.post);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select text manually
    }
  };

  const handleWhatsAppShare = () => {
    if (!generatedResult?.post) return;
    const encoded = encodeURIComponent(generatedResult.post);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background pb-24 px-4 pt-4">
      <h1 className="text-3xl font-bold text-foreground mb-6">{t.createNewPost}</h1>

      {/* Step progress bar */}
      <div className="flex gap-2 mb-6">
        {[1, 2, 3].map(n => (
          <div
            key={n}
            className={`flex-1 h-2 rounded-full transition-colors ${n <= step ? 'bg-primary' : 'bg-muted'}`}
          />
        ))}
      </div>

      {/* ── Step 1: Upload ── */}
      {step === 1 && (
        <Card className="border-0 bg-card p-6 mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">{t.step1}</h2>

          {!formData.mediaPreview ? (
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-8 cursor-pointer hover:border-primary transition-colors">
              <Upload className="text-muted-foreground mb-2" size={40} />
              <span className="text-foreground font-medium">{t.uploadMedia}</span>
              <span className="text-sm text-muted-foreground mt-1">{t.imageVideo}</span>
              <input type="file" accept="image/*,video/*" onChange={handleMediaUpload} className="hidden" />
            </label>
          ) : (
            <div className="mb-4">
              {formData.mediaType?.startsWith('image/') ? (
                <img src={formData.mediaPreview} alt="Preview" className="w-full h-64 object-cover rounded-lg mb-4" />
              ) : (
                <div className="relative w-full h-64 bg-muted rounded-lg flex items-center justify-center mb-4">
                  <Play className="text-primary" size={48} />
                  <span className="absolute bottom-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs">
                    {t.imageVideo}
                  </span>
                </div>
              )}
              <label className="flex items-center justify-center border-2 border-dashed border-border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors">
                <span className="text-sm text-muted-foreground">{t.uploadMedia}</span>
                <input type="file" accept="image/*,video/*" onChange={handleMediaUpload} className="hidden" />
              </label>
            </div>
          )}

          {formData.media && (
            <Button
              onClick={() => setStep(2)}
              className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {t.step2} <ChevronRight size={20} />
            </Button>
          )}
        </Card>
      )}

      {/* ── Step 2: Product Details ── */}
      {step === 2 && (
        <Card className="border-0 bg-card p-6 mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">{t.step2}</h2>

          <div className="space-y-4">
            {/* Product name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">{t.productName}</label>
              <input
                type="text"
                placeholder={t.productNamePlaceholder}
                value={formData.productName}
                onChange={e => setFormData(prev => ({ ...prev, productName: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">{t.description}</label>
              <textarea
                placeholder={t.descriptionPlaceholder}
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none h-24"
              />
            </div>

            {/* Platform selector */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Post for</label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(PLATFORM_LABELS) as Platform[]).map(platform => (
                  <button
                    key={platform}
                    onClick={() => togglePlatform(platform)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      selectedPlatforms.has(platform)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background text-foreground border-border hover:border-primary'
                    }`}
                  >
                    {PLATFORM_LABELS[platform]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={() => setStep(1)} variant="outline" className="flex-1">
                {t.back}
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={!formData.productName.trim()}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
              >
                {t.generateWithAI}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* ── Step 3: AI Result ── */}
      {step === 3 && (
        <Card className="border-0 bg-card p-6 mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">{t.step3}</h2>

          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader className="animate-spin text-primary mb-3" size={40} />
              <p className="text-muted-foreground">{t.generating}</p>
            </div>
          )}

          {/* Error */}
          {!isLoading && error && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-destructive/10 text-destructive rounded-lg p-4">
                <AlertCircle size={20} className="mt-0.5 shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => setStep(2)} variant="outline" className="flex-1">{t.back}</Button>
                <Button onClick={handleRegenerate} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                  Retry
                </Button>
              </div>
            </div>
          )}

          {/* Result */}
          {!isLoading && !error && generatedResult && (
            <div className="space-y-4">
              {/* Image preview */}
              {formData.mediaPreview && formData.mediaType?.startsWith('image/') && (
                <img src={formData.mediaPreview} alt="Product" className="w-full h-48 object-cover rounded-lg" />
              )}



              {/* Generated post */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">{t.generatedPost}</p>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-foreground whitespace-pre-wrap text-base leading-relaxed">
                    {generatedResult.post}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1.5"
                >
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>

                <Button
                  onClick={handleRegenerate}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1.5"
                >
                  <RefreshCw size={15} /> Regenerate
                </Button>

                {selectedPlatforms.has('whatsapp') && (
                  <Button
                    onClick={handleWhatsAppShare}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1.5 text-green-600 border-green-200 hover:bg-green-50"
                  >
                    <Send size={15} /> WhatsApp
                  </Button>
                )}
              </div>

              {/* Nav */}
              <div className="flex gap-3 pt-2">
                <Button onClick={() => setStep(2)} variant="outline" className="flex-1">{t.back}</Button>
                <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                  {t.publish}
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}