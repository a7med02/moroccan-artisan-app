import { LanguageProvider } from '@/app/context/LanguageContext';
import { DashboardContent } from '@/components/artisan-app/DashboardContent';
import { BottomNavigation } from '@/components/artisan-app/BottomNavigation';
import { LanguageSelector } from '@/components/artisan-app/LanguageSelector';

export default function DashboardPage() {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center p-4 border-b border-border">
            <h1 className="text-lg font-bold text-foreground">Artisan Hub</h1>
            <LanguageSelector />
          </div>
          <DashboardContent />
        </div>
        <BottomNavigation />
      </div>
    </LanguageProvider>
  );
}
