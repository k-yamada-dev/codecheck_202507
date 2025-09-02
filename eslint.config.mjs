// eslint.config.mjs
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import eslintConfigPrettier from 'eslint-config-prettier';

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

export default [
  // ========= 0) 無条件のグローバル ignore（一番上） =========
  {
    ignores: [
      // 生成物
      'dist/**',
      '**/dist/**',
      './dist/**',
      'packages/*/dist/**',
      '**/.next/**',
      '**/coverage/**',
      'coverage',
      '__generated__/**',
      '**/__generated__/**',
      '__generated__',
      'lib/zod/**',
      '**/lib/zod/**',
      // 型定義
      '**/*.d.ts',
      '**/dist/**/*.d.ts',
      // その他
      '**/node_modules/**',
      '.vscode',
      '*.log',
    ],
  },

  // ========= 1) packages 以下をさらに強制除外（サブディレクトリ実行対策） =========
  {
    files: ['packages/**/*'],
    ignores: ['dist/**', '**/dist/**', './dist/**', '**/*.d.ts', '**/**/__generated__/**'],
  },

  // ========= 2) 共通ベース =========
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // ========= 3) Next ルールは apps/web のみに限定 =========
  ...compat
    .config({ extends: ['next/core-web-vitals'] })
    .map(cfg => ({ ...cfg, files: ['apps/web/**/*.{ts,tsx,js,jsx}'] })),

  // ========= 4) TS 追加ルール（.d.ts は明示的に除外） =========
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['**/*.d.ts'], // ← これが効く
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },

  // ========= 5) react-hooks =========
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  // ========= 6) Prettier 衝突無効化 =========
  ...(Array.isArray(eslintConfigPrettier) ? eslintConfigPrettier : [eslintConfigPrettier]),

  // ========= 7) Prettier プラグイン =========
  {
    plugins: {
      prettier:
        (await import('eslint-plugin-prettier')).default ??
        (await import('eslint-plugin-prettier')),
    },
    rules: { 'prettier/prettier': 'error' },
  },
];
