import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const languages = [
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleLanguage = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('i18nextLng', code);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-2.5 sm:py-3.5 rounded-2xl transition-all duration-300 font-bold text-sm sm:text-base cursor-pointer border-2",
          isOpen 
            ? "bg-white border-secondary text-secondary shadow-xl shadow-secondary/10" 
            : "bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100 hover:border-slate-200"
        )}
      >
        <Globe size={20} className={cn("transition-transform duration-500", isOpen && "rotate-180")} />
        <span className="hidden md:inline">{currentLang.label}</span>
        <span className="md:hidden">{currentLang.flag}</span>
        <ChevronDown size={16} className={cn("transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-48 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-fade-in origin-top-right ring-1 ring-slate-100">
          <div className="p-2 space-y-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => toggleLanguage(lang.code)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-sm font-bold group cursor-pointer",
                  i18n.language === lang.code 
                    ? "bg-secondary/10 text-secondary" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-primary"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg group-hover:scale-125 transition-transform">{lang.flag}</span>
                  <span>{lang.label}</span>
                </div>
                {i18n.language === lang.code && <Check size={16} className="text-secondary" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
