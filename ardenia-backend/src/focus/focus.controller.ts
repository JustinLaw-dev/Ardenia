import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { FocusService } from './focus.service';
import { StartSessionDto, EndSessionDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('focus')
@UseGuards(JwtAuthGuard)
export class FocusController {
  constructor(private readonly focusService: FocusService) {}

  @Post('start')
  startSession(
    @CurrentUser() user: any,
    @Body() startSessionDto: StartSessionDto,
  ) {
    return this.focusService.startSession(user.id, startSessionDto);
  }

  @Post(':id/end')
  endSession(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() endSessionDto: EndSessionDto,
  ) {
    return this.focusService.endSession(user.id, id, endSessionDto);
  }

  @Get('active')
  getActiveSessions(@CurrentUser() user: any) {
    return this.focusService.getActiveSessions(user.id);
  }

  @Get('history')
  getSessionHistory(
    @CurrentUser() user: any,
    @Query('limit') limit?: string,
  ) {
    return this.focusService.getSessionHistory(
      user.id,
      limit ? parseInt(limit) : 20,
    );
  }

  @Get('statistics')
  getStatistics(@CurrentUser() user: any) {
    return this.focusService.getStatistics(user.id);
  }
}
