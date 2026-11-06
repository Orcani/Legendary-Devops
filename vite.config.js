import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron'

// Politique de sécurité du contenu, ajoutée seulement au build : en développement, Vite injecte
// des scripts en ligne (rechargement à chaud) qu'elle bloquerait.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
].join('; ')
const cspProduction = {
  name: 'csp-production',
  apply: 'build',
  transformIndexHtml: html =>
    html.replace(
      '<meta charset="UTF-8" />',
      `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />`,
    ),
}

export default defineConfig({
  base: './',
  plugins: [
    react(),
    cspProduction,
    electron([
      {
        entry: 'electron/main.js',
        onstart(options) {
          options.startup()
        },
        vite: {
          build: {
            outDir: 'dist-electron',
            sourcemap: true,
            rollupOptions: {
              external: ['electron', 'electron-store'],
              output: { format: 'es', entryFileNames: 'main.js' },
            },
          },
        },
      },
      {
        entry: 'electron/preload.js',
        onstart(options) {
          options.reload()
        },
        vite: {
          build: {
            outDir: 'dist-electron',
            emptyOutDir: false,
            sourcemap: true,
            lib: { entry: 'electron/preload.js', formats: ['cjs'], fileName: () => 'preload.cjs' },
            rollupOptions: { external: ['electron'], output: { format: 'cjs', entryFileNames: 'preload.cjs' } },
          },
        },
      },
    ]),
  ],
  server: { port: 5173 },
})
