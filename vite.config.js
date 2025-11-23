import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/TP-G-n-ral---Galerie-d-Inspiration-Cr-ative/', // Nom exact de votre dépôt GitHub
});