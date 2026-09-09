import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    port: 5174,
    strictPort: false,
    proxy: {
      // Com `wrangler pages dev` em 8788, o Vite em 5174 encaminha a API.
      "/api": {
        target: "http://127.0.0.1:8788",
        changeOrigin: true,
      },
    },
  },

  // @ffmpeg/ffmpeg cria seu worker via `new Worker(new URL(...))` internamente.
  // O pre-bundle do Vite não resolve essa URL corretamente (o worker.js some
  // do cache de deps e a conversão MOV trava esperando um 404 silencioso) —
  // excluir do optimizeDeps faz o Vite servir o pacote direto do node_modules.
  optimizeDeps: {
    exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util", "libheif-js"],
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("libheif")) return "libheif";
        },
      },
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
