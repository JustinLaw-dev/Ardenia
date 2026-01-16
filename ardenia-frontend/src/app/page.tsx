"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useGame } from "@/contexts/GameContext";
import Link from "next/link";
import {
  QuickTaskInput,
  TaskCard,
  XPProgress,
  RewardAnimation,
  FeatureTooltip,
} from "@/components/onboarding";
import {
  Trophy,
  Flame,
  Users,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Zap,
  Calendar,
  CheckCircle2,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCompletedTasks } from "@/lib/tasks";
import type { Task } from "@/lib/types/database";

interface LocalTask {
  id: string;
  title: string;
  xp: number;
  completed: boolean;
}

const XP_PER_TASK = 50;

// Feature card for the landing page
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center p-6 bg-card border border-border rounded-xl hover:border-terracotta-300 hover:shadow-md transition-all">
      <div className="w-12 h-12 rounded-full bg-terracotta-100 flex items-center justify-center mb-4 text-terracotta-600">
        {icon}
      </div>
      <h3 className="font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

// Landing page for logged-out users
function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-terracotta-50 to-background -z-10" />
        <div className="container max-w-6xl mx-auto px-4 py-20 md:py-32">
          <div className="flex flex-col items-center text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-terracotta-100 text-terracotta-700 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Productivity meets gamification
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Getting things done doesn't have to be daunting.
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-muted-foreground max-w-2xl mb-8">
              Turn your daily tasks into an adventure. Earn XP, unlock
              achievements, maintain streaks, and compete with friends while
              crushing your goals.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/login">
                <Button
                  size="lg"
                  className="bg-terracotta-500 hover:bg-terracotta-600 text-white px-8 cursor-pointer"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 cursor-pointer hover:bg-terracotta-200"
                >
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Social proof */}
            <p className="text-sm text-muted-foreground mt-8">
              Join thousands making productivity fun
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Everything you need to stay motivated
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We&apos;ve built the tools to help you build lasting habits and
              achieve your goals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<TrendingUp className="w-6 h-6" />}
              title="Level Up"
              description="Earn XP for every task you complete and watch yourself grow from Novice to Legend."
            />
            <FeatureCard
              icon={<Trophy className="w-6 h-6" />}
              title="Achievements"
              description="Unlock badges and rewards as you hit milestones and complete challenges."
            />
            <FeatureCard
              icon={<Flame className="w-6 h-6" />}
              title="Daily Streaks"
              description="Build momentum with daily streaks. Don't break the chain!"
            />
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title="Friends & Leaderboard"
              description="Connect with friends, compare progress, and climb the leaderboard."
            />
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-muted/30">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Simple as 1, 2, 3
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-terracotta-500 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold text-foreground mb-2">Add a task</h3>
              <p className="text-sm text-muted-foreground">
                Write down what you need to do. Big or small, every task counts.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-terracotta-500 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                Complete it
              </h3>
              <p className="text-sm text-muted-foreground">
                Check off your task and watch the confetti fly. You earned it!
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-terracotta-500 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold text-foreground mb-2">Level up</h3>
              <p className="text-sm text-muted-foreground">
                Earn XP, unlock achievements, and become the productivity
                master.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-terracotta-500">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to make productivity fun?
          </h2>
          <p className="text-terracotta-100 mb-8 max-w-xl mx-auto">
            Join now and start turning your tasks into achievements. It&apos;s
            free to get started.
          </p>
          <Link href="/login">
            <Button
              size="lg"
              className="bg-white text-terracotta-600 hover:bg-terracotta-50 px-8"
            >
              Start Your Journey
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-background border-t border-border">
        <div className="container max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>My Mind Matters - Productivity, built with kindness.</p>
        </div>
      </footer>
    </div>
  );
}

// Stat card component for analytics
function StatCard({
  icon,
  label,
  value,
  subtext,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-terracotta-100 flex items-center justify-center text-terracotta-600">
        {icon}
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-xl font-bold text-foreground">{value}</p>
        {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
      </div>
    </div>
  );
}

// Dashboard for logged-in users
function Dashboard() {
  const { user } = useAuth();
  const { level, nextLevel, currentLevelXP, xpToNextLevel, progress, addXP, streak, totalXP } =
    useGame();
  const [tasks, setTasks] = useState<LocalTask[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [showReward, setShowReward] = useState(false);
  const [lastEarnedXP, setLastEarnedXP] = useState(0);
  const [onboardingStep, setOnboardingStep] = useState<
    "input" | "task" | "complete"
  >("input");

  // Fetch completed tasks for analytics
  useEffect(() => {
    if (user) {
      getCompletedTasks(user.id).then(setCompletedTasks);
    }
  }, [user]);

  // Calculate analytics
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const tasksCompletedToday = completedTasks.filter((t) => {
    if (!t.completed_at) return false;
    return new Date(t.completed_at) >= startOfToday;
  });

  const tasksCompletedThisWeek = completedTasks.filter((t) => {
    if (!t.completed_at) return false;
    return new Date(t.completed_at) >= startOfWeek;
  });

  const tasksCompletedThisMonth = completedTasks.filter((t) => {
    if (!t.completed_at) return false;
    return new Date(t.completed_at) >= startOfMonth;
  });

  const xpEarnedToday = tasksCompletedToday.reduce((sum, t) => sum + t.xp, 0);
  const xpEarnedThisWeek = tasksCompletedThisWeek.reduce((sum, t) => sum + t.xp, 0);

  const handleTaskCreate = useCallback((taskTitle: string) => {
    const newTask: LocalTask = {
      id: crypto.randomUUID(),
      title: taskTitle,
      xp: XP_PER_TASK,
      completed: false,
    };
    setTasks((prev) => [...prev, newTask]);
    setOnboardingStep("task");
  }, []);

  const handleTaskComplete = useCallback(
    (taskId: string) => {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, completed: true } : task
        )
      );

      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        setLastEarnedXP(task.xp);
        addXP(task.xp);
        setShowReward(true);
        setOnboardingStep("complete");
      }
    },
    [tasks, addXP]
  );

  const handleRewardComplete = useCallback(() => {
    setShowReward(false);
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] font-sans">
      <RewardAnimation
        xp={lastEarnedXP}
        show={showReward}
        onComplete={handleRewardComplete}
      />

      <main className="w-full max-w-5xl mx-auto py-8 px-6">
        {/* Analytics Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Your Progress</h2>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={<Zap className="w-5 h-5" />}
              label="XP Today"
              value={`+${xpEarnedToday}`}
              subtext={`${tasksCompletedToday.length} tasks`}
            />
            <StatCard
              icon={<Calendar className="w-5 h-5" />}
              label="XP This Week"
              value={`+${xpEarnedThisWeek}`}
              subtext={`${tasksCompletedThisWeek.length} tasks`}
            />
            <StatCard
              icon={<Flame className="w-5 h-5" />}
              label="Current Streak"
              value={`${streak} day${streak !== 1 ? "s" : ""}`}
              subtext="Keep it going!"
            />
            <StatCard
              icon={<CheckCircle2 className="w-5 h-5" />}
              label="Tasks Today"
              value={tasksCompletedToday.length}
              subtext={`${xpEarnedToday} XP earned`}
            />
          </div>

          {/* Level Progress */}
          <div className="bg-card border border-border rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{level.icon}</span>
                <div>
                  <p className="font-semibold text-foreground">{level.name}</p>
                  <p className="text-sm text-muted-foreground">Level {level.level}</p>
                </div>
              </div>
              {nextLevel && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Next: {nextLevel.name}</p>
                  <p className="text-sm text-terracotta-500 font-medium">{xpToNextLevel} XP to go</p>
                </div>
              )}
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div
                className="bg-terracotta-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {totalXP} total XP • {currentLevelXP} / {currentLevelXP + xpToNextLevel} XP in current level
            </p>
          </div>

          {/* Recent Completed Tasks This Month */}
          {tasksCompletedThisMonth.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Target className="w-4 h-4 text-terracotta-500" />
                  Recent Completions This Month
                </h3>
                <span className="text-sm text-muted-foreground">
                  {tasksCompletedThisMonth.length} tasks
                </span>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {tasksCompletedThisMonth.slice(0, 10).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-foreground truncate max-w-[200px] md:max-w-[400px]">
                        {task.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-terracotta-500 font-medium">+{task.xp} XP</span>
                      <span className="text-xs text-muted-foreground">
                        {task.completed_at
                          ? new Date(task.completed_at).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })
                          : ""}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {tasksCompletedThisMonth.length > 10 && (
                <Link
                  href="/tasks"
                  className="block text-center text-sm text-terracotta-500 hover:text-terracotta-600 mt-3"
                >
                  View all {tasksCompletedThisMonth.length} completed tasks →
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Quick Add Section */}
        <div className="flex flex-col items-center gap-6 text-center w-full">
          <p className="text-xl text-muted-foreground max-w-md">
            Getting things done doesn't have to be daunting.
          </p>

          {/* Quick Start Options */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Quick start:</p>
            <div className="w-full flex flex-wrap justify-center gap-2">
              {[
                "Drink a glass of water",
                "Take a 5-minute walk",
                "Tidy up my desk",
                "Read for 10 minutes",
                "Do 10 push-ups",
              ].map((task) => (
                <button
                  key={task}
                  onClick={() => handleTaskCreate(task)}
                  className="px-3 py-1.5 text-sm bg-muted cursor-pointer hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-full border border-border hover:border-terracotta-300 transition-colors"
                >
                  + {task}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Task Input */}
          <div className="w-full mt-4">
            {tasks.length === 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Or type your own task below
                </p>
                <QuickTaskInput onTaskCreate={handleTaskCreate} />
                <p className="text-xs text-muted-foreground">
                  Complete it to earn your first{" "}
                  <span className="text-terracotta-500 font-semibold">
                    +{XP_PER_TASK} XP
                  </span>
                </p>
              </div>
            ) : (
              <QuickTaskInput
                onTaskCreate={handleTaskCreate}
                className="mb-6"
              />
            )}
          </div>

          {/* Task List */}
          {tasks.length > 0 && (
            <div className="w-full space-y-3 animate-in fade-in slide-in-from-bottom duration-500">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={handleTaskComplete}
                />
              ))}
            </div>
          )}

          {/* Feature hints after completing first task */}
          {onboardingStep === "complete" && (
            <div className="flex flex-wrap justify-center gap-4 mt-8 animate-in fade-in duration-700 delay-500">
              <FeatureTooltip
                title="Daily Streaks"
                description="Keep your streak alive by completing tasks every day!"
                icon="🔥"
                position="top"
              >
                <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-sm cursor-default">
                  <span>🔥</span>
                  <span className="text-muted-foreground">0 day streak</span>
                </div>
              </FeatureTooltip>

              <FeatureTooltip
                title="Achievements"
                description="Unlock badges and rewards as you progress!"
                icon="🏆"
                position="top"
              >
                <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-sm cursor-default">
                  <span>🏆</span>
                  <span className="text-muted-foreground">0 achievements</span>
                </div>
              </FeatureTooltip>

              <FeatureTooltip
                title="Leaderboard"
                description="Compete with friends and climb the ranks!"
                icon="📊"
                position="top"
              >
                <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-sm cursor-default">
                  <span>📊</span>
                  <span className="text-muted-foreground">Leaderboard</span>
                </div>
              </FeatureTooltip>
            </div>
          )}

          {/* Navigation Links */}
          <div className="flex gap-4 mt-8">
            <Link
              href="/tasks"
              className="text-primary underline hover:text-primary/80"
            >
              All Tasks
            </Link>
            <Link
              href="/achievements"
              className="text-primary underline hover:text-primary/80"
            >
              Achievements
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Show landing page for logged-out users
  if (!user) {
    return <LandingPage />;
  }

  // Show dashboard for logged-in users
  return <Dashboard />;
}
