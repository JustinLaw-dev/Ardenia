import { createClient } from "@/lib/supabase/client";
import type { Achievement, UserAchievement } from "@/lib/types/database";

// Achievement condition checker type
type AchievementCondition = (stats: UserStats) => boolean;

export interface UserStats {
  totalXP: number;
  tasksCompleted: number;
  streak: number;
  friendsCount: number;
  userId: string;
  // Weekly Quest stats
  weeklyQuestsCompleted: number;
  fullQuestsCompleted: number;
  consecutiveQuestsCompleted: number;
}

// Define achievement conditions by achievement name
// These match the achievements in your database
const ACHIEVEMENT_CONDITIONS: Record<string, AchievementCondition> = {
  // Task-based achievements
  "First Task": (stats) => stats.tasksCompleted >= 1,
  "Getting Started": (stats) => stats.tasksCompleted >= 5,
  "Task Master": (stats) => stats.tasksCompleted >= 10,
  "Productivity Pro": (stats) => stats.tasksCompleted >= 25,
  "Task Legend": (stats) => stats.tasksCompleted >= 50,
  "Century Club": (stats) => stats.tasksCompleted >= 100,

  // XP-based achievements
  "XP Beginner": (stats) => stats.totalXP >= 100,
  "XP Collector": (stats) => stats.totalXP >= 500,
  "XP Hunter": (stats) => stats.totalXP >= 1000,
  "XP Master": (stats) => stats.totalXP >= 5000,

  // Streak-based achievements
  "On Fire": (stats) => stats.streak >= 3,
  "Week Warrior": (stats) => stats.streak >= 7,
  "Streak Master": (stats) => stats.streak >= 14,
  "Monthly Champion": (stats) => stats.streak >= 30,
  "It's Your Year": (stats) => stats.streak >= 30,

  // Social achievements
  "Social Butterfly": (stats) => stats.friendsCount >= 1,
  Popular: (stats) => stats.friendsCount >= 5,
  Influencer: (stats) => stats.friendsCount >= 10,

  // Weekly Quest achievements
  "Quest Beginner": (stats) => stats.weeklyQuestsCompleted >= 1,
  "Quest Veteran": (stats) => stats.weeklyQuestsCompleted >= 5,
  "Quest Master": (stats) => stats.weeklyQuestsCompleted >= 10,
  "Full Throttle": (stats) => stats.fullQuestsCompleted >= 1,
  "Consistency King": (stats) => stats.consecutiveQuestsCompleted >= 4,
};

// Get user stats from database
export async function getUserStats(userId: string): Promise<UserStats> {
  const supabase = createClient();

  // Fetch completed tasks count
  const { count: tasksCompleted } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("completed", true);

  // Fetch user progress (XP, streak)
  const { data: progress } = await supabase
    .from("user_progress")
    .select("total_xp, streak")
    .eq("user_id", userId)
    .single();

  // Fetch friends count
  const { count: friendsCount } = await supabase
    .from("friendships")
    .select("*", { count: "exact", head: true })
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
    .eq("status", "accepted");

  // Fetch weekly quest stats
  const { data: completedQuests } = await supabase
    .from("weekly_quests")
    .select("overwhelm_level, completed_at")
    .eq("user_id", userId)
    .eq("status", "completed")
    .order("completed_at", { ascending: false });

  const weeklyQuestsCompleted = completedQuests?.length || 0;
  const fullQuestsCompleted =
    completedQuests?.filter((q) => q.overwhelm_level === "full").length || 0;

  // Calculate consecutive quests completed (simplified: just count recent completed quests)
  let consecutiveQuestsCompleted = 0;
  if (completedQuests && completedQuests.length > 0) {
    // Count consecutive completed quests (this is a simplified version)
    // A more accurate version would check week boundaries
    consecutiveQuestsCompleted = completedQuests.length;
  }

  return {
    userId,
    tasksCompleted: tasksCompleted || 0,
    totalXP: progress?.total_xp || 0,
    streak: progress?.streak || 0,
    friendsCount: friendsCount || 0,
    weeklyQuestsCompleted,
    fullQuestsCompleted,
    consecutiveQuestsCompleted,
  };
}

// Check and award achievements
export async function checkAndAwardAchievements(
  userId: string
): Promise<{ newAchievements: Achievement[]; error?: string }> {
  const supabase = createClient();
  const newAchievements: Achievement[] = [];

  try {
    // Get user stats
    const stats = await getUserStats(userId);

    // Get all achievements
    const { data: allAchievements, error: achievementsError } = await supabase
      .from("achievements")
      .select("*");

    if (achievementsError) {
      console.error("Error fetching achievements:", achievementsError);
      return { newAchievements: [], error: achievementsError.message };
    }

    // Get user's earned achievements
    const { data: earnedAchievements, error: earnedError } = await supabase
      .from("user_achievements")
      .select("achievement_id")
      .eq("user_id", userId);

    if (earnedError) {
      console.error("Error fetching earned achievements:", earnedError);
      return { newAchievements: [], error: earnedError.message };
    }

    const earnedIds = new Set(
      earnedAchievements?.map((ea) => ea.achievement_id) || []
    );

    // Check each achievement
    for (const achievement of allAchievements || []) {
      // Skip if already earned
      if (earnedIds.has(achievement.id)) continue;

      // Get the condition checker for this achievement
      const checkCondition = ACHIEVEMENT_CONDITIONS[achievement.name];
      if (!checkCondition) {
        // No condition defined for this achievement
        continue;
      }

      // Check if condition is met
      if (checkCondition(stats)) {
        // Award the achievement
        const { error: awardError } = await supabase
          .from("user_achievements")
          .insert({
            user_id: userId,
            achievement_id: achievement.id,
          });

        if (awardError) {
          // Might be a race condition (already awarded), skip
          if (awardError.code !== "23505") {
            console.error("Error awarding achievement:", awardError);
          }
          continue;
        }

        // Add XP reward
        if (achievement.xp_reward > 0) {
          await supabase.rpc("add_user_xp", {
            p_user_id: userId,
            p_amount: achievement.xp_reward,
          });
        }

        newAchievements.push(achievement);
      }
    }

    return { newAchievements };
  } catch (error) {
    console.error("Error checking achievements:", error);
    return { newAchievements: [], error: String(error) };
  }
}

// Seed default achievements (run once to populate the achievements table)
export const DEFAULT_ACHIEVEMENTS = [
  // Task achievements
  {
    name: "First Steps",
    description: "Complete your first task",
    icon: "👣",
    xp_reward: 10,
  },
  {
    name: "Getting Started",
    description: "Complete 5 tasks",
    icon: "🚀",
    xp_reward: 25,
  },
  {
    name: "Task Master",
    description: "Complete 10 tasks",
    icon: "✅",
    xp_reward: 50,
  },
  {
    name: "Productivity Pro",
    description: "Complete 25 tasks",
    icon: "💪",
    xp_reward: 100,
  },
  {
    name: "Task Legend",
    description: "Complete 50 tasks",
    icon: "🏆",
    xp_reward: 200,
  },
  {
    name: "Century Club",
    description: "Complete 100 tasks",
    icon: "💯",
    xp_reward: 500,
  },

  // XP achievements
  {
    name: "XP Beginner",
    description: "Earn 100 XP",
    icon: "⭐",
    xp_reward: 10,
  },
  {
    name: "XP Collector",
    description: "Earn 500 XP",
    icon: "🌟",
    xp_reward: 25,
  },
  {
    name: "XP Hunter",
    description: "Earn 1,000 XP",
    icon: "💫",
    xp_reward: 50,
  },
  {
    name: "XP Master",
    description: "Earn 5,000 XP",
    icon: "✨",
    xp_reward: 100,
  },

  // Streak achievements
  {
    name: "On Fire",
    description: "Maintain a 3-day streak",
    icon: "🔥",
    xp_reward: 15,
  },
  {
    name: "Week Warrior",
    description: "Maintain a 7-day streak",
    icon: "📅",
    xp_reward: 50,
  },
  {
    name: "Streak Master",
    description: "Maintain a 14-day streak",
    icon: "⚡",
    xp_reward: 100,
  },
  {
    name: "Monthly Champion",
    description: "Maintain a 30-day streak",
    icon: "👑",
    xp_reward: 250,
  },

  // Social achievements
  {
    name: "Social Butterfly",
    description: "Add your first friend",
    icon: "🦋",
    xp_reward: 10,
  },
  { name: "Popular", description: "Have 5 friends", icon: "🤝", xp_reward: 25 },
  {
    name: "Influencer",
    description: "Have 10 friends",
    icon: "🌐",
    xp_reward: 50,
  },

  // Weekly Quest achievements
  {
    name: "Quest Beginner",
    description: "Complete your first Weekly Quest",
    icon: "📜",
    xp_reward: 50,
  },
  {
    name: "Quest Veteran",
    description: "Complete 5 Weekly Quests",
    icon: "⚔️",
    xp_reward: 100,
  },
  {
    name: "Quest Master",
    description: "Complete 10 Weekly Quests",
    icon: "🗡️",
    xp_reward: 250,
  },
  {
    name: "Full Throttle",
    description: "Complete a Full difficulty Weekly Quest",
    icon: "💪",
    xp_reward: 75,
  },
  {
    name: "Consistency King",
    description: "Complete 4 Weekly Quests in a row",
    icon: "👑",
    xp_reward: 200,
  },
];
