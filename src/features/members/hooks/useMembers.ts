'use client';

import { useState, useEffect } from 'react';
import { getMembers } from '../api/membersApi';
import { Member } from '../api/types';

export function useMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchMembers() {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getMembers();
      setMembers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchMembers();
  }, []);

  return { members, isLoading, error, refetch: fetchMembers };
}
