import {
  IsString,
  IsDate,
  IsNumber,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { EventStatus } from '../schemas/event.schema';

export class CreateEventDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsDate()
  date: Date;

  @IsString()
  time: string;

  @IsString()
  location: string;

  @IsNumber()
  maxCapacity: number;

  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;
}
