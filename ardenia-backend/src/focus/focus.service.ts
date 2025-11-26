import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { StartSessionDto, EndSessionDto } from './dto';

@Injectable()
export class FocusService {
  constructor(private databaseService: DatabaseService) {}

  async startSession(userId: string, startSessionDto: StartSessionDto) {
    const session = await this.databaseService.focusSession.create({
      data: {
        userId,
        taskId: startSessionDto.taskId,
        plannedDuration: startSessionDto.plannedDuration,
        sessionType: startSessionDto.sessionType || 'pomodoro',
      },
    });

    return session;
  }

  async endSession(userId: string, sessionId: string, endSessionDto: EndSessionDto) {
    const session = await this.databaseService.focusSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Focus session not found');
    }

    if (session.userId !== userId) {
      throw new NotFoundException('Session not found');
    }

    // Calculate points based on session quality
    const basePoints = Math.round(endSessionDto.actualDuration / 5); // 1 point per 5 minutes
    const qualityMultiplier = endSessionDto.focusQuality || 3;
    const completionBonus = endSessionDto.completedGoal ? 10 : 0;
    const distractionPenalty = Math.min((endSessionDto.distractionCount || 0) * 2, basePoints * 0.5);

    const pointsEarned = Math.max(
      Math.round(basePoints * (qualityMultiplier / 3) + completionBonus - distractionPenalty),
      1,
    );

    // Update session
    const updatedSession = await this.databaseService.focusSession.update({
      where: { id: sessionId },
      data: {
        endedAt: new Date(),
        actualDuration: endSessionDto.actualDuration,
        distractionCount: endSessionDto.distractionCount || 0,
        focusQuality: endSessionDto.focusQuality,
        completedGoal: endSessionDto.completedGoal || false,
        pointsEarned,
      },
    });

    // Award points to user
    await this.databaseService.user.update({
      where: { id: userId },
      data: {
        totalPoints: { increment: pointsEarned },
      },
    });

    // Record reward
    await this.databaseService.rewardHistory.create({
      data: {
        userId,
        pointsEarned,
        reason: 'focus_session',
        metadata: JSON.stringify({
          sessionId,
          duration: endSessionDto.actualDuration,
          quality: endSessionDto.focusQuality,
        }),
      },
    });

    // Update daily progress
    await this.updateDailyProgress(
      userId,
      endSessionDto.actualDuration,
      endSessionDto.focusQuality,
    );

    return {
      session: updatedSession,
      pointsEarned,
    };
  }

  async getActiveSessions(userId: string) {
    return await this.databaseService.focusSession.findMany({
      where: {
        userId,
        endedAt: null,
      },
      include: {
        task: true,
      },
      orderBy: { startedAt: 'desc' },
    });
  }

  async getSessionHistory(userId: string, limit: number = 20) {
    return await this.databaseService.focusSession.findMany({
      where: {
        userId,
        endedAt: { not: null },
      },
      include: {
        task: true,
      },
      orderBy: { endedAt: 'desc' },
      take: limit,
    });
  }

  async getStatistics(userId: string) {
    const sessions = await this.databaseService.focusSession.findMany({
      where: {
        userId,
        endedAt: { not: null },
      },
    });

    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((sum, s) => sum + (s.actualDuration || 0), 0);
    const avgQuality =
      sessions.filter((s) => s.focusQuality).reduce((sum, s) => sum + s.focusQuality, 0) /
      (sessions.filter((s) => s.focusQuality).length || 1);
    const completionRate =
      (sessions.filter((s) => s.completedGoal).length / (totalSessions || 1)) * 100;

    return {
      totalSessions,
      totalMinutes,
      totalHours: Math.round((totalMinutes / 60) * 10) / 10,
      averageFocusQuality: Math.round(avgQuality * 10) / 10,
      completionRate: Math.round(completionRate),
    };
  }

  private async updateDailyProgress(
    userId: string,
    duration: number,
    quality?: number,
  ) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const progress = await this.databaseService.dailyProgress.findFirst({
      where: { userId, date: today },
    });

    if (progress) {
      const newFocusMinutes = progress.focusMinutes + duration;
      const newFocusSessions = progress.focusSessions + 1;

      const avgQuality = quality
        ? (((progress.averageFocusQuality || 0) * progress.focusSessions + quality) /
            newFocusSessions)
        : progress.averageFocusQuality;

      await this.databaseService.dailyProgress.update({
        where: { id: progress.id },
        data: {
          focusMinutes: newFocusMinutes,
          focusSessions: newFocusSessions,
          averageFocusQuality: avgQuality,
        },
      });
    } else {
      await this.databaseService.dailyProgress.create({
        data: {
          userId,
          date: today,
          focusMinutes: duration,
          focusSessions: 1,
          averageFocusQuality: quality || null,
        },
      });
    }
  }
}
