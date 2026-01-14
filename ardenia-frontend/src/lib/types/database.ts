export interface UserProgress {
  id: string;
  user_id: string;
  total_xp: number;
  streak: number;
  last_activity_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  xp_reward: number;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  achievement?: Achievement;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high' | null;
  due_date: string | null;
  xp: number;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type TaskCreate = Omit<Task, 'id' | 'user_id' | 'completed_at' | 'created_at' | 'updated_at'>;
export type TaskUpdate = Partial<Omit<Task, 'id' | 'user_id' | 'created_at'>>;

export type FriendshipStatus = 'pending' | 'accepted' | 'blocked';

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
  created_at: string;
  updated_at: string;
}

export interface FriendWithProfile {
  friendship_id: string;
  user_id: string;
  username: string | null;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  total_xp: number;
  streak: number;
  status: FriendshipStatus;
  is_requester: boolean;
}

// Weekly Quest Types
export type OverwhelmLevel = 'light' | 'medium' | 'full';
export type WeeklyQuestStatus = 'active' | 'completed' | 'failed' | 'abandoned';
export type WeeklyTaskSource = 'existing' | 'new';

export interface WeeklyQuest {
  id: string;
  user_id: string;
  overwhelm_level: OverwhelmLevel;
  week_start: string;
  week_end: string;
  target_task_count: number;
  completed_task_count: number;
  status: WeeklyQuestStatus;
  bonus_xp_earned: number;
  xp_multiplier: number;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface WeeklyQuestTask {
  id: string;
  weekly_quest_id: string;
  task_id: string | null;
  title: string;
  description: string | null;
  xp: number;
  completed: boolean;
  completed_at: string | null;
  source: WeeklyTaskSource;
  created_at: string;
}

export interface WeeklyQuestWithTasks extends WeeklyQuest {
  tasks: WeeklyQuestTask[];
}

export type WeeklyQuestCreate = {
  overwhelm_level: OverwhelmLevel;
  tasks: Array<{
    task_id?: string;
    title: string;
    description?: string;
    xp?: number;
    source: WeeklyTaskSource;
  }>;
};

export interface UserSettings {
  dark_mode: boolean;
  notifications: boolean;
  email_digest: boolean;
  show_on_leaderboard: boolean;
  show_streak: boolean;
  weekly_reset_day: number;
}
