'use client';

import i18n from '@/i18n/config';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n.use(LanguageDetector).init({
  detection: {
    order: ['cookie', 'localStorage', 'navigator'],
    caches: ['cookie'],
  },
});

export default i18n;
