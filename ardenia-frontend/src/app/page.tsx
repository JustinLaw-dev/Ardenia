"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useGame } from "@/contexts/GameContext";
import {
  QuickTaskInput,
  TaskCard,
  XPProgress,
  RewardAnimation,
  FeatureTooltip,
} from "@/components/onboarding";

interface Task {
  id: string;
  title: string;
  xp: number;
  completed: boolean;
}

const XP_PER_TASK = 50;

export default function Home() {
  const { user, loading, signOut } = useAuth();
  const { level, nextLevel, currentLevelXP, xpToNextLevel, progress, addXP } =
    useGame();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showReward, setShowReward] = useState(false);
  const [lastEarnedXP, setLastEarnedXP] = useState(0);
  const [onboardingStep, setOnboardingStep] = useState<
    "input" | "task" | "complete"
  >("input");

  const handleTaskCreate = useCallback((taskTitle: string) => {
    const newTask: Task = {
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center font-sans">
      <RewardAnimation
        xp={lastEarnedXP}
        show={showReward}
        onComplete={handleRewardComplete}
      />

      <main className="flex min-h-screen w-full max-w-2xl flex-col items-center justify-center py-8 px-6">
        {/* XP Progress - shows after first task */}
        {tasks.length > 0 && (
          <div className="w-full mb-8 animate-in fade-in slide-in-from-top duration-500">
            <FeatureTooltip
              title="Your Progress"
              description="Complete tasks to earn XP and level up!"
              icon="📈"
              position="bottom"
              showOnMount={onboardingStep === "task"}
            >
              <XPProgress
                currentXP={currentLevelXP}
                level={level}
                nextLevel={nextLevel}
                xpToNextLevel={xpToNextLevel}
                progress={progress}
                className="w-full"
              />
            </FeatureTooltip>
          </div>
        )}

        {/* Hero Section */}
        <div className="flex flex-col items-center gap-6 text-center w-full">
          <p className="text-xl text-muted-foreground max-w-md">
            Get things done,{" "}
            <span className="text-foreground font-semibold">the fun way.</span>
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
            <a
              href="/tasks"
              className="text-primary underline hover:text-primary/80"
            >
              All Tasks
            </a>
            <a
              href="/gamify"
              className="text-primary underline hover:text-primary/80"
            >
              Gamify Doc
            </a>
          </div>

          {/* Sign out */}
          {user && (
            <button
              onClick={signOut}
              className="text-terracotta-500 bg-terracotta-100 border-terracotta-500 px-4 py-2 rounded-full border cursor-pointer hover:bg-terracotta-200 transition-colors mt-4"
            >
              Sign out
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
