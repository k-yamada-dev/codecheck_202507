// jest.config.js (repo root)
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Next.js アプリの場所を明示
  dir: './apps/web',
});

const customJestConfig = {
  // ここで rootDir を apps/web に寄せて <rootDir> をずれなくする
  rootDir: 'apps/web',

  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jsdom',
  testMatch: ['**/*.(spec|test).{ts,tsx}'],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/utils/(.*)$': '<rootDir>/app/utils/$1',
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
  },

  collectCoverage: true,
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    '!app/**/*.d.ts',
    '!app/api/**/*.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: { branches: 80, functions: 80, lines: 80, statements: 80 },
  },
};

module.exports = createJestConfig(customJestConfig);
