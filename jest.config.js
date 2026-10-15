/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "jsdom",
  setupFiles: ["<rootDir>/jest.node-setup.js"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", {
      tsconfig: {
        jsx: "react-jsx",
        module: "esnext",
        moduleResolution: "bundler",
        esModuleInterop: true,
        strict: true,
        target: "ES2017",
        lib: ["dom", "dom.iterable", "esnext"],
        paths: { "@/*": ["./src/*"] },
        skipLibCheck: true,
      },
    }],
  },
  transformIgnorePatterns: [
    "node_modules/(?!lucide-react|@prisma/client|next|@auth)/"
  ],
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.next/", "<rootDir>/e2e/"],
  collectCoverageFrom: [
    "src/lib/**/*.ts",
    "src/components/**/*.tsx",
    "src/hooks/**/*.ts",
  ],
};
