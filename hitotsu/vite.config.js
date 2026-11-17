import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { devApi } from './dev-api.mjs'

const root = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  root,
  // devApi: 開発サーバーでだけ /api/*.php の代わりに動く仮API(本番はPHP)
  plugins: [react(), devApi()],
  build: {
    rollupOptions: {
      input: {
        main: `${root}index.html`,
        tokushoho: `${root}tokushoho/index.html`,
        privacy: `${root}privacy/index.html`,
        terms: `${root}terms/index.html`,
      },
    },
  },
})
