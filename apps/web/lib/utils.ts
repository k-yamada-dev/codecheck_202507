import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { languages, type Language } from '@/i18n/settings';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isValidLanguage(lang: unknown): lang is Language {
  return (
    typeof lang === 'string' && (languages as readonly string[]).includes(lang)
  );
}
