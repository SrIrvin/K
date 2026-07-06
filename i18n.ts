import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationAR from './public/locales/ar/translation.json';
import translationEN from './public/locales/en/translation.json';
import translationES from './public/locales/es/translation.json';
import translationFR from './public/locales/fr/translation.json';
import translationIT from './public/locales/it/translation.json';
import translationNAH from './public/locales/nah/translation.json';
import translationPT from './public/locales/pt/translation.json';
import translationRU from './public/locales/ru/translation.json';
import translationZH from './public/locales/zh/translation.json';

const resources = {
  ar: { translation: translationAR },
  en: { translation: translationEN },
  es: { translation: translationES },
  fr: { translation: translationFR },
  it: { translation: translationIT },
  nah: { translation: translationNAH },
  pt: { translation: translationPT },
  ru: { translation: translationRU },
  zh: { translation: translationZH },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    supportedLngs: ['en', 'es', 'zh', 'fr', 'it', 'pt', 'ru', 'ar', 'nah'],
    nonExplicitSupportedLngs: true,
    load: 'languageOnly',
    debug: true,
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
  });

export default i18n;