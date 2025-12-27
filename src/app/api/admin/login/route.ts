import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, generateToken } from '@/features/admin/utils/auth';
import { validatePassword } from '@/features/admin/utils/validators';
import { LoginRequest, LoginResponse } from '@/features/admin/api/types';

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { password } = body;

    // 입력 검증
    const validation = validatePassword(password);
    if (!validation.valid) {
      return NextResponse.json<LoginResponse>(
        { success: false, message: validation.error },
        { status: 400 }
      );
    }

    // 비밀번호 확인
    const isValid = verifyPassword(password);
    if (!isValid) {
      return NextResponse.json<LoginResponse>(
        { success: false, message: '비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    // JWT 토큰 생성
    const token = generateToken();

    // HttpOnly 쿠키 설정
    const response = NextResponse.json<LoginResponse>({
      success: true,
      message: '로그인 성공',
    });

    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24시간
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json<LoginResponse>(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
