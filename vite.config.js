import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// NOM EXACT de ton repo GitHub
const repoName = 'TP-G-n-ral---Galerie-d-Inspiration-Cr-ative';

export default defineConfig({
  plugins: [react()],
  base: `/${repoName}/`,
});