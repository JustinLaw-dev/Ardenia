import { IsInt, Min, Max, IsBoolean, IsOptional } from 'class-validator';

export class EndSessionDto {
  @IsInt()
  @Min(1)
  actualDuration: number; // minutes

  @IsInt()
  @Min(0)
  @IsOptional()
  distractionCount?: number;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  focusQuality?: number;

  @IsBoolean()
  @IsOptional()
  completedGoal?: boolean;
}
