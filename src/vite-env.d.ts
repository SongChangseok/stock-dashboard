/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_ALPHA_VANTAGE_API_KEY: string;
  readonly VITE_NEWS_API_KEY: string;
  readonly VITE_NEWS_API_BASE_URL: string;
  readonly VITE_PRICE_UPDATE_INTERVAL: string;
  readonly VITE_ENABLE_API_LOGGING: string;
  readonly VITE_ENABLE_MOCK_DATA: string;
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}