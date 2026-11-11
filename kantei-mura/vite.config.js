import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // 出力ファイルをフォルダに分けず1か所にまとめる(Xserverのファイルマネージャーでアップロードしやすくするため)
    assetsDir: '',
  },
})
