'use client';

import { useState, useEffect, useCallback } from 'react';
import { getCurrentUser } from '@/lib/auth';

export interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const userData = await getCurrentUser();
      if (!userData) {
        // If getCurrentUser returns null, clear token and user
        localStorage.removeItem('token');
        setUser(null);
        if (window.location.pathname !== '/auth/login') {
          window.location.href = '/auth/login';
        }
      } else {
        setUser(userData);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      localStorage.removeItem('token');
      setUser(null);
      if (window.location.pathname !== '/auth/login') {
        window.location.href = '/auth/login';
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const isAuthenticated = !!user;
  const isDriver = user?.role === 'driver';
  const isRider = user?.role === 'rider';

  return {
    user,
    loading,
    isAuthenticated,
    isDriver,
    isRider,
    loadUser,
  };
} 