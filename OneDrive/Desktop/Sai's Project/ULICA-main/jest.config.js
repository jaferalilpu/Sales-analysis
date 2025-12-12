module.exports = {
  // Root configuration for the entire project
  projects: [
    // Backend tests
    {
      displayName: 'backend',
      preset: 'ts-jest',
      testEnvironment: 'node',
      rootDir: './backend',
      testMatch: ['<rootDir>/src/**/__tests__/**/*.ts', '<rootDir>/src/**/?(*.)+(spec|test).ts'],
      transform: {
        '^.+\\.ts$': 'ts-jest',
      },
      collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/index.ts',
        '!src/__tests__/**',
      ],
      coverageDirectory: '<rootDir>/coverage',
      coverageReporters: ['text', 'lcov', 'html'],
      setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
      testTimeout: 10000,
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
    },
    // Frontend tests
    {
      displayName: 'frontend',
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      rootDir: './frontend',
      testMatch: ['<rootDir>/__tests__/**/*.{ts,tsx}', '<rootDir>/**/?(*.)+(spec|test).{ts,tsx}'],
      transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
      },
      collectCoverageFrom: [
        '**/*.{ts,tsx}',
        '!**/*.d.ts',
        '!**/node_modules/**',
        '!**/.next/**',
        '!**/coverage/**',
        '!jest.config.js',
        '!jest.setup.js',
        '!next.config.js',
        '!tailwind.config.js',
        '!postcss.config.js',
      ],
      coverageDirectory: '<rootDir>/coverage',
      coverageReporters: ['text', 'lcov', 'html'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      testTimeout: 10000,
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
      },
      transformIgnorePatterns: [
        'node_modules/(?!(.*\\.mjs$|@headlessui/react|@heroicons/react))',
      ],
    },
  ],
  // Global configuration
  collectCoverage: true,
  coverageDirectory: './coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true,
};
