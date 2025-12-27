'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/Card';
import { ErrorMessage } from '@/shared/components/ui/ErrorMessage';
import { useAdminLogin } from '../hooks/useAdminLogin';

export function LoginForm() {
  const [password, setPassword] = useState('');
  const { handleLogin, isLoading, error } = useAdminLogin();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    handleLogin(password);
  }

  return (
    <Card className="max-w-md mx-auto mt-16">
      <CardHeader>
        <CardTitle>관리자 로그인</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          {error && <ErrorMessage message={error} />}

          <Input
            type="password"
            label="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="관리자 비밀번호를 입력하세요"
            disabled={isLoading}
            autoFocus
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? '로그인 중...' : '로그인'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
