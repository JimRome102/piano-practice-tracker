import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Repertoire</h1>
          <div>
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <SignedOut>
          <div className="text-center py-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Piano Practice Tracker
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Track your piano practice sessions, log work on specific pieces, and get AI-powered practice plans.
            </p>
            <SignInButton mode="modal">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-700">
                Get Started
              </button>
            </SignInButton>
          </div>
        </SignedOut>

        <SignedIn>
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Welcome back!</h2>

            <div className="grid gap-4 md:grid-cols-3">
              <Link
                href="/repertoire"
                className="block p-6 bg-white rounded-lg border hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Repertoire</h3>
                <p className="text-gray-600">View and manage your pieces</p>
              </Link>

              <Link
                href="/practice"
                className="block p-6 bg-white rounded-lg border hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Practice</h3>
                <p className="text-gray-600">Log a new practice session</p>
              </Link>

              <Link
                href="/dashboard"
                className="block p-6 bg-white rounded-lg border hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Dashboard</h3>
                <p className="text-gray-600">View your practice stats</p>
              </Link>
            </div>
          </div>
        </SignedIn>
      </main>
    </div>
  );
}
