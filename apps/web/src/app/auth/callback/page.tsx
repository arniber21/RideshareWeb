'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loadUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      // Store the token
      localStorage.setItem('token', token);
      // Reload user data
      loadUser().then(() => {
        toast.success('Successfully signed in!');
        router.push('/');
      });
    } else {
      toast.error('Authentication failed');
      router.push('/auth/login');
    }
  }, [router, searchParams, loadUser]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Completing sign in...</h2>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    </div>
  );
} 