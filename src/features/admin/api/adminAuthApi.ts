import { LoginRequest, LoginResponse, VerifyResponse } from './types';

// 로그인
export async function login(password: string): Promise<LoginResponse> {
  const response = await fetch('/api/admin/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password } as LoginRequest),
  });

  return response.json();
}

// 로그아웃
export async function logout(): Promise<void> {
  await fetch('/api/admin/logout', {
    method: 'POST',
  });
}

// 인증 상태 확인
export async function verifyAuth(): Promise<VerifyResponse> {
  const response = await fetch('/api/admin/verify');
  return response.json();
}
