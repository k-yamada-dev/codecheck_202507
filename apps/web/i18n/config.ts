import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enCommon from '@/public/locales/en/common.json';
import jaCommon from '@/public/locales/ja/common.json';

export const resources = {
  en: { common: enCommon },
  ja: { common: jaCommon },
} as const;

i18n.use(initReactI18next).init({
  resources,
  fallbackLng: 'ja',
  defaultNS: 'common',
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
