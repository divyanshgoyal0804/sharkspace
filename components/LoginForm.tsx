
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simple credential check
    if (username === 'admin' && password === 'password') {
      router.push('/admin');
    } else if (username === 'client1' && password === 'password') {
      router.push('/client');
    } else {
      alert('Invalid credentials. Try admin/password or client1/password');
    }

    setIsLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
        <p className="text-gray-600">Sign in to access your workspace</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          placeholder="Enter your username"
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Enter your password"
        />

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
          icon={isLoading ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-login-box-line"></i>}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600 mb-2">Demo Credentials:</p>
        <div className="space-y-1 text-sm">
          <div><strong>Admin:</strong> admin / password</div>
          <div><strong>Client:</strong> client1 / password</div>
        </div>
      </div>
    </div>
  );
}
