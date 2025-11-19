import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';
import { IsString, IsOptional, IsEnum } from 'class-validator';

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;
}
