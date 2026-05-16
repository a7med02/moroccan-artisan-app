'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage, translations } from '@/app/context/LanguageContext';
import { Upload, ChevronRight, Loader, Play, Copy, RefreshCw, Check, Send, AlertCircle, Sparkles } from 'lucide-react';

type Platform = 'instagram' | 'facebook' | 'tiktok' | 'whatsapp';

interface FormData {
  media: File | null;
  mediaPreview: string | null;
  mediaBase64: string | null;
  mediaType: string | null;
}

interface GeneratedResult {
  post: string;
}

const PLATFORM_LABELS: Record<Platform, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  whatsapp: 'WhatsApp',
};




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
  });
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [generatedResult, setGeneratedResult] = useState<GeneratedResult | null>(null);

  // ── File upload ────────────────────────────────────────────────────────────

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setFormData({
        media: file,
        mediaPreview: dataUrl,
        mediaBase64: dataUrl.split(',')[1],
        mediaType: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  // ── Platform toggle ────────────────────────────────────────────────────────

  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms(prev => {
      const next = new Set(prev);
      if (next.has(platform)) {
        if (next.size === 1) return prev;
        next.delete(platform);
      } else {
        next.add(platform);
      }
      return next;
    });
  };
  // -- publich to social media ----
const [isPublishing, setIsPublishing] = useState(false);
const [publishSuccess, setPublishSuccess] = useState(false);

const handlePublishToInstagram = async () => {
  if (!generatedResult?.post) return;
  setIsPublishing(true);

  try {
    const res = await fetch('/api/share-post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        caption: generatedResult.post,
        // Send enhanced if available, otherwise fallback to user original upload
        imageBase64: enhancedImage ? enhancedImage.split(',')[1] : formData.mediaBase64,
        imageType: formData.mediaType
      }),
    });

    if (res.ok) {
      setPublishSuccess(true);
    } else {
      alert('Could not dispatch agents to Make.com');
    }
  } catch (err) {
    console.error(err);
  } finally {
    setIsPublishing(false);
  }
};



  // ── Generate ───────────────────────────────────────────────────────────────

  const callGeminiAPI = async (): Promise<string> => {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language,
        platforms: Array.from(selectedPlatforms),
        imageBase64: formData.mediaBase64,
        imageType: formData.mediaType,
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? 'Generation failed');
    return data.post as string;
  };

const handleGenerate = async () => {
  setIsLoading(true);
  setError(null);
  setGeneratedResult(null);
  setEnhancedImage(null);
  setStep(3);

  try {
    // Run both in parallel
    const promises: [Promise<string>, Promise<string | null>] = [
      // 1. Generate post text
      callGeminiAPI(),
      // 2. Enhance image (only if user uploaded one)
      formData.mediaBase64 && formData.mediaType?.startsWith('image/')
        ? fetch('/api/enhance-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: formData.mediaBase64,
              imageType: formData.mediaType,
            }),
          })
            .then(r => r.json())
            .then(d => d.imageBase64
              ? `data:${d.mimeType};base64,${d.imageBase64}`
              : null
            )
            .catch(() => null) // don't fail the whole flow if enhancement fails
        : Promise.resolve(null),
    ];

    const [post, enhanced] = await Promise.all(promises);
    setGeneratedResult({ post });
    setEnhancedImage(enhanced);
  } catch (err: unknown) {
    setError(err instanceof Error ? err.message : 'Something went wrong.');
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
    await navigator.clipboard.writeText(generatedResult.post);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    if (!generatedResult?.post) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(generatedResult.post)}`, '_blank');
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background pb-24 px-4 pt-4">
      <h1 className="text-3xl font-bold text-foreground mb-6">{t.createNewPost}</h1>

      {/* Progress bar */}
      <div className="flex gap-2 mb-6">
        {[1, 2, 3].map(n => (
          <div key={n} className={`flex-1 h-2 rounded-full transition-colors ${n <= step ? 'bg-primary' : 'bg-muted'}`} />
        ))}
      </div>

      {/* ── Step 1: Upload photo ── */}
      {step === 1 && (
        <Card className="border-0 bg-card p-6 mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-2">{t.step1}</h2>
          <p className="text-sm text-muted-foreground mb-4">
            📸 Just upload your product photo — AI will handle the rest
          </p>

          {!formData.mediaPreview ? (
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-10 cursor-pointer hover:border-primary transition-colors">
              <Upload className="text-muted-foreground mb-3" size={44} />
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
                </div>
              )}
              <label className="flex items-center justify-center border-2 border-dashed border-border rounded-lg p-3 cursor-pointer hover:border-primary transition-colors">
                <span className="text-sm text-muted-foreground">Change photo</span>
                <input type="file" accept="image/*,video/*" onChange={handleMediaUpload} className="hidden" />
              </label>
            </div>
          )}

          {formData.media && (
            <Button onClick={() => setStep(2)} className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">
              Next <ChevronRight size={20} />
            </Button>
          )}
        </Card>
      )}

      {/* ── Step 2: Pick platforms + generate ── */}
      {step === 2 && (
        <Card className="border-0 bg-card p-6 mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-2">Where to post?</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Select your platforms and let Gemini write your post
          </p>

          {/* Photo thumbnail */}
          {formData.mediaPreview && formData.mediaType?.startsWith('image/') && (
            <img src={formData.mediaPreview} alt="Product" className="w-full h-36 object-cover rounded-lg mb-4" />
          )}

          {/* Platform selector */}
          <div className="flex flex-wrap gap-2 mb-6">
            {(Object.keys(PLATFORM_LABELS) as Platform[]).map(platform => (
              <button
                key={platform}
                onClick={() => togglePlatform(platform)}
                className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                  selectedPlatforms.has(platform)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-foreground border-border hover:border-primary'
                }`}
              >
                {PLATFORM_LABELS[platform]}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <Button onClick={() => setStep(1)} variant="outline" className="flex-1">{t.back}</Button>
            <Button
              onClick={handleGenerate}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2"
            >
              <Sparkles size={16} /> {t.generateWithAI}
            </Button>
          </div>
        </Card>
      )}

      {/* ── Step 3: Result ── */}
      {step === 3 && (
        <Card className="border-0 bg-card p-6 mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">{t.step3}</h2>

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader className="animate-spin text-primary mb-3" size={40} />
              <p className="text-muted-foreground">{t.generating}</p>
            </div>
          )}

          {!isLoading && error && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-destructive/10 text-destructive rounded-lg p-4">
                <AlertCircle size={20} className="mt-0.5 shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => setStep(2)} variant="outline" className="flex-1">{t.back}</Button>
                <Button onClick={handleRegenerate} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">Retry</Button>
              </div>
            </div>
          )}

          {!isLoading && !error && generatedResult && (
            <div className="space-y-4">
              {/* Enhanced image (preferred) or original fallback */}
              {(enhancedImage || formData.mediaPreview) && (
                <div className="relative">
                  <img
                    src={enhancedImage ?? formData.mediaPreview!}
                    alt="Product"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  {enhancedImage && (
                    <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                      ✨ AI Enhanced
                    </span>
                  )}
                  {/* Show original toggle if we have both */}
                  {enhancedImage && formData.mediaPreview && (
                    <button
                      onClick={() => setEnhancedImage(prev => prev ? null : enhancedImage)}
                      className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full"
                    >
                      View original
                    </button>
                  )}
                </div>
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

              {/* Actions */}
              <div className="flex gap-2 flex-wrap">
                <Button onClick={handleCopy} variant="outline" size="sm" className="flex items-center gap-1.5">
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
                <Button onClick={handleRegenerate} variant="outline" size="sm" className="flex items-center gap-1.5">
                  <RefreshCw size={15} /> Regenerate
                </Button>
                {selectedPlatforms.has('whatsapp') && (
                  <Button onClick={handleWhatsAppShare} variant="outline" size="sm" className="flex items-center gap-1.5 text-green-600 border-green-200 hover:bg-green-50">
                    <Send size={15} /> WhatsApp
                  </Button>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button onClick={() => setStep(2)} variant="outline" className="flex-1">{t.back}</Button>
                <div className="flex gap-3 pt-2">
                <Button onClick={() => setStep(2)} variant="outline" className="flex-1">{t.back}</Button>
                <Button 
                  onClick={handlePublishToInstagram} 
                  disabled={isPublishing || publishSuccess}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isPublishing ? 'Agents Deploying...' : publishSuccess ? '🚀 Live on Instagram!' : t.publish}
                </Button>
              </div>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}