// @ts-check
import { defineConfig } from 'astro/config';

// SITE_URL und BASE_PATH werden im GitHub-Pages-Workflow gesetzt.
// Lokal (und auf einer eigenen Domain) läuft die Seite unter "/".
export default defineConfig({
  site: process.env.SITE_URL || 'https://www.redltalhof.at',
  base: process.env.BASE_PATH || '/',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
});
