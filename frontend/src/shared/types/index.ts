export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  code: string;
  message: string;
  path: string;
  validationErrors?: Record<string, string>;
}

export class ApiError extends Error {
  status: number;
  code: string;
  validationErrors?: Record<string, string>;
  path?: string;

  constructor(payload: ApiErrorResponse) {
    super(payload.message || 'An unexpected API error occurred');
    this.name = 'ApiError';
    this.status = payload.status;
    this.code = payload.code;
    this.validationErrors = payload.validationErrors;
    this.path = payload.path;
  }
}
