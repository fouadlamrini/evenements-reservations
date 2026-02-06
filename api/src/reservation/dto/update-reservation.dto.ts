import { IsEnum } from 'class-validator';
import { ReservationStatus } from '../schemas/reservation.schema';

export class UpdateReservationStatusDto {
  @IsEnum(ReservationStatus)
  status: ReservationStatus;
}
