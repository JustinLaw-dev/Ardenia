"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useGame } from "@/contexts/GameContext";
import { Loader2, Trophy, Lock, CheckCircle, Flame, Star } from "lucide-react";
import type { Achievement } from "@/lib/types/database";

interface AchievementCardProps {
  achievement: Achievement;
  isEarned: boolean;
  earnedAt?: string;
}

function AchievementCard({ achievement, isEarned, earnedAt }: AchievementCardProps) {
  return (
    <div
      className={`relative p-4 rounded-lg border transition-all ${
        isEarned
          ? "bg-card border-terracotta-300 shadow-sm"
          : "bg-muted/30 border-border opacity-60"
      }`}
    >
      {/* Earned badge */}
      {isEarned && (
        <div className="absolute -top-2 -right-2">
          <CheckCircle className="w-6 h-6 text-terracotta-500 fill-terracotta-100" />
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={`flex items-center justify-center w-12 h-12 rounded-full text-2xl ${
            isEarned ? "bg-terracotta-100" : "bg-muted"
          }`}
        >
          {isEarned ? (
            achievement.icon || "🏆"
          ) : (
            <Lock className="w-5 h-5 text-muted-foreground" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3
            className={`font-medium ${
              isEarned ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {achievement.name}
          </h3>
          {achievement.description && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {achievement.description}
            </p>
          )}

          <div className="flex items-center gap-3 mt-2">
            {/* XP Reward */}
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                isEarned
                  ? "bg-terracotta-100 text-terracotta-700"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              +{achievement.xp_reward} XP
            </span>

            {/* Earned date */}
            {isEarned && earnedAt && (
              <span className="text-xs text-muted-foreground">
                Earned {new Date(earnedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AchievementsPage() {
  const { user, loading: authLoading } = useAuth();
  const {
    achievements: userAchievements,
    allAchievements,
    totalXP,
    level,
    streak,
    progress,
    loading: gameLoading,
  } = useGame();

  const loading = authLoading || gameLoading;

  // Create a map of earned achievements for quick lookup
  const earnedMap = new Map(
    userAchievements.map((ua) => [ua.achievement_id, ua.earned_at])
  );

  // Calculate stats
  const earnedCount = userAchievements.length;
  const totalCount = allAchievements.length;
  const earnedXP = userAchievements.reduce(
    (sum, ua) => sum + (ua.achievement?.xp_reward || 0),
    0
  );

  // Sort achievements: earned first, then by XP reward
  const sortedAchievements = [...allAchievements].sort((a, b) => {
    const aEarned = earnedMap.has(a.id);
    const bEarned = earnedMap.has(b.id);
    if (aEarned !== bEarned) return aEarned ? -1 : 1;
    return b.xp_reward - a.xp_reward;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Please log in to view achievements.</p>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-6">Achievements</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* Level */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <span className="text-xl">{level.icon}</span>
            <span className="text-sm font-medium">Level</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{level.name}</p>
          <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-terracotta-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Total XP */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Star className="w-4 h-4" />
            <span className="text-sm font-medium">Total XP</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {totalXP.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {earnedXP.toLocaleString()} from achievements
          </p>
        </div>

        {/* Streak */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Flame className="w-4 h-4" />
            <span className="text-sm font-medium">Streak</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{streak} days</p>
          <p className="text-xs text-muted-foreground mt-1">Keep it going!</p>
        </div>

        {/* Achievements */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Trophy className="w-4 h-4" />
            <span className="text-sm font-medium">Achievements</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {earnedCount}/{totalCount}
          </p>
          <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-terracotta-500 transition-all"
              style={{
                width: totalCount > 0 ? `${(earnedCount / totalCount) * 100}%` : "0%",
              }}
            />
          </div>
        </div>
      </div>

      {/* Achievements Grid */}
      {allAchievements.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-lg">
          <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No achievements yet
          </h3>
          <p className="text-muted-foreground">
            Achievements will appear here as they become available.
          </p>
        </div>
      ) : (
        <>
          {/* Earned Section */}
          {earnedCount > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-terracotta-500" />
                Earned ({earnedCount})
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {sortedAchievements
                  .filter((a) => earnedMap.has(a.id))
                  .map((achievement) => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                      isEarned={true}
                      earnedAt={earnedMap.get(achievement.id)}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Locked Section */}
          {earnedCount < totalCount && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-muted-foreground" />
                Locked ({totalCount - earnedCount})
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {sortedAchievements
                  .filter((a) => !earnedMap.has(a.id))
                  .map((achievement) => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                      isEarned={false}
                    />
                  ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
