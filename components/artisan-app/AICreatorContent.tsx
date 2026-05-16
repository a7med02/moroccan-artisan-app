'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage, translations } from '@/app/context/LanguageContext';
import {
  Upload, ChevronRight, Loader, Play, Copy, RefreshCw, Check,
  Send, AlertCircle, Sparkles, Mic, MicOff, Square,
} from 'lucide-react';

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

// ── Voice recorder hook ─────────────────────────────────────────────────────
type RecordingState = 'idle' | 'recording' | 'transcribing';

function useVoiceRecorder(onTranscript: (text: string) => void) {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    setVoiceError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setRecordingState('transcribing');
        try {
          const form = new FormData();
          form.append('audio', blob, 'recording.webm');
          const res = await fetch('/api/transcribe', { method: 'POST', body: form });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? 'Transcription failed');
          onTranscript(data.transcript);
        } catch (err) {
          setVoiceError(err instanceof Error ? err.message : 'Transcription failed');
        } finally {
          setRecordingState('idle');
        }
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecordingState('recording');
    } catch {
      setVoiceError('Microphone access denied. Please allow mic permissions.');
      setRecordingState('idle');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  return { recordingState, voiceError, startRecording, stopRecording };
}

// ── Main component ──────────────────────────────────────────────────────────
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
  const [voiceTranscript, setVoiceTranscript] = useState('');

  // ── Voice recorder ──────────────────────────────────────────────────────
  const { recordingState, voiceError, startRecording, stopRecording } = useVoiceRecorder(
    (text) => setVoiceTranscript((prev) => (prev ? `${prev} ${text}` : text))
  );

  // ── File upload ─────────────────────────────────────────────────────────
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

  // ── Platform toggle ─────────────────────────────────────────────────────
  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms((prev) => {
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

  // ── Publish ─────────────────────────────────────────────────────────────
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
          imageBase64: enhancedImage ? enhancedImage.split(',')[1] : formData.mediaBase64,
          imageType: formData.mediaType,
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

  // ── Generate ────────────────────────────────────────────────────────────
  const callGroqAPI = async (): Promise<string> => {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language,
        platforms: Array.from(selectedPlatforms),
        imageBase64: formData.mediaBase64,
        imageType: formData.mediaType,
        voiceTranscript: voiceTranscript.trim() || undefined,
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
      const post = await callGroqAPI();
      setGeneratedResult({ post });
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

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background pb-24 px-4 pt-4">
      <h1 className="text-3xl font-bold text-foreground mb-6">{t.createNewPost}</h1>

      {/* Progress bar */}
      <div className="flex gap-2 mb-6">
        {[1, 2, 3].map((n) => (
          <div key={n} className={`flex-1 h-2 rounded-full transition-colors ${n <= step ? 'bg-primary' : 'bg-muted'}`} />
        ))}
      </div>

      {/* ── Step 1: Upload photo + Voice description ── */}
      {step === 1 && (
        <Card className="border-0 bg-card p-6 mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-2">{t.step1}</h2>
          <p className="text-sm text-muted-foreground mb-4">
            📸 Upload your product photo, then optionally describe it by voice
          </p>

          {/* Photo upload */}
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

          {/* ── Voice description section ── */}
          <div className="mt-5 border border-border rounded-xl p-4 bg-muted/30">
            <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              🎙️ Describe your product by voice <span className="text-xs text-muted-foreground font-normal">(optional)</span>
            </p>

            {/* Mic button */}
            <div className="flex items-center gap-3 mb-3">
              {recordingState === 'idle' && (
                <button
                  id="mic-start-btn"
                  onClick={startRecording}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all active:scale-95"
                >
                  <Mic size={16} /> Start Recording
                </button>
              )}
              {recordingState === 'recording' && (
                <button
                  id="mic-stop-btn"
                  onClick={stopRecording}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-all animate-pulse"
                >
                  <Square size={16} /> Stop Recording
                </button>
              )}
              {recordingState === 'transcribing' && (
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader size={16} className="animate-spin" /> Transcribing with Groq Whisper…
                </span>
              )}
              {recordingState === 'recording' && (
                <span className="flex items-center gap-2 text-sm text-destructive font-medium">
                  <MicOff size={14} className="animate-pulse" /> Recording…
                </span>
              )}
            </div>

            {voiceError && (
              <p className="text-xs text-destructive mb-2 flex items-center gap-1">
                <AlertCircle size={12} /> {voiceError}
              </p>
            )}

            {/* Transcript textarea */}
            <textarea
              id="voice-transcript"
              value={voiceTranscript}
              onChange={(e) => setVoiceTranscript(e.target.value)}
              placeholder="Your voice transcript will appear here… or type manually"
              rows={3}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
            {voiceTranscript && (
              <button
                onClick={() => setVoiceTranscript('')}
                className="text-xs text-muted-foreground hover:text-destructive mt-1 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* Next button — available even without image if there is a transcript */}
          {(formData.media || voiceTranscript.trim()) && (
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
            Select your platforms and let Groq AI write your post
          </p>

          {formData.mediaPreview && formData.mediaType?.startsWith('image/') && (
            <img src={formData.mediaPreview} alt="Product" className="w-full h-36 object-cover rounded-lg mb-4" />
          )}

          {/* Voice transcript preview */}
          {voiceTranscript.trim() && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-4">
              <p className="text-xs font-medium text-primary mb-1">🎙️ Voice description included:</p>
              <p className="text-sm text-foreground line-clamp-2">{voiceTranscript}</p>
            </div>
          )}

          {/* Platform selector */}
          <div className="flex flex-wrap gap-2 mb-6">
            {(Object.keys(PLATFORM_LABELS) as Platform[]).map((platform) => (
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
              <p className="text-xs text-muted-foreground mt-1">Powered by Groq · LLaMA-4 Scout</p>
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
              {/* Image */}
              {formData.mediaPreview && (
                <div className="relative">
                  <img
                    src={formData.mediaPreview}
                    alt="Product"
                    className="w-full h-48 object-cover rounded-lg"
                  />
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
                <Button
                  onClick={handlePublishToInstagram}
                  disabled={isPublishing || publishSuccess}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isPublishing ? 'Agents Deploying...' : publishSuccess ? '🚀 Live on Instagram!' : t.publish}
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
