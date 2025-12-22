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
