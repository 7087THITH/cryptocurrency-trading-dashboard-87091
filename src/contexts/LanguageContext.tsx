import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type Language = 'en' | 'jp' | 'th';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (text: string) => Promise<string>;
  translations: Record<string, string>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [translations, setTranslations] = useState<Record<string, string>>({});

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang && ['en', 'jp', 'th'].includes(savedLang)) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    setTranslations({});
  };

  const t = async (text: string): Promise<string> => {
    if (language === 'en') return text;
    
    const cacheKey = `${language}-${text}`;
    if (translations[cacheKey]) {
      return translations[cacheKey];
    }

    try {
      const { data, error } = await supabase.functions.invoke('translate-text', {
        body: { text, targetLang: language }
      });

      if (error) throw error;
      
      const translated = data.translatedText;
      setTranslations(prev => ({ ...prev, [cacheKey]: translated }));
      return translated;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translations }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
