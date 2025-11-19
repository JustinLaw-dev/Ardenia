'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Brain, Zap, Target, Trophy, Sparkles, ArrowRight } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl mb-8 shadow-2xl">
            <Brain className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Ardenia <span className="text-blue-600">V1</span>
          </h1>

          <p className="text-2xl text-gray-600 dark:text-gray-300 mb-4 max-w-3xl mx-auto">
            ADHD-Optimized Task Management
          </p>

          <p className="text-lg text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            Premium productivity designed for ADHD minds. Neuroscience-backed rewards,
            focus tracking, and dopamine-optimized task completion.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" variant="primary" className="text-lg px-8">
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 py-20">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl mb-4">
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Dopamine-Driven
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Variable reward scheduling optimized for ADHD neurology
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl mb-4">
              <Target className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Focus Sessions
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Pomodoro timers with distraction tracking and quality metrics
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl mb-4">
              <Trophy className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Gamification
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Levels, achievements, and streaks with forgiveness features
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl mb-4">
              <Sparkles className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Premium Design
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Apple-inspired UI with micro-animations and visual feedback
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center py-20 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to transform your productivity?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Join thousands of ADHD individuals thriving with Ardenia
          </p>
          <Link href="/register">
            <Button size="lg" variant="primary" className="text-lg px-10">
              Start Free
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
