// API 응답 공통 타입
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// 페이지네이션
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
