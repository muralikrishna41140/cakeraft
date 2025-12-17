'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        console.log('✅ User is authenticated, redirecting to dashboard');
        router.push('/dashboard');
      } else {
        console.log('❌ User is not authenticated, redirecting to login');
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking auth and redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="mb-4 mx-auto h-16 w-16 rounded-full overflow-hidden border-2 border-green-600 shadow-lg">
          <img 
            src="https://res.cloudinary.com/dsguaqukb/image/upload/v1758778085/cake_fak42q.jpg"
            alt="CakeRaft Logo"
            className="w-full h-full object-cover"
          />
        </div>
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">
          {isLoading ? 'Checking authentication...' : 'Redirecting...'}
        </p>
      </div>
    </div>
  );
}