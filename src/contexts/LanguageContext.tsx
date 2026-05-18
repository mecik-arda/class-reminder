import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { LanguageCode } from '../types';
import { STORAGE_KEYS, DEFAULT_PREFERENCES } from '../utils/constants';
import '../i18n'; // Ensure i18n is initialized

interface LanguageContextType {
  language: LanguageCode;
  changeLanguage: (lang: LanguageCode) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType>({
  language: DEFAULT_PREFERENCES.LANGUAGE,
  changeLanguage: async () => {},
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [language, setLanguageState] = useState<LanguageCode>(DEFAULT_PREFERENCES.LANGUAGE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadLanguagePreference();
  }, []);

  const loadLanguagePreference = async () => {
    try {
      const storedLang = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
      if (storedLang && (storedLang === 'tr' || storedLang === 'en')) {
        setLanguageState(storedLang as LanguageCode);
        i18n.changeLanguage(storedLang);
      } else {
        // If not stored, use the one detected by i18n initialization
        const currentLang = i18n.language as LanguageCode;
        if (currentLang === 'tr' || currentLang === 'en') {
          setLanguageState(currentLang);
          await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, currentLang);
        }
      }
    } catch (error) {
      console.error('Failed to load language preference:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const changeLanguage = async (lang: LanguageCode) => {
    try {
      setLanguageState(lang);
      i18n.changeLanguage(lang);
      await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
    } catch (error) {
      console.error('Failed to save language preference:', error);
    }
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
