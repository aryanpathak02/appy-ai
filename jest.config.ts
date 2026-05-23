import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  // Only run files inside __tests__
  testMatch: ["**/__tests__/**/*.test.ts"],
  // Path aliases — mirrors tsconfig @/* → src/*
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    // Mock "server-only" — it throws in non-Next environments
    "^server-only$": "<rootDir>/src/__tests__/__mocks__/server-only.ts",
  },
  // Don't transform node_modules except these ESM packages
  transformIgnorePatterns: ["/node_modules/(?!(zod)/)"],
  // Suppress console noise during tests
  silent: false,
  // Clear mocks between tests
  clearMocks: true,
  resetMocks: true,
};

export default config;
