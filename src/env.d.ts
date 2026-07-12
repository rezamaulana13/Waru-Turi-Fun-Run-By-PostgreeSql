/// <reference path="../.astro/types.d.ts" />
interface ImportMetaEnv {
  readonly DATABASE_URL: string;
  readonly JWT_SECRET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}