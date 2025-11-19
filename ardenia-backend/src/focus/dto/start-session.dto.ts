import { IsString, IsInt, Min, IsOptional, IsEnum } from 'class-validator';

export enum SessionType {
  POMODORO = 'pomodoro',
  DEEP_WORK = 'deep_work',
  QUICK_TASK = 'quick_task',
}

export class StartSessionDto {
  @IsString()
  @IsOptional()
  taskId?: string;

  @IsInt()
  @Min(1)
  plannedDuration: number; // minutes

  @IsEnum(SessionType)
  @IsOptional()
  sessionType?: SessionType;
}
