import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const achievements = [
  // Completion Achievements
  {
    key: 'first_task',
    name: '🎯 First Victory',
    description: 'Complete your first task',
    icon: '🎯',
    category: 'completion',
    tier: 'bronze',
    pointValue: 10,
    requirement: JSON.stringify({ tasksCompleted: 1 }),
  },
  {
    key: 'task_master_10',
    name: '⭐ Getting Started',
    description: 'Complete 10 tasks',
    icon: '⭐',
    category: 'completion',
    tier: 'bronze',
    pointValue: 50,
    requirement: JSON.stringify({ tasksCompleted: 10 }),
  },
  {
    key: 'task_master_50',
    name: '🌟 Momentum Builder',
    description: 'Complete 50 tasks',
    icon: '🌟',
    category: 'completion',
    tier: 'silver',
    pointValue: 200,
    requirement: JSON.stringify({ tasksCompleted: 50 }),
  },
  {
    key: 'task_master_100',
    name: '💫 Task Champion',
    description: 'Complete 100 tasks',
    icon: '💫',
    category: 'completion',
    tier: 'gold',
    pointValue: 500,
    requirement: JSON.stringify({ tasksCompleted: 100 }),
  },
  {
    key: 'task_master_500',
    name: '🏆 Legendary Achiever',
    description: 'Complete 500 tasks',
    icon: '🏆',
    category: 'completion',
    tier: 'platinum',
    pointValue: 2000,
    requirement: JSON.stringify({ tasksCompleted: 500 }),
  },

  // Streak Achievements
  {
    key: 'streak_3',
    name: '🔥 Getting Consistent',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    category: 'streak',
    tier: 'bronze',
    pointValue: 30,
    requirement: JSON.stringify({ streak: 3 }),
  },
  {
    key: 'streak_7',
    name: '🔥 Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    category: 'streak',
    tier: 'silver',
    pointValue: 100,
    requirement: JSON.stringify({ streak: 7 }),
  },
  {
    key: 'streak_14',
    name: '🔥 Two Week Terror',
    description: 'Maintain a 14-day streak',
    icon: '🔥',
    category: 'streak',
    tier: 'gold',
    pointValue: 250,
    requirement: JSON.stringify({ streak: 14 }),
  },
  {
    key: 'streak_30',
    name: '🔥 Monthly Master',
    description: 'Maintain a 30-day streak',
    icon: '🔥',
    category: 'streak',
    tier: 'gold',
    pointValue: 500,
    requirement: JSON.stringify({ streak: 30 }),
  },
  {
    key: 'streak_100',
    name: '🔥 Unstoppable Force',
    description: 'Maintain a 100-day streak',
    icon: '🔥',
    category: 'streak',
    tier: 'platinum',
    pointValue: 2000,
    requirement: JSON.stringify({ streak: 100 }),
  },

  // Focus Achievements
  {
    key: 'focus_first',
    name: '🎯 First Focus',
    description: 'Complete your first focus session',
    icon: '🎯',
    category: 'focus',
    tier: 'bronze',
    pointValue: 10,
    requirement: JSON.stringify({ focusSessions: 1 }),
  },
  {
    key: 'focus_10',
    name: '🧘 Focus Apprentice',
    description: 'Complete 10 focus sessions',
    icon: '🧘',
    category: 'focus',
    tier: 'bronze',
    pointValue: 50,
    requirement: JSON.stringify({ focusSessions: 10 }),
  },
  {
    key: 'focus_50',
    name: '🧘 Concentration Master',
    description: 'Complete 50 focus sessions',
    icon: '🧘',
    category: 'focus',
    tier: 'silver',
    pointValue: 200,
    requirement: JSON.stringify({ focusSessions: 50 }),
  },
  {
    key: 'focus_quality_high',
    name: '💎 Peak Performance',
    description: 'Achieve 10 focus sessions with 5/5 quality',
    icon: '💎',
    category: 'focus',
    tier: 'gold',
    pointValue: 300,
    requirement: JSON.stringify({ highQualitySessions: 10 }),
  },

  // Consistency Achievements
  {
    key: 'early_bird',
    name: '🌅 Early Bird',
    description: 'Complete 10 tasks before 9 AM',
    icon: '🌅',
    category: 'consistency',
    tier: 'silver',
    pointValue: 150,
    requirement: JSON.stringify({ earlyTasks: 10 }),
  },
  {
    key: 'daily_goals_week',
    name: '📅 Weekly Goal Crusher',
    description: 'Complete daily goals for 7 days straight',
    icon: '📅',
    category: 'consistency',
    tier: 'gold',
    pointValue: 200,
    requirement: JSON.stringify({ consecutiveDailyGoals: 7 }),
  },
  {
    key: 'weekend_warrior',
    name: '💪 Weekend Warrior',
    description: 'Complete tasks on 10 weekends',
    icon: '💪',
    category: 'consistency',
    tier: 'silver',
    pointValue: 150,
    requirement: JSON.stringify({ weekendTasks: 10 }),
  },

  // Level Achievements
  {
    key: 'level_5',
    name: '⬆️ Rising Star',
    description: 'Reach level 5',
    icon: '⬆️',
    category: 'progression',
    tier: 'bronze',
    pointValue: 50,
    requirement: JSON.stringify({ level: 5 }),
  },
  {
    key: 'level_10',
    name: '⬆️ Expert',
    description: 'Reach level 10',
    icon: '⬆️',
    category: 'progression',
    tier: 'silver',
    pointValue: 100,
    requirement: JSON.stringify({ level: 10 }),
  },
  {
    key: 'level_25',
    name: '⬆️ Master',
    description: 'Reach level 25',
    icon: '⬆️',
    category: 'progression',
    tier: 'gold',
    pointValue: 250,
    requirement: JSON.stringify({ level: 25 }),
  },
  {
    key: 'level_50',
    name: '⬆️ Legend',
    description: 'Reach level 50',
    icon: '⬆️',
    category: 'progression',
    tier: 'platinum',
    pointValue: 1000,
    requirement: JSON.stringify({ level: 50 }),
  },
];

async function main() {
  console.log('🌱 Starting database seed...');

  // Seed achievements
  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { key: achievement.key },
      update: achievement,
      create: achievement,
    });
  }

  console.log(`✅ Seeded ${achievements.length} achievements`);
  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
