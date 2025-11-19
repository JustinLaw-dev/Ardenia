import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AnalyticsService {
  constructor(private databaseService: DatabaseService) {}

  async getDashboardStats(userId: string) {
    const user = await this.databaseService.user.findUnique({
      where: { id: userId },
      select: {
        totalPoints: true,
        level: true,
        currentStreak: true,
        longestStreak: true,
      },
    });

    // Get today's progress
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayProgress = await this.databaseService.dailyProgress.findFirst({
      where: { userId, date: today },
    });

    // Get task stats
    const [totalTasks, completedTasks, pendingTasks, inProgressTasks] =
      await Promise.all([
        this.databaseService.task.count({ where: { userId } }),
        this.databaseService.task.count({
          where: { userId, status: 'completed' },
        }),
        this.databaseService.task.count({
          where: { userId, status: 'pending' },
        }),
        this.databaseService.task.count({
          where: { userId, status: 'in_progress' },
        }),
      ]);

    // Get recent achievements
    const recentAchievements =
      await this.databaseService.userAchievement.findMany({
        where: { userId },
        include: { achievement: true },
        orderBy: { unlockedAt: 'desc' },
        take: 5,
      });

    return {
      user: {
        ...user,
        pointsToNextLevel: (user.level * 100) - user.totalPoints,
        levelProgress: ((user.totalPoints % 100) / 100) * 100,
      },
      today: {
        tasksCompleted: todayProgress?.tasksCompleted || 0,
        focusMinutes: todayProgress?.focusMinutes || 0,
        pointsEarned: todayProgress?.pointsEarned || 0,
      },
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        pending: pendingTasks,
        inProgress: inProgressTasks,
        completionRate:
          totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      },
      recentAchievements,
    };
  }

  async getProgressHistory(userId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const progress = await this.databaseService.dailyProgress.findMany({
      where: {
        userId,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    });

    return progress;
  }

  async getWeeklyReport(userId: string) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const progress = await this.databaseService.dailyProgress.findMany({
      where: {
        userId,
        date: { gte: sevenDaysAgo },
      },
    });

    const totalTasksCompleted = progress.reduce(
      (sum, p) => sum + p.tasksCompleted,
      0,
    );
    const totalFocusMinutes = progress.reduce(
      (sum, p) => sum + p.focusMinutes,
      0,
    );
    const totalPoints = progress.reduce((sum, p) => sum + p.pointsEarned, 0);
    const avgFocusQuality =
      progress
        .filter((p) => p.averageFocusQuality)
        .reduce((sum, p) => sum + p.averageFocusQuality, 0) /
      (progress.filter((p) => p.averageFocusQuality).length || 1);

    return {
      period: '7 days',
      tasksCompleted: totalTasksCompleted,
      focusMinutes: totalFocusMinutes,
      focusHours: Math.round((totalFocusMinutes / 60) * 10) / 10,
      pointsEarned: totalPoints,
      averageFocusQuality: Math.round(avgFocusQuality * 10) / 10,
      dailyAverage: {
        tasks: Math.round((totalTasksCompleted / 7) * 10) / 10,
        focusMinutes: Math.round((totalFocusMinutes / 7) * 10) / 10,
        points: Math.round((totalPoints / 7) * 10) / 10,
      },
    };
  }

  async getInsights(userId: string) {
    // Get last 30 days of progress
    const progress = await this.getProgressHistory(userId, 30);

    // Calculate productivity patterns
    const tasksPerDay = progress.map((p) => p.tasksCompleted);
    const avgTasksPerDay =
      tasksPerDay.reduce((sum, t) => sum + t, 0) / (tasksPerDay.length || 1);

    const bestDay = progress.reduce(
      (best, p) =>
        p.tasksCompleted > (best?.tasksCompleted || 0) ? p : best,
      null,
    );

    // Focus session insights
    const sessions = await this.databaseService.focusSession.findMany({
      where: {
        userId,
        endedAt: { not: null },
      },
      orderBy: { endedAt: 'desc' },
      take: 30,
    });

    const avgSessionLength =
      sessions.reduce((sum, s) => sum + (s.actualDuration || 0), 0) /
      (sessions.length || 1);
    const avgDistractions =
      sessions.reduce((sum, s) => sum + s.distractionCount, 0) /
      (sessions.length || 1);

    return {
      productivity: {
        averageTasksPerDay: Math.round(avgTasksPerDay * 10) / 10,
        bestDayTasks: bestDay?.tasksCompleted || 0,
        bestDate: bestDay?.date || null,
      },
      focus: {
        averageSessionLength: Math.round(avgSessionLength),
        averageDistractions: Math.round(avgDistractions * 10) / 10,
        totalSessions: sessions.length,
      },
      recommendations: this.generateRecommendations(
        avgTasksPerDay,
        avgSessionLength,
        avgDistractions,
      ),
    };
  }

  private generateRecommendations(
    avgTasks: number,
    avgSessionLength: number,
    avgDistractions: number,
  ): string[] {
    const recommendations: string[] = [];

    if (avgTasks < 3) {
      recommendations.push(
        'Try breaking down large tasks into smaller, more manageable subtasks',
      );
    }

    if (avgSessionLength < 20) {
      recommendations.push(
        'Consider gradually increasing your focus session length to build endurance',
      );
    }

    if (avgSessionLength > 60) {
      recommendations.push(
        'Take regular breaks! Even with ADHD, rest is crucial for sustained focus',
      );
    }

    if (avgDistractions > 3) {
      recommendations.push(
        'Try using focus mode or find a quieter environment to minimize distractions',
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        "You're doing great! Keep up the consistency",
      );
    }

    return recommendations;
  }
}
