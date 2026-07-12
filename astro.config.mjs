import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import netlify from '@astrojs/netlify';

export default defineConfig({
  integrations: [tailwind(), react()],
  site: 'https://waruturi-2027.com',
  output: 'server',
  adapter: netlify(),
  output: 'server', // <- Ini cukup, adapter tidak perlu
});