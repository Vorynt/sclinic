import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  clearMocks: true,
  testMatch: ["**/*.spec.ts", "**/*.spec.tsx"],
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/.next/",
    "<rootDir>/.storybook/",
  ],
  modulePathIgnorePatterns: ["<rootDir>/.next/"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^better-auth(/.*)?$": "<rootDir>/__mocks__/better-auth.ts",
  },
  collectCoverageFrom: [
    "src/modules/**/schemas/**/*.ts",
    "src/modules/**/utils/**/*.ts",
    "src/modules/**/mappers/**/*.ts",
    "src/shared/errors/**/*.ts",
    "src/shared/validators/**/*.ts",
  ],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "\\.spec\\.(ts|tsx)$",
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      lines: 80,
      branches: 60,
      functions: 55,
    },
  },
};

const jestConfig = async () => {
  const jestConfig = await createJestConfig(config)();
  const existing = jestConfig.moduleNameMapper ?? {};
  jestConfig.moduleNameMapper = {
    ...(Array.isArray(existing) ? Object.fromEntries(existing) : existing),
    "^better-auth(/.*)?$": "<rootDir>/__mocks__/better-auth.ts",
  };
  return jestConfig;
};

export default jestConfig;
