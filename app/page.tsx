'use client';

import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function LandingPage() {
  const { user, isLoading } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <div className="max-w-2xl text-center space-y-8 px-4">
        <h1 className="text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">
          Superhuman for Everyone
        </h1>
        <p className="text-xl text-zinc-400">
          The fastest email and calendar experience ever made. Powered by Corsair, integrated with
          everything you need.
        </p>

        <div className="pt-8">
          {isLoading ? (
            <div className="animate-pulse flex space-x-4 justify-center">
              <div className="h-12 w-32 bg-zinc-800 rounded-md"></div>
              <div className="h-12 w-32 bg-zinc-800 rounded-md"></div>
            </div>
          ) : user ? (
            <Link
              href="/inbox"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 transition-all duration-200"
            >
              Go to Inbox
            </Link>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 transition-all duration-200"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white bg-transparent border border-zinc-700 rounded-lg hover:bg-zinc-800 transition-all duration-200"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
