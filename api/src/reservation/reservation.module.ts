import { Module } from '@nestjs/common';
import { ReservationService } from './reservation.service';

@Module({
  providers: [ReservationService]
})
export class ReservationModule {}
