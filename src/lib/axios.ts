import axios, { AxiosInstance } from 'axios';

// axios interceptor가 response.data를 반환하도록 타입 오버라이드
interface CustomAxiosInstance extends Omit<AxiosInstance, 'get' | 'post' | 'put' | 'patch' | 'delete'> {
  get<T = any>(url: string, config?: any): Promise<T>;
  post<T = any>(url: string, data?: any, config?: any): Promise<T>;
  put<T = any>(url: string, data?: any, config?: any): Promise<T>;
  patch<T = any>(url: string, data?: any, config?: any): Promise<T>;
  delete<T = any>(url: string, config?: any): Promise<T>;
}

const instance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor - 전역 에러 처리 및 data 추출
instance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // API 응답 형식에 맞게 변환
    const errorMessage = error.response?.data?.error
      || error.message
      || '알 수 없는 오류가 발생했습니다';

    return Promise.reject(new Error(errorMessage));
  }
);

export const apiClient = instance as CustomAxiosInstance;
