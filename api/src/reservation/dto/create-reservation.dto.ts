import { IsMongoId } from 'class-validator';

export class CreateReservationDto {
  @IsMongoId()
  eventId: string;
}
