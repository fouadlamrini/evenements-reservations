import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { ReservationController } from './reservation/reservation.controller';
import { SModule } from './reservation/s/s.module';
import { ReservationModule } from './reservation/reservation.module';

@Module({
  imports: [
    // lecture .env
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    //  connexion MongoDB
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI'),
      }),
    }),
    UsersModule,
    AuthModule,
    EventsModule,
    SModule,
    ReservationModule,
  ],
  controllers: [ReservationController],
  providers: [],
})
export class AppModule {}
