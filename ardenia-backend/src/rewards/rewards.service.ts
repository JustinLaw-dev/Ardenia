import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class RewardsService {
  constructor(private databaseService: DatabaseService) {}

  /**
   * Get user's gamification stats
   */
  async getUserStats(userId: string) {
    const user = await this.databaseService.user.findUnique({
      where: { id: userId },
      select: {
        totalPoints: true,
        level: true,
        currentStreak: true,
        longestStreak: true,
        lastActiveDate: true,
      },
    });

    return user;
  }

  /**
   * Get reward history
   */
  async getRewardHistory(userId: string, limit: number = 20) {
    return await this.databaseService.rewardHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get user achievements
   */
  async getUserAchievements(userId: string) {
    return await this.databaseService.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true,
      },
      orderBy: { unlockedAt: 'desc' },
    });
  }

  /**
   * Get all available achievements
   */
  async getAllAchievements() {
    return await this.databaseService.achievement.findMany({
      orderBy: [{ category: 'asc' }, { tier: 'asc' }],
    });
  }

  /**
   * Update daily streak (called on task completion or daily login)
   */
  async updateStreak(userId: string) {
    const user = await this.databaseService.user.findUnique({
      where: { id: userId },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActive = user.lastActiveDate
      ? new Date(user.lastActiveDate)
      : null;

    if (lastActive) {
      lastActive.setHours(0, 0, 0, 0);
    }

    let newStreak = user.currentStreak;

    if (!lastActive) {
      // First time
      newStreak = 1;
    } else {
      const daysDifference = Math.floor(
        (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysDifference === 0) {
        // Same day, no change
        return user;
      } else if (daysDifference === 1) {
        // Consecutive day
        newStreak = user.currentStreak + 1;
      } else if (daysDifference === 2) {
        // ADHD-friendly: 1 day grace period (forgiveness feature)
        newStreak = user.currentStreak + 1;
      } else {
        // Streak broken
        if (user.currentStreak > 0) {
          // Save to history
          await this.databaseService.streakHistory.create({
            data: {
              userId,
              streakCount: user.currentStreak,
              startDate: lastActive,
              endDate: lastActive,
              missedDays: daysDifference - 1,
            },
          });
        }
        newStreak = 1;
      }
    }

    const longestStreak = Math.max(newStreak, user.longestStreak);

    // Update user
    const updated = await this.databaseService.user.update({
      where: { id: userId },
      data: {
        currentStreak: newStreak,
        longestStreak,
        lastActiveDate: new Date(),
      },
    });

    // Award streak bonus points
    if (newStreak > user.currentStreak && newStreak % 7 === 0) {
      // Bonus every week
      const bonusPoints = newStreak * 5;
      await this.databaseService.user.update({
        where: { id: userId },
        data: {
          totalPoints: { increment: bonusPoints },
        },
      });

      await this.databaseService.rewardHistory.create({
        data: {
          userId,
          pointsEarned: bonusPoints,
          reason: 'streak_bonus',
          metadata: JSON.stringify({ streakDays: newStreak }),
        },
      });
    }

    return updated;
  }

  /**
   * Get leaderboard (top users by points)
   */
  async getLeaderboard(limit: number = 10) {
    return await this.databaseService.user.findMany({
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        totalPoints: true,
        level: true,
        currentStreak: true,
      },
      orderBy: { totalPoints: 'desc' },
      take: limit,
    });
  }
}
