import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Config mínima para arrancar; sin alias.
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      '@radix-ui/react-slot',
      '@radix-ui/react-tabs',
      'class-variance-authority',
      'clsx',
      'tailwind-merge',
    ],
  },
})
