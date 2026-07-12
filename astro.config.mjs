import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'server',
  adapter: vercel({
    runtime: 'nodejs20.x',  // atau 'nodejs18.x'
  }),
  integrations: [react(), tailwind()],
});
