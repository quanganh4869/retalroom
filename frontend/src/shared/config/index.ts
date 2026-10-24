export interface ApiConfig {
  baseUrl: string;
  timeoutMs: number;
}

export const apiConfig: ApiConfig = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeoutMs: 15000,
};
