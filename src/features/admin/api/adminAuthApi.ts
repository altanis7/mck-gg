import { apiClient } from '@/lib/axios';
import { LoginResponse, VerifyResponse } from './types';

// 로그인
export async function login(password: string): Promise<LoginResponse> {
  return await apiClient.post<LoginResponse>('/admin/login', { password });
}

// 로그아웃
export async function logout(): Promise<void> {
  await apiClient.post<void>('/admin/logout');
}

// 인증 상태 확인
export async function verifyAuth(): Promise<VerifyResponse> {
  return await apiClient.get<VerifyResponse>('/admin/verify');
}
