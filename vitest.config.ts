import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      exclude: [
        'src/components/ui/**',        // shadcn auto-generated
        'src/lib/db/**',               // provider router + stubs, integration-tested
        'src/lib/auth.ts',             // NextAuth wrapper, E2E-tested
        'src/lib/utils.ts',            // shadcn cn() utility
        'src/app/api/**',              // route handlers, E2E-tested
        'src/app/**/layout.tsx',       // Next.js layouts, E2E-tested
        'src/app/**/page.tsx',         // Next.js pages, E2E-tested
        'src/middleware.ts',           // middleware, E2E-tested
        'src/__tests__/**',            // test files themselves
      ],
      thresholds: {
        lines: 80,
        branches: 80,
        functions: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
