'use client';

import { useState } from 'react';
import { createMember } from '../api/membersApi';
import { CreateMemberDto } from '../api/types';

export function useCreateMember() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create(data: CreateMemberDto) {
    setIsLoading(true);
    setError(null);

    try {
      const member = await createMember(data);
      return member;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '멤버 생성에 실패했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  return { create, isLoading, error };
}
