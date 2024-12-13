'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [projectUrl, setProjectUrl] = useState('');
  const [serviceKey, setServiceKey] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!projectUrl.startsWith('https://')) {
      setError('Project URL must start with https://');
      return;
    }

    if (!serviceKey.startsWith('eyJ')) {
      setError('Invalid service key format');
      return;
    }

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          projectUrl: projectUrl.trim(),
          serviceKey: serviceKey.trim()
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      router.push('/dashboard');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex flex-col">
      {/* Navigation */}
      <nav className="p-6 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-white text-2xl font-bold tracking-tight">
            SupaCheck
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 relative z-10">
          <div>
            <h2 className="text-center text-3xl font-semibold text-white tracking-tight">
              Connect to Supabase
            </h2>
            <p className="mt-4 text-center text-gray-400">
              Enter your project details to start checking compliance
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg relative" role="alert">
              <span className="block text-sm">{error}</span>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="project-url" className="block text-sm font-medium text-gray-300 mb-2">
                  Project URL
                </label>
                <input
                  id="project-url"
                  name="projectUrl"
                  type="url"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border 
                           bg-[#1A1A1B] border-gray-800 placeholder-gray-500 text-white rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           transition-all duration-200 text-sm"
                  placeholder="https://xxx.supabase.co"
                  value={projectUrl}
                  onChange={(e) => setProjectUrl(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="service-key" className="block text-sm font-medium text-gray-300 mb-2">
                  Service Role Key
                </label>
                <input
                  id="service-key"
                  name="serviceKey"
                  type="password"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border
                           bg-[#1A1A1B] border-gray-800 placeholder-gray-500 text-white rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           transition-all duration-200 text-sm"
                  placeholder="eyJ..."
                  value={serviceKey}
                  onChange={(e) => setServiceKey(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 
                         bg-[#2D63ED] text-white text-sm font-medium rounded-lg
                         hover:bg-blue-600 focus:outline-none focus:ring-2 
                         focus:ring-offset-2 focus:ring-blue-500 transition-all
                         duration-200"
              >
                Check Compliance
              </button>
            </div>
          </form>

          <p className="text-center text-sm text-gray-500">
            Need help finding these details?{' '}
            <a href="https://supabase.com/docs" target="_blank" rel="noopener noreferrer" 
               className="text-blue-500 hover:text-blue-400 transition-colors">
              View Documentation
            </a>
          </p>
        </div>

        {/* Decorative Background */}
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-full h-full max-w-7xl mx-auto">
            <div className="absolute right-0 top-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute left-1/4 bottom-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
            <div className="absolute left-0 top-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </main>
    </div>
  );
}
