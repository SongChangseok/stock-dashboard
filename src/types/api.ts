// API 관련 타입 정의

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  rateLimited?: boolean;
}

export interface ApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}
