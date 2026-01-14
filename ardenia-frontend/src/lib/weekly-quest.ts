import { createClient } from "@/lib/supabase/client";
import type {
  WeeklyQuest,
  WeeklyQuestTask,
  WeeklyQuestWithTasks,
  WeeklyQuestCreate,
  OverwhelmLevel,
} from "@/lib/types/database";
import {
  OVERWHELM_LEVELS,
  WEEKLY_QUEST_XP_MULTIPLIER,
} from "@/lib/constants/weekly-quest";

// Calculate week boundaries based on user's reset day
export function getWeekBoundaries(resetDay: number): { start: Date; end: Date } {
  const now = new Date();
  const currentDay = now.getDay();

  // Calculate days since last reset day
  let daysSinceReset = currentDay - resetDay;
  if (daysSinceReset < 0) daysSinceReset += 7;

  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - daysSinceReset);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return { start: weekStart, end: weekEnd };
}

// Get days remaining in current week
export function getDaysRemaining(weekEnd: string): number {
  const end = new Date(weekEnd);
  end.setHours(23, 59, 59, 999);
  const now = new Date();
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

// Get current active weekly quest
export async function getCurrentWeeklyQuest(
  userId: string
): Promise<WeeklyQuestWithTasks | null> {
  const supabase = createClient();

  const { data: quest, error } = await supabase
    .from("weekly_quests")
    .select(
      `
      *,
      tasks:weekly_quest_tasks(*)
    `
    )
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !quest) return null;
  return quest as WeeklyQuestWithTasks;
}

// Create a new weekly quest
export async function createWeeklyQuest(
  userId: string,
  resetDay: number,
  questData: WeeklyQuestCreate
): Promise<{ success: boolean; quest?: WeeklyQuestWithTasks; error?: string }> {
  const supabase = createClient();
  const { start, end } = getWeekBoundaries(resetDay);

  const targetCount = OVERWHELM_LEVELS[questData.overwhelm_level].taskCount;

  // Create the quest
  const { data: quest, error: questError } = await supabase
    .from("weekly_quests")
    .insert({
      user_id: userId,
      overwhelm_level: questData.overwhelm_level,
      week_start: start.toISOString().split("T")[0],
      week_end: end.toISOString().split("T")[0],
      target_task_count: targetCount,
      xp_multiplier: WEEKLY_QUEST_XP_MULTIPLIER,
    })
    .select()
    .single();

  if (questError) {
    return { success: false, error: questError.message };
  }

  // Create quest tasks
  const questTasks = questData.tasks.map((task) => ({
    weekly_quest_id: quest.id,
    task_id: task.task_id || null,
    title: task.title,
    description: task.description || null,
    xp: task.xp || 10,
    source: task.source,
  }));

  const { data: tasks, error: tasksError } = await supabase
    .from("weekly_quest_tasks")
    .insert(questTasks)
    .select();

  if (tasksError) {
    // Rollback quest creation
    await supabase.from("weekly_quests").delete().eq("id", quest.id);
    return { success: false, error: tasksError.message };
  }

  return {
    success: true,
    quest: { ...quest, tasks } as WeeklyQuestWithTasks,
  };
}

// Add a task to an existing quest
export async function addTaskToQuest(
  questId: string,
  task: {
    task_id?: string;
    title: string;
    description?: string;
    xp?: number;
    source: "existing" | "new";
  }
): Promise<{ success: boolean; task?: WeeklyQuestTask; error?: string }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("weekly_quest_tasks")
    .insert({
      weekly_quest_id: questId,
      task_id: task.task_id || null,
      title: task.title,
      description: task.description || null,
      xp: task.xp || 10,
      source: task.source,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, task: data };
}

// Complete a quest task
export async function completeQuestTask(
  questTaskId: string
): Promise<{
  success: boolean;
  questCompleted?: boolean;
  bonusXP?: number;
  error?: string;
}> {
  const supabase = createClient();

  // Mark task as completed
  const { data: task, error: taskError } = await supabase
    .from("weekly_quest_tasks")
    .update({
      completed: true,
      completed_at: new Date().toISOString(),
    })
    .eq("id", questTaskId)
    .select("weekly_quest_id, xp")
    .single();

  if (taskError) {
    return { success: false, error: taskError.message };
  }

  // Get updated quest with all tasks
  const { data: quest, error: questError } = await supabase
    .from("weekly_quests")
    .select("*, tasks:weekly_quest_tasks(*)")
    .eq("id", task.weekly_quest_id)
    .single();

  if (questError) {
    return { success: false, error: questError.message };
  }

  const completedCount = quest.tasks.filter(
    (t: WeeklyQuestTask) => t.completed
  ).length;

  // Check if quest is now completed
  const questCompleted = completedCount >= quest.target_task_count;
  let bonusXP = 0;

  if (questCompleted && quest.status === "active") {
    // Calculate bonus XP
    const totalTaskXP = quest.tasks
      .filter((t: WeeklyQuestTask) => t.completed)
      .reduce((sum: number, t: WeeklyQuestTask) => sum + t.xp, 0);
    bonusXP = Math.floor(totalTaskXP * (quest.xp_multiplier - 1));

    // Update quest status
    await supabase
      .from("weekly_quests")
      .update({
        status: "completed",
        completed_task_count: completedCount,
        bonus_xp_earned: bonusXP,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", task.weekly_quest_id);
  } else {
    // Just update the count
    await supabase
      .from("weekly_quests")
      .update({
        completed_task_count: completedCount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", task.weekly_quest_id);
  }

  return { success: true, questCompleted, bonusXP };
}

// Uncomplete a quest task
export async function uncompleteQuestTask(
  questTaskId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { data: task, error: taskError } = await supabase
    .from("weekly_quest_tasks")
    .update({
      completed: false,
      completed_at: null,
    })
    .eq("id", questTaskId)
    .select("weekly_quest_id")
    .single();

  if (taskError) {
    return { success: false, error: taskError.message };
  }

  // Update quest completed count
  const { data: quest } = await supabase
    .from("weekly_quests")
    .select("*, tasks:weekly_quest_tasks(*)")
    .eq("id", task.weekly_quest_id)
    .single();

  if (quest) {
    const completedCount = quest.tasks.filter(
      (t: WeeklyQuestTask) => t.completed
    ).length;

    await supabase
      .from("weekly_quests")
      .update({
        completed_task_count: completedCount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", task.weekly_quest_id);
  }

  return { success: true };
}

// Get quest history
export async function getQuestHistory(
  userId: string,
  limit = 10
): Promise<WeeklyQuestWithTasks[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("weekly_quests")
    .select(`*, tasks:weekly_quest_tasks(*)`)
    .eq("user_id", userId)
    .neq("status", "active")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return data as WeeklyQuestWithTasks[];
}

// Abandon current quest
export async function abandonQuest(
  questId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { error } = await supabase
    .from("weekly_quests")
    .update({
      status: "abandoned",
      updated_at: new Date().toISOString(),
    })
    .eq("id", questId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

// Check for expired quests (to be called on page load)
export async function checkExpiredQuests(userId: string): Promise<void> {
  const supabase = createClient();
  const today = new Date().toISOString().split("T")[0];

  await supabase
    .from("weekly_quests")
    .update({
      status: "failed",
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("status", "active")
    .lt("week_end", today);
}

// Delete a task from quest
export async function deleteQuestTask(
  taskId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { error } = await supabase
    .from("weekly_quest_tasks")
    .delete()
    .eq("id", taskId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
