import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// IMPORTANT: change `base` to match your repo name when deploying to GitHub Pages.
// Example: if your repo is github.com/you/steel-rift-forge, set base: '/steel-rift-forge/'.
// For a custom domain or root deploy, use base: '/'.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE ?? '/Steel-Rift-Hangar-WL/',
});
