'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, Lock, User, Brain } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      await register({
        email: formData.email,
        password: formData.password,
        displayName: formData.displayName || undefined,
      });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Start Your Journey
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Join thousands thriving with ADHD-optimized productivity
          </p>
        </div>

        {/* Register Form */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <Input
              label="Display Name"
              type="text"
              value={formData.displayName}
              onChange={(e) => updateField('displayName', e.target.value)}
              placeholder="Your Name"
              icon={<User className="w-5 h-5" />}
            />

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="you@example.com"
              icon={<Mail className="w-5 h-5" />}
              required
            />

            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => updateField('password', e.target.value)}
              placeholder="••••••••"
              icon={<Lock className="w-5 h-5" />}
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => updateField('confirmPassword', e.target.value)}
              placeholder="••••••••"
              icon={<Lock className="w-5 h-5" />}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full"
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-xs text-gray-500 dark:text-gray-500">
            By signing up, you agree to our Terms and Privacy Policy
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            ✨ ADHD-Optimized • 🎯 Neuroscience-Backed • 🔥 Dopamine-Driven
          </p>
        </div>
      </div>
    </div>
  );
}
