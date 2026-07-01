/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DIGIT_BASE_URL?: string;
  readonly VITE_STATE_TENANT?: string;
  readonly VITE_CITY_TENANT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
