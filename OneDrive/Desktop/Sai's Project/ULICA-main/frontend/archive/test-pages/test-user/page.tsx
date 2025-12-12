'use client';

import { useAuth } from '@/app/providers';

export default function TestUserPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Current User Test</h1>
        
        {user ? (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">User Data:</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
            
            <div className="mt-4 p-4 bg-blue-50 rounded">
              <h3 className="font-semibold">Role Check:</h3>
              <p className="text-lg">
                Role: <span className={`font-bold ${user.role === 'admin' ? 'text-green-600' : 'text-red-600'}`}>
                  {user.role}
                </span>
              </p>
              <p className={`text-lg ${user.role === 'admin' ? 'text-green-600' : 'text-red-600'}`}>
                {user.role === 'admin' ? '✅ Admin Access' : '❌ Not Admin'}
              </p>
            </div>
            
            <div className="mt-4">
              <a 
                href="/admin" 
                className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Go to Admin Dashboard
              </a>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">No User Logged In</h2>
            <p>Please login first.</p>
            <div className="mt-4">
              <a 
                href="/login" 
                className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Go to Login
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
