'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Input } from '@/components/ui/Input';
import {
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  Flame,
  Trophy,
  TrendingUp,
  Target,
  LogOut,
  Zap,
  Star,
  Award
} from 'lucide-react';
import type { Task, DashboardStats } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [stats, allTasks] = await Promise.all([
        apiClient.analytics.getDashboard(),
        apiClient.tasks.getAll(),
      ]);
      setDashboardStats(stats as any);
      setTasks(allTasks as any);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      await apiClient.tasks.create({
        title: newTaskTitle,
        priority: 2,
        energyRequired: 3,
        difficultyLevel: 3,
        estimatedDuration: 25,
      });
      setNewTaskTitle('');
      setShowNewTask(false);
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await apiClient.tasks.complete(taskId);
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const filteredTasks = tasks.filter(task => filter === 'all' || task.status === filter);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Ardenia
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Welcome back, {user?.displayName || user?.email}!
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card hover>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Level
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {dashboardStats?.user.level || 1}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <ProgressBar
                value={dashboardStats?.user.levelProgress || 0}
                size="sm"
                color="blue"
                className="mt-4"
              />
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                {dashboardStats?.user.pointsToNextLevel || 0} points to next level
              </p>
            </CardContent>
          </Card>

          <Card hover>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Current Streak
                  </p>
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                    {dashboardStats?.user.currentStreak || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                  <Flame className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-4">
                Best: {dashboardStats?.user.longestStreak || 0} days
              </p>
            </CardContent>
          </Card>

          <Card hover>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Points
                  </p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                    {dashboardStats?.user.totalPoints || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-4">
                +{dashboardStats?.today.pointsEarned || 0} today
              </p>
            </CardContent>
          </Card>

          <Card hover>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Completed Today
                  </p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                    {dashboardStats?.today.tasksCompleted || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-4">
                {dashboardStats?.tasks.completionRate || 0}% overall rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tasks Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Tasks</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {filteredTasks.length} tasks
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => setShowNewTask(!showNewTask)}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Task
              </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mt-4">
              {(['all', 'pending', 'in_progress', 'completed'] as const).map((f) => (
                <Button
                  key={f}
                  size="sm"
                  variant={filter === f ? 'primary' : 'ghost'}
                  onClick={() => setFilter(f)}
                >
                  {f === 'all' ? 'All' : f.replace('_', ' ')}
                </Button>
              ))}
            </div>
          </CardHeader>

          <CardContent>
            {/* New Task Form */}
            {showNewTask && (
              <form onSubmit={handleCreateTask} className="mb-6">
                <div className="flex gap-2">
                  <Input
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="What needs to be done?"
                    autoFocus
                    className="flex-1"
                  />
                  <Button type="submit" size="md">
                    Add
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="md"
                    onClick={() => {
                      setShowNewTask(false);
                      setNewTaskTitle('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            {/* Task List */}
            <div className="space-y-3">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {filter === 'all' ? 'No tasks yet. Create one to get started!' : `No ${filter.replace('_', ' ')} tasks`}
                  </p>
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <button
                      onClick={() => task.status !== 'completed' && handleCompleteTask(task.id)}
                      className="flex-shrink-0"
                    >
                      {task.status === 'completed' ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400 hover:text-blue-600" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {task.estimatedDuration && (
                          <Badge size="sm" variant="default">
                            <Clock className="w-3 h-3 mr-1" />
                            {task.estimatedDuration}m
                          </Badge>
                        )}
                        <Badge size="sm" variant="primary">
                          +{task.rewardPoints} pts
                        </Badge>
                        {task.status === 'in_progress' && (
                          <Badge size="sm" variant="warning">
                            In Progress
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Achievements */}
        {dashboardStats?.recentAchievements && dashboardStats.recentAchievements.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>
                <Award className="w-5 h-5 inline mr-2" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {dashboardStats.recentAchievements.map((ua) => (
                  <div
                    key={ua.id}
                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800"
                  >
                    <div className="text-3xl">{ua.achievement.icon}</div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {ua.achievement.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {ua.achievement.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
