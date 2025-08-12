// eslint.config.mjs
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import eslintConfigPrettier from 'eslint-config-prettier';

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

export default [
  // ignore
  {
    ignores: [
      'node_modules',
      '.next',
      'dist',
      'coverage',
      'lib/zod/**',
      '**/lib/zod/**',
      '__generated__',
      '**/__generated__/**',
    ],
    languageOptions: { ecmaVersion: 2023, sourceType: 'module' },
  },

  // JS 基本
  js.configs.recommended,

  // ← ここで legacy 形式の "next/core-web-vitals" を Flat に取り込む
  ...compat.config({ extends: ['next/core-web-vitals'] }),

  // TypeScript（型情報なし＝高速）
  ...tseslint.configs.recommended,

  // .eslintrc.json の TS ルール
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },

  // react-hooks ルール
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  // Prettierとの衝突を無効化（eslint-config-prettier）
  eslintConfigPrettier,

  // Prettierプラグインのルールを有効化
  {
    plugins: { prettier: await import('eslint-plugin-prettier') },
    rules: {
      'prettier/prettier': 'error',
    },
  },
];
