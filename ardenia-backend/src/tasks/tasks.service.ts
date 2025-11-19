import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateTaskDto, UpdateTaskDto, CompleteTaskDto } from './dto';

@Injectable()
export class TasksService {
  constructor(private databaseService: DatabaseService) {}

  /**
   * Calculate reward points for a task based on ADHD-optimized criteria
   * Factors: difficulty, energy required, estimated duration, priority, streak bonus
   */
  private calculateRewardPoints(
    difficulty: number,
    energyRequired: number,
    estimatedDuration: number = 25,
    priority: number = 2,
    hasStreak: boolean = false,
  ): { basePoints: number; bonusPoints: number } {
    // Base calculation
    const difficultyMultiplier = difficulty * 2; // 2-10 points
    const energyMultiplier = energyRequired * 1.5; // 1.5-7.5 points
    const durationPoints = Math.ceil(estimatedDuration / 10); // 1 point per 10 minutes
    const priorityBonus = priority * 2; // 2-10 points

    const basePoints = Math.round(
      difficultyMultiplier + energyMultiplier + durationPoints + priorityBonus,
    );

    // Streak bonus (ADHD dopamine optimization)
    const bonusPoints = hasStreak ? Math.round(basePoints * 0.25) : 0;

    return { basePoints, bonusPoints };
  }

  async create(userId: string, createTaskDto: CreateTaskDto) {
    // Calculate reward points
    const { basePoints, bonusPoints } = this.calculateRewardPoints(
      createTaskDto.difficultyLevel || 3,
      createTaskDto.energyRequired || 3,
      createTaskDto.estimatedDuration || 25,
      createTaskDto.priority || 2,
      false,
    );

    const task = await this.databaseService.task.create({
      data: {
        userId,
        title: createTaskDto.title,
        description: createTaskDto.description,
        category: createTaskDto.category,
        priority: createTaskDto.priority || 2,
        tags: createTaskDto.tags || [],
        estimatedDuration: createTaskDto.estimatedDuration,
        energyRequired: createTaskDto.energyRequired || 3,
        difficultyLevel: createTaskDto.difficultyLevel || 3,
        rewardPoints: basePoints,
        bonusPoints: 0, // Bonus awarded on completion if streak active
        dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
        parentTaskId: createTaskDto.parentTaskId,
        isPartOfChallenge: createTaskDto.isPartOfChallenge || false,
        challengeId: createTaskDto.challengeId,
      },
      include: {
        subtasks: true,
      },
    });

    // Update daily progress
    await this.updateDailyProgress(userId, 'task_created');

    return task;
  }

  async findAll(
    userId: string,
    options?: {
      status?: string;
      category?: string;
      priority?: number;
      includeSubtasks?: boolean;
    },
  ) {
    const where: any = {
      userId,
      parentTaskId: null, // Only get top-level tasks
    };

    if (options?.status) {
      where.status = options.status;
    }

    if (options?.category) {
      where.category = options.category;
    }

    if (options?.priority) {
      where.priority = options.priority;
    }

    const tasks = await this.databaseService.task.findMany({
      where,
      include: {
        subtasks: options?.includeSubtasks !== false,
      },
      orderBy: [
        { status: 'asc' }, // pending first
        { priority: 'desc' }, // high priority first
        { dueDate: 'asc' }, // closest deadline first
        { createdAt: 'desc' },
      ],
    });

    return tasks;
  }

  async findOne(userId: string, taskId: string) {
    const task = await this.databaseService.task.findUnique({
      where: { id: taskId },
      include: {
        subtasks: true,
        focusSessions: {
          orderBy: { startedAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return task;
  }

  async update(userId: string, taskId: string, updateTaskDto: UpdateTaskDto) {
    const task = await this.findOne(userId, taskId);

    const updated = await this.databaseService.task.update({
      where: { id: taskId },
      data: {
        ...updateTaskDto,
        dueDate: updateTaskDto.dueDate
          ? new Date(updateTaskDto.dueDate)
          : undefined,
      },
      include: {
        subtasks: true,
      },
    });

    return updated;
  }

  async startTask(userId: string, taskId: string) {
    const task = await this.findOne(userId, taskId);

    return await this.databaseService.task.update({
      where: { id: taskId },
      data: {
        status: 'in_progress',
        startedAt: new Date(),
      },
    });
  }

  async completeTask(
    userId: string,
    taskId: string,
    completeTaskDto?: CompleteTaskDto,
  ) {
    const task = await this.findOne(userId, taskId);

    // Get user for streak calculation
    const user = await this.databaseService.user.findUnique({
      where: { id: userId },
    });

    // Calculate bonus points if user has streak
    const hasStreak = user.currentStreak > 0;
    const bonusPoints = hasStreak ? Math.round(task.rewardPoints * 0.25) : 0;

    // Update task
    const completedTask = await this.databaseService.task.update({
      where: { id: taskId },
      data: {
        status: 'completed',
        completedAt: new Date(),
        actualDuration: completeTaskDto?.actualDuration,
        bonusPoints,
      },
    });

    // Award points to user
    const totalPointsEarned = task.rewardPoints + bonusPoints;
    const newTotalPoints = user.totalPoints + totalPointsEarned;
    const newLevel = Math.floor(newTotalPoints / 100) + 1; // Level up every 100 points

    await this.databaseService.user.update({
      where: { id: userId },
      data: {
        totalPoints: newTotalPoints,
        level: newLevel,
      },
    });

    // Record reward history
    await this.databaseService.rewardHistory.create({
      data: {
        userId,
        pointsEarned: totalPointsEarned,
        reason: 'task_completed',
        metadata: JSON.stringify({
          taskId,
          taskTitle: task.title,
          basePoints: task.rewardPoints,
          bonusPoints,
        }),
      },
    });

    // Update daily progress
    await this.updateDailyProgress(userId, 'task_completed');

    // Check for achievements
    await this.checkAchievements(userId);

    return {
      task: completedTask,
      pointsEarned: totalPointsEarned,
      newLevel,
      newTotalPoints,
    };
  }

  async remove(userId: string, taskId: string) {
    await this.findOne(userId, taskId); // Verify ownership

    await this.databaseService.task.delete({
      where: { id: taskId },
    });

    return { message: 'Task deleted successfully' };
  }

  /**
   * Get task statistics for analytics
   */
  async getStatistics(userId: string) {
    const [total, pending, inProgress, completed] = await Promise.all([
      this.databaseService.task.count({ where: { userId } }),
      this.databaseService.task.count({
        where: { userId, status: 'pending' },
      }),
      this.databaseService.task.count({
        where: { userId, status: 'in_progress' },
      }),
      this.databaseService.task.count({
        where: { userId, status: 'completed' },
      }),
    ]);

    // Get completion rate over last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentCompleted = await this.databaseService.task.count({
      where: {
        userId,
        status: 'completed',
        completedAt: { gte: sevenDaysAgo },
      },
    });

    const recentTotal = await this.databaseService.task.count({
      where: {
        userId,
        createdAt: { gte: sevenDaysAgo },
      },
    });

    const weeklyCompletionRate =
      recentTotal > 0 ? (recentCompleted / recentTotal) * 100 : 0;

    return {
      total,
      pending,
      inProgress,
      completed,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      weeklyCompletionRate: Math.round(weeklyCompletionRate),
    };
  }

  /**
   * Update daily progress metrics
   */
  private async updateDailyProgress(userId: string, action: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const progress = await this.databaseService.dailyProgress.findFirst({
      where: {
        userId,
        date: today,
      },
    });

    if (progress) {
      await this.databaseService.dailyProgress.update({
        where: { id: progress.id },
        data: {
          tasksCreated:
            action === 'task_created'
              ? progress.tasksCreated + 1
              : progress.tasksCreated,
          tasksCompleted:
            action === 'task_completed'
              ? progress.tasksCompleted + 1
              : progress.tasksCompleted,
        },
      });
    } else {
      await this.databaseService.dailyProgress.create({
        data: {
          userId,
          date: today,
          tasksCreated: action === 'task_created' ? 1 : 0,
          tasksCompleted: action === 'task_completed' ? 1 : 0,
        },
      });
    }
  }

  /**
   * Check and award achievements
   */
  private async checkAchievements(userId: string) {
    const stats = await this.getStatistics(userId);

    // Simple achievement checking (expand this based on your achievement system)
    const achievementsToCheck = [
      { key: 'first_task', requirement: stats.completed >= 1 },
      { key: 'task_master_10', requirement: stats.completed >= 10 },
      { key: 'task_master_50', requirement: stats.completed >= 50 },
      { key: 'task_master_100', requirement: stats.completed >= 100 },
    ];

    for (const achievementCheck of achievementsToCheck) {
      if (achievementCheck.requirement) {
        const achievement = await this.databaseService.achievement.findUnique({
          where: { key: achievementCheck.key },
        });

        if (achievement) {
          const existing =
            await this.databaseService.userAchievement.findUnique({
              where: {
                userId_achievementId: {
                  userId,
                  achievementId: achievement.id,
                },
              },
            });

          if (!existing) {
            await this.databaseService.userAchievement.create({
              data: {
                userId,
                achievementId: achievement.id,
              },
            });
          }
        }
      }
    }
  }
}
