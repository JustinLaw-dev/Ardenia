import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  getDashboardStats(@CurrentUser() user: any) {
    return this.analyticsService.getDashboardStats(user.id);
  }

  @Get('progress')
  getProgressHistory(
    @CurrentUser() user: any,
    @Query('days') days?: string,
  ) {
    return this.analyticsService.getProgressHistory(
      user.id,
      days ? parseInt(days) : 30,
    );
  }

  @Get('weekly-report')
  getWeeklyReport(@CurrentUser() user: any) {
    return this.analyticsService.getWeeklyReport(user.id);
  }

  @Get('insights')
  getInsights(@CurrentUser() user: any) {
    return this.analyticsService.getInsights(user.id);
  }
}
