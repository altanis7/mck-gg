'use client';

import { useState } from 'react';
import { deleteMember } from '../api/membersApi';

export function useDeleteMember() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove(id: string) {
    setIsLoading(true);
    setError(null);

    try {
      await deleteMember(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '멤버 삭제에 실패했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  return { remove, isLoading, error };
}
