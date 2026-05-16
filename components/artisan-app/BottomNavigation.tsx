'use client';

import { Home, Plus, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage, translations } from '@/app/context/LanguageContext';

export function BottomNavigation() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const t = translations[language];

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { path: '/dashboard', icon: Home, label: t.dashboard },
    { path: '/create', icon: Plus, label: t.createPost },
    { path: '/inbox', icon: MessageSquare, label: t.inbox },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-card">
      <div className="flex items-center justify-around h-20 max-w-2xl mx-auto">
        {navItems.map(({ path, icon: Icon, label }) => (
          <Link
            key={path}
            href={path}
            className={`flex flex-col items-center justify-center w-20 h-20 transition-colors ${
              isActive(path)
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            aria-label={label}
          >
            <Icon size={24} />
            <span className="text-xs mt-1 text-center">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
