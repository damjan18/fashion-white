import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '@data/translations';
import { getFromStorage, saveToStorage } from '@utils/helpers';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return getFromStorage('language', 'sr');
  });

  useEffect(() => {
    saveToStorage('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations['sr']?.[key] || key;
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'sr' ? 'en' : 'sr');
  };

  const value = {
    language,
    setLanguage,
    toggleLanguage,
    t,
    translations: translations[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
