/** @type { Config } */
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add custom configuration
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/services/(.*)$': '<rootDir>/services/$1',
  },
  testEnvironment: 'jsdom',
}

module.exports = createJestConfig(customJestConfig)
