import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-4xl font-bold mb-4">
          MM Agency Marketplace
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Multi-Vendor SaaS Marketplace Platform
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition"
          >
            Register
          </Link>
        </div>
      </div>
    </main>
  );
}
