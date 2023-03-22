export type Config = {
  serverUrl: string;
};

export const useConfig = (): Config => {
  return {
    serverUrl: import.meta.env.VITE_SERVER_URL,
  };
};
