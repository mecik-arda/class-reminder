import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';

import en from './en.json';
import tr from './tr.json';
import { DEFAULT_PREFERENCES } from '../utils/constants';

const resources = {
  en: { translation: en },
  tr: { translation: tr },
};

// Fallback to default preference, check device locale if possible
const getDeviceLanguage = () => {
  try {
    const locales = getLocales();
    if (locales && locales.length > 0) {
      const languageCode = locales[0].languageCode;
      if (languageCode === 'tr' || languageCode === 'en') {
        return languageCode;
      }
    }
  } catch (error) {
    console.warn('Could not determine device language');
  }
  return DEFAULT_PREFERENCES.LANGUAGE;
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getDeviceLanguage(), // initial language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    compatibilityJSON: 'v4', // Required for React Native
  });

export default i18n;
