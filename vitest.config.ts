import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Pure TS, no DOM — Node env is enough and keeps SSR safety honest.
    environment: 'node',
    include: ['src/**/*.test.ts'],
    globals: false,
  },
});
