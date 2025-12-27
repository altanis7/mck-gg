import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromCookie } from '@/features/admin/utils/auth';
import { VerifyResponse } from '@/features/admin/api/types';

export async function GET(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie');
  const token = getTokenFromCookie(cookieHeader);

  if (!token) {
    return NextResponse.json<VerifyResponse>({ authenticated: false });
  }

  const payload = verifyToken(token);

  if (!payload) {
    return NextResponse.json<VerifyResponse>({ authenticated: false });
  }

  return NextResponse.json<VerifyResponse>({ authenticated: true });
}
