import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsArray,
  IsDateString,
  IsBoolean,
} from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  priority?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsInt()
  @Min(1)
  @IsOptional()
  estimatedDuration?: number; // minutes

  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  energyRequired?: number;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  difficultyLevel?: number;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsString()
  @IsOptional()
  parentTaskId?: string;

  @IsBoolean()
  @IsOptional()
  isPartOfChallenge?: boolean;

  @IsString()
  @IsOptional()
  challengeId?: string;
}
