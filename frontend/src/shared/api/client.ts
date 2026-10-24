import { apiConfig } from '../config';
import { ApiResponse, ApiError, ApiErrorResponse } from '../types';

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { body, params, headers, ...customConfig } = options;

  let url = `${apiConfig.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), apiConfig.timeoutMs);

  const reqHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...headers,
  };

  const token = localStorage.getItem('access_token');
  if (token) {
    (reqHeaders as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...customConfig,
    headers: reqHeaders,
    signal: controller.signal,
  };

  if (body !== undefined) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);
    clearTimeout(timeoutId);

    if (response.status === 204) {
      return {} as T;
    }

    const json = await response.json();

    if (!response.ok) {
      const errorPayload: ApiErrorResponse = {
        timestamp: json.timestamp || new Date().toISOString(),
        status: response.status,
        error: json.error || response.statusText,
        code: json.code || 'API_ERROR',
        message: json.message || 'Lỗi giao tiếp máy chủ',
        path: json.path || endpoint,
        validationErrors: json.validationErrors,
      };
      throw new ApiError(errorPayload);
    }

    // If response is wrapped in standard ApiResponse<T>, unwrap data
    if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
      return (json as ApiResponse<T>).data;
    }

    return json as T;
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof ApiError) {
      throw err;
    }
    if (err instanceof Error && err.name === 'AbortError') {
      throw new ApiError({
        timestamp: new Date().toISOString(),
        status: 408,
        error: 'Timeout',
        code: 'REQUEST_TIMEOUT',
        message: 'Yêu cầu tới máy chủ vượt quá thời gian phản hồi cho phép',
        path: endpoint,
      });
    }
    throw new ApiError({
      timestamp: new Date().toISOString(),
      status: 500,
      error: 'Network Error',
      code: 'NETWORK_ERROR',
      message: (err as Error)?.message || 'Không thể kết nối đến máy chủ RentFlow',
      path: endpoint,
    });
  }
}
