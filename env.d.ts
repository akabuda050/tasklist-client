/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly server_url: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
