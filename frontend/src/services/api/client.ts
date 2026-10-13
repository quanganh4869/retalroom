export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    extra?: Record<string, unknown>;
  };
}

export class ApiError extends Error {
  public code: string;
  public status: number;
  public extra?: Record<string, unknown>;

  constructor(
    status: number,
    message: string,
    code: string = 'API_ERROR',
    extra?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.extra = extra;
  }
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData: ApiErrorResponse | null = null;
    try {
      errorData = (await response.json()) as ApiErrorResponse;
    } catch {
      // Body not JSON
    }

    const message = errorData?.error?.message || response.statusText || 'Request failed';
    const code = errorData?.error?.code || `HTTP_${response.status}`;
    throw new ApiError(response.status, message, code, errorData?.error?.extra);
  }

  return (await response.json()) as T;
}
