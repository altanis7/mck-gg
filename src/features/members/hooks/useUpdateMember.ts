'use client';

import { useState } from 'react';
import { updateMember } from '../api/membersApi';
import { UpdateMemberDto } from '../api/types';

export function useUpdateMember() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function update(id: string, data: UpdateMemberDto) {
    setIsLoading(true);
    setError(null);

    try {
      const member = await updateMember(id, data);
      return member;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '멤버 수정에 실패했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  return { update, isLoading, error };
}
