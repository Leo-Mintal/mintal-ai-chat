/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_ADMIN_PASSWORD?: string;
  readonly VITE_ADMIN_GRANT_PATH?: string;
  readonly VITE_LLM_CHAT_TIMEOUT_MS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
