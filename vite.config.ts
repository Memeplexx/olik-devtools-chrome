import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import monacoEditorPlugin from 'vite-plugin-monaco-editor'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    (monacoEditorPlugin as any).default({
      languageWorkers: ['typescript', 'editorWorkerService'],
    }),
    viteStaticCopy({
      targets: [
        { src: './manifest.json', dest: './' },
        { src: './devtools.html', dest: './' },
        { src: './devtools.js', dest: './' },
        { src: './content-script.js', dest: './' },
      ],
    }),
  ],
})
