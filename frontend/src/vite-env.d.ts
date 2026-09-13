/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the FastAPI backend, e.g. "http://localhost:8000". Leave unset to force mock mode. */
  readonly VITE_API_BASE_URL?: string;
  /** "true" | "false". Defaults to true whenever VITE_API_BASE_URL is unset. */
  readonly VITE_USE_MOCK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.jpg" {
  const src: string;
  export default src;
}

declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.svg" {
  const src: string;
  export default src;
}
