import React, { createContext, useState, useContext } from 'react';

// Import language files
import en from '../translations/en.json';
import si from '../translations/si.json';
import ta from '../translations/ta.json';

// Create language context
const LanguageContext = createContext();

// Language options
const languages = [
  { code: 'en', name: 'English' },
  { code: 'si', name: 'සිංහල' },  // Sinhala
  { code: 'ta', name: 'தமிழ்' }   // Tamil
];

// Translations object
const translations = {
  en,
  si,
  ta
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en'); // Default language is English

  // Function to change language
  const changeLanguage = (code) => {
    setLanguage(code);
  };

  // Get translation for a key
  const t = (key) => {
    const keys = key.split('.');
    let translation = translations[language];
    
    for (const k of keys) {
      if (translation && translation[k]) {
        translation = translation[k];
      } else {
        // Fallback to English if translation not found
        let fallback = translations['en'];
        for (const fk of keys) {
          if (fallback && fallback[fk]) {
            fallback = fallback[fk];
          } else {
            return key; // Return the key if no translation found
          }
        }
        return fallback;
      }
    }
    
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, languages }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = () => useContext(LanguageContext);