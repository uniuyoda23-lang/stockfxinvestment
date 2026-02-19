import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en.json';
import esTranslations from './locales/es.json';
import frTranslations from './locales/fr.json';
import deTranslations from './locales/de.json';
import zhTranslations from './locales/zh.json';
import ptTranslations from './locales/pt.json';
import itTranslations from './locales/it.json';
import ruTranslations from './locales/ru.json';
import jaTranslations from './locales/ja.json';
import koTranslations from './locales/ko.json';
import nlTranslations from './locales/nl.json';
import plTranslations from './locales/pl.json';
import trTranslations from './locales/tr.json';
import svTranslations from './locales/sv.json';
import noTranslations from './locales/no.json';
import { SUPPORTED_LANGUAGES } from './languages';

// Main language translations (translated)
const mainTranslations: Record<string, any> = {
  en: { translation: enTranslations },
  es: { translation: esTranslations },
  fr: { translation: frTranslations },
  de: { translation: deTranslations },
  zh: { translation: zhTranslations },
  pt: { translation: ptTranslations },
  it: { translation: itTranslations },
  ru: { translation: ruTranslations },
  ja: { translation: jaTranslations },
  ko: { translation: koTranslations },
  nl: { translation: nlTranslations },
  pl: { translation: plTranslations },
  tr: { translation: trTranslations },
  sv: { translation: svTranslations },
  no: { translation: noTranslations },
};

// Create fallback resources for all 100 languages
// Languages without specific translations will use English as fallback
const resources: Record<string, any> = {};

SUPPORTED_LANGUAGES.forEach(lang => {
  if (mainTranslations[lang.code]) {
    resources[lang.code] = mainTranslations[lang.code];
  } else {
    // Fallback to English for unsupported languages
    resources[lang.code] = { translation: enTranslations };
  }
});

// Get saved language from localStorage or detect browser language
const getSavedLanguage = () => {
  const saved = localStorage.getItem('language');
  const supportedCodes = SUPPORTED_LANGUAGES.map(l => l.code);
  
  if (saved && supportedCodes.includes(saved)) {
    return saved;
  }

  // Try to detect browser language
  const browserLang = navigator.language.split('-')[0];
  return supportedCodes.includes(browserLang) ? browserLang : 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getSavedLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
