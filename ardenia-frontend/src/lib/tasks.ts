import { createClient } from "@/lib/supabase/client";
import type { Task, TaskCreate, TaskUpdate } from "@/lib/types/database";

// Get all tasks for a user
export async function getTasks(userId: string): Promise<Task[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }

  return data || [];
}

// Get incomplete tasks
export async function getIncompleteTasks(userId: string): Promise<Task[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .eq("completed", false)
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching incomplete tasks:", error);
    return [];
  }

  return data || [];
}

// Get completed tasks
export async function getCompletedTasks(userId: string): Promise<Task[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .eq("completed", true)
    .order("completed_at", { ascending: false });

  if (error) {
    console.error("Error fetching completed tasks:", error);
    return [];
  }

  return data || [];
}

// Create a new task
export async function createTask(
  userId: string,
  task: TaskCreate
): Promise<{ success: boolean; task?: Task; error?: string }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      user_id: userId,
      title: task.title,
      description: task.description || null,
      priority: task.priority || null,
      due_date: task.due_date || null,
      xp: task.xp || 10,
      completed: false,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating task:", error);
    return { success: false, error: error.message };
  }

  return { success: true, task: data };
}

// Update a task
export async function updateTask(
  taskId: string,
  updates: TaskUpdate
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { error } = await supabase
    .from("tasks")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId);

  if (error) {
    console.error("Error updating task:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Toggle task completion
export async function toggleTaskCompletion(
  taskId: string,
  completed: boolean
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { error } = await supabase
    .from("tasks")
    .update({
      completed,
      completed_at: completed ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId);

  if (error) {
    console.error("Error toggling task:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Delete a task
export async function deleteTask(
  taskId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId);

  if (error) {
    console.error("Error deleting task:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
