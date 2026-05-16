import { LanguageProvider } from '@/app/context/LanguageContext';
import { InboxContent } from '@/components/artisan-app/InboxContent';
import { BottomNavigation } from '@/components/artisan-app/BottomNavigation';
import { LanguageSelector } from '@/components/artisan-app/LanguageSelector';

export default function InboxPage() {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center p-4 border-b border-border">
            <h1 className="text-lg font-bold text-foreground">Rural Ai</h1>
            <LanguageSelector />
          </div>
          <InboxContent />
        </div>
        <BottomNavigation />
      </div>
    </LanguageProvider>
  );
}
