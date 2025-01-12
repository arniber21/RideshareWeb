'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireDriver?: boolean;
  requireRider?: boolean;
}

export default function ProtectedRoute({
  children,
  requireAuth = true,
  requireDriver = false,
  requireRider = false,
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated, isDriver, isRider } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !isAuthenticated) {
        window.location.href = '/auth/login';
      } else if (requireDriver && !isDriver) {
        window.location.href = '/';
      } else if (requireRider && !isRider) {
        window.location.href = '/';
      }
    }
  }, [loading, isAuthenticated, isDriver, isRider, requireAuth, requireDriver, requireRider]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Loading...</h2>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!loading && requireAuth && !isAuthenticated) {
    return null;
  }

  if (!loading && requireDriver && !isDriver) {
    return null;
  }

  if (!loading && requireRider && !isRider) {
    return null;
  }

  return <>{children}</>;
} 