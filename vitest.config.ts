import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/index.ts'],
      thresholds: {
        // NOTE: Target 80% coverage once server.ts and oauth.ts are integration tested
        // Current tests focus on tool logic with mocked API client
        lines: 35,
        functions: 60,
        branches: 60,
        statements: 35,
      },
    },
  },
});
