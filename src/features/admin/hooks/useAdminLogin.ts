'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '../api/adminAuthApi';

export function useAdminLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleLogin(password: string) {
    setIsLoading(true);
    setError(null);

    try {
      const result = await login(password);

      if (result.success) {
        router.push('/admin/members');
      } else {
        setError(result.message || '로그인에 실패했습니다.');
      }
    } catch (err) {
      setError('서버 오류가 발생했습니다.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  }

  return { handleLogin, isLoading, error };
}
