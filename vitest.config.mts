import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": "/Users/felipe/aicansai/src",
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/setupTests.ts"],
  },
});
