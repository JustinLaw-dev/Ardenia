"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useAuth } from "./AuthContext";
import { createClient } from "@/lib/supabase/client";
import type { UserProgress, Achievement, UserAchievement } from "@/lib/types/database";
import { getLevelProgress, type LevelDefinition } from "@/lib/constants/levels";
import { checkAndAwardAchievements } from "@/lib/achievements";

interface GameContextType {
  totalXP: number;
  level: LevelDefinition;
  nextLevel: LevelDefinition | null;
  currentLevelXP: number;
  xpToNextLevel: number;
  progress: number; // 0-100 percentage
  addXP: (amount: number) => Promise<void>;
  checkAchievements: () => Promise<Achievement[]>;
  streak: number;
  achievements: UserAchievement[];
  allAchievements: Achievement[];
  loading: boolean;
  refreshProgress: () => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const totalXP = userProgress?.total_xp ?? 0;
  const streak = userProgress?.streak ?? 0;

  // Calculate level info from total XP
  const levelInfo = useMemo(() => getLevelProgress(totalXP), [totalXP]);

  // Calculate streak based on last activity
  const calculateStreak = useCallback(
    (lastActivityDate: string | null, currentStreak: number): number => {
      if (!lastActivityDate) return 1; // First activity

      // Get today's date string in local timezone (YYYY-MM-DD)
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

      // lastActivityDate is already in YYYY-MM-DD format
      if (lastActivityDate === todayStr) {
        // Same day, keep streak unchanged
        return currentStreak;
      }

      // Parse both dates as local dates for comparison
      const [lastYear, lastMonth, lastDay] = lastActivityDate.split("-").map(Number);
      const lastDate = new Date(lastYear, lastMonth - 1, lastDay);
      const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      const diffTime = todayDate.getTime() - lastDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day, increment streak
        return currentStreak + 1;
      } else {
        // Streak broken (more than 1 day gap), reset to 1
        return 1;
      }
    },
    []
  );

  // Fetch user progress from Supabase
  const fetchProgress = useCallback(async () => {
    if (!user) {
      setUserProgress(null);
      setAchievements([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Fetch user progress
      const { data: progressData, error: progressError } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (progressError && progressError.code !== "PGRST116") {
        console.error("Error fetching progress:", progressError);
      }

      // If no progress exists, create one
      if (!progressData) {
        const { data: newProgress, error: insertError } = await supabase
          .from("user_progress")
          .insert({ user_id: user.id, total_xp: 0, streak: 0 })
          .select()
          .single();

        if (insertError) {
          console.error("Error creating progress:", insertError);
        } else {
          setUserProgress(newProgress);
        }
      } else {
        setUserProgress(progressData);
      }

      // Fetch user achievements with achievement details
      const { data: userAchievements, error: achievementsError } = await supabase
        .from("user_achievements")
        .select("*, achievement:achievements(*)")
        .eq("user_id", user.id);

      if (achievementsError) {
        console.error("Error fetching achievements:", achievementsError);
      } else {
        setAchievements(userAchievements || []);
      }

      // Fetch all available achievements
      const { data: allAchievementsData } = await supabase
        .from("achievements")
        .select("*");

      setAllAchievements(allAchievementsData || []);
    } catch (error) {
      console.error("Error in fetchProgress:", error);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  // Fetch progress when user changes
  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // Add XP and update streak
  const addXP = useCallback(
    async (amount: number) => {
      if (!user || !userProgress) return;

      const today = new Date().toISOString().split("T")[0];
      const newStreak = calculateStreak(userProgress.last_activity_date, userProgress.streak);
      const newTotalXP = userProgress.total_xp + amount;

      // Optimistic update
      setUserProgress((prev) =>
        prev
          ? {
              ...prev,
              total_xp: newTotalXP,
              streak: newStreak,
              last_activity_date: today,
            }
          : prev
      );

      // Update in database
      const { error } = await supabase
        .from("user_progress")
        .update({
          total_xp: newTotalXP,
          streak: newStreak,
          last_activity_date: today,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) {
        console.error("Error updating XP:", error);
        // Revert on error
        fetchProgress();
      }
    },
    [user, userProgress, supabase, calculateStreak, fetchProgress]
  );

  // Check and award achievements
  const checkAchievements = useCallback(async (): Promise<Achievement[]> => {
    if (!user) return [];

    const { newAchievements } = await checkAndAwardAchievements(user.id);

    if (newAchievements.length > 0) {
      // Refresh to get updated achievements list and XP
      await fetchProgress();
    }

    return newAchievements;
  }, [user, fetchProgress]);

  return (
    <GameContext.Provider
      value={{
        totalXP,
        level: levelInfo.current,
        nextLevel: levelInfo.next,
        currentLevelXP: levelInfo.currentLevelXP,
        xpToNextLevel: levelInfo.xpToNextLevel,
        progress: levelInfo.progress,
        addXP,
        checkAchievements,
        streak,
        achievements,
        allAchievements,
        loading,
        refreshProgress: fetchProgress,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
