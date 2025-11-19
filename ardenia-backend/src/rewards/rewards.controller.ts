import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('rewards')
@UseGuards(JwtAuthGuard)
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Get('stats')
  getUserStats(@CurrentUser() user: any) {
    return this.rewardsService.getUserStats(user.id);
  }

  @Get('history')
  getRewardHistory(
    @CurrentUser() user: any,
    @Query('limit') limit?: string,
  ) {
    return this.rewardsService.getRewardHistory(
      user.id,
      limit ? parseInt(limit) : 20,
    );
  }

  @Get('achievements')
  getUserAchievements(@CurrentUser() user: any) {
    return this.rewardsService.getUserAchievements(user.id);
  }

  @Get('achievements/all')
  getAllAchievements() {
    return this.rewardsService.getAllAchievements();
  }

  @Get('leaderboard')
  getLeaderboard(@Query('limit') limit?: string) {
    return this.rewardsService.getLeaderboard(
      limit ? parseInt(limit) : 10,
    );
  }
}
