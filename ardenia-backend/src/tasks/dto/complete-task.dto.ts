import { IsInt, Min, IsOptional } from 'class-validator';

export class CompleteTaskDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  actualDuration?: number; // minutes - helps with time blindness training
}
