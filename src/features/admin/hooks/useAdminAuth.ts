'use client';

import { useState, useEffect } from 'react';
import { verifyAuth } from '../api/adminAuthApi';

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const result = await verifyAuth();
      setIsAuthenticated(result.authenticated);
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }

  return { isAuthenticated, isLoading, refetch: checkAuth };
}
