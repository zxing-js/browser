/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
  },
  modulePathIgnorePatterns: ['<rootDir>/browser/', '<rootDir>/dist/'],
  testTimeout: 30000,
};
