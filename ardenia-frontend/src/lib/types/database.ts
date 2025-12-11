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

export interface PersistentTask {
  id: string;
  user_id: string;
  title: string;
  xp: number;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}
