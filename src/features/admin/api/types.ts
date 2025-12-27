// 로그인 요청
export interface LoginRequest {
  password: string;
}

// 로그인 응답
export interface LoginResponse {
  success: boolean;
  message?: string;
}

// 토큰 검증 응답
export interface VerifyResponse {
  authenticated: boolean;
}

// JWT 페이로드
export interface JWTPayload {
  role: 'admin';
  iat: number;
  exp: number;
}
