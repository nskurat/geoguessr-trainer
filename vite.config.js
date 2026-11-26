import { defineConfig } from 'vite';

// `dev` and `preview` both resolve command: 'serve' (only `isPreview` tells
// them apart), so the real sub-path applies to `build` and `preview`, where
// the app is actually served from it, while plain `dev` stays at `/`.
export default defineConfig(({ command, isPreview }) => {
  const usesRealBase = command === 'build' || isPreview;
  const basePath = usesRealBase ? process.env.VITE_BASE_PATH || '/geoguessr-trainer/' : '/';

  return {
    root: 'trainer-app',
    base: basePath,
    build: {
      outDir: '../dist',
      emptyOutDir: true,
    },
    test: {
      globals: true,
      environment: 'node',
      include: ['src/**/*.test.ts'],
      coverage: {
        provider: 'v8',
        include: ['src/**/*.ts'],
        exclude: ['src/**/__tests__/**', 'src/**/*.d.ts', 'src/data/**', 'src/app/**', 'src/main.ts'],
        reporter: ['text-summary', 'text'],
      },
    },
  };
});
