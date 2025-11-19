export interface User {
  id: string;
  email: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  totalPoints: number;
  level: number;
  currentStreak: number;
  longestStreak?: number;
  adhdSubtype?: string;
  rewardSensitivity?: number;
  preferredTaskLength?: number;
  breakLength?: number;
  theme?: string;
  enableHapticFeedback?: boolean;
  enableSoundEffects?: boolean;
  enableAnimations?: boolean;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category?: string;
  priority: number;
  tags: string[];
  estimatedDuration?: number;
  actualDuration?: number;
  energyRequired: number;
  difficultyLevel: number;
  rewardPoints: number;
  bonusPoints: number;
  status: 'pending' | 'in_progress' | 'completed' | 'archived';
  completedAt?: string;
  dueDate?: string;
  startedAt?: string;
  isPartOfChallenge: boolean;
  challengeId?: string;
  parentTaskId?: string;
  subtasks?: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface FocusSession {
  id: string;
  userId: string;
  taskId?: string;
  plannedDuration: number;
  actualDuration?: number;
  sessionType: 'pomodoro' | 'deep_work' | 'quick_task';
  distractionCount: number;
  focusQuality?: number;
  completedGoal: boolean;
  pointsEarned: number;
  startedAt: string;
  endedAt?: string;
  task?: Task;
}

export interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  pointValue: number;
  requirement: string;
  createdAt: string;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: string;
  seenAt?: string;
  achievement: Achievement;
}

export interface DashboardStats {
  user: {
    totalPoints: number;
    level: number;
    currentStreak: number;
    longestStreak: number;
    pointsToNextLevel: number;
    levelProgress: number;
  };
  today: {
    tasksCompleted: number;
    focusMinutes: number;
    pointsEarned: number;
  };
  tasks: {
    total: number;
    completed: number;
    pending: number;
    inProgress: number;
    completionRate: number;
  };
  recentAchievements: UserAchievement[];
}
