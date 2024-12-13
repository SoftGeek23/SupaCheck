import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-900 flex flex-col">
      {/* Navigation */}
      <nav className="p-6">
        <div className="flex items-center">
          <span className="text-white text-2xl font-bold">SupaCheck</span>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Section */}
        <div className="w-1/2 flex flex-col justify-center px-20">
          <h1 className="text-5xl font-bold text-white mb-6">
            Welcome to SupaCheck!
            </h1>
          <p className="text-gray-300 text-xl mb-12">
            Ensure your Supabase configuration follows security best practices. 
            Check RLS policies, MFA status, and PITR settings in one place.
            </p>

          <div className="space-y-4">
            {/* Primary Button */}
              <Link
                href="/login"
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg flex items-center justify-center text-lg font-medium hover:bg-blue-700 transition-colors"
              >
              Continue with Supabase
              </Link>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gradient-to-br from-black via-gray-900 to-blue-900 text-gray-400">
                  OR
                </span>
              </div>
            </div>

            {/* Secondary Button */}
            <Link 
              href="/dashboard"
              className="w-full border border-gray-600 text-white py-3 px-6 rounded-lg flex items-center justify-center text-lg font-medium hover:bg-gray-800 transition-colors"
            >
              View Demo Dashboard
            </Link>
          </div>

          {/* Footer Links */}
          <div className="mt-8 flex gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Documentation</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>

        {/* Right Section - Decorative */}
        <div className="w-1/2 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Decorative Elements */}
            <div className="relative w-96 h-96">
              <div className="absolute inset-0 bg-blue-500 opacity-20 blur-3xl rounded-full"></div>
              <div className="absolute inset-10 bg-blue-600 opacity-20 blur-2xl rounded-full"></div>
              <div className="absolute inset-20 bg-blue-700 opacity-20 blur-xl rounded-full"></div>
              
              {/* You could add an illustration or logo here */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-8xl">🛡️</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}