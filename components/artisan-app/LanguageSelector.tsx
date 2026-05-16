'use client';

import { useLanguage, translations } from '@/app/context/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const t = translations[language];

  const languages = [
    { code: 'darija', label: 'دارجة' },
    { code: 'arabic', label: 'العربية' },
    { code: 'french', label: 'Français' },
    { code: 'english', label: 'English' },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="p-2 rounded-lg hover:bg-muted transition-colors flex items-center gap-2"
          aria-label={t.selectLanguage}
        >
          <Globe size={20} />
          <span className="text-sm font-medium capitalize">{language}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map(({ code, label }) => (
          <DropdownMenuItem
            key={code}
            onClick={() => setLanguage(code as any)}
            className={code === language ? 'bg-accent' : ''}
          >
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
