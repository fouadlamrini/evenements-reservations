import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards,
  Request,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationStatusDto } from './dto/update-reservation.dto';
import { ReservationStatus } from './schemas/reservation.schema';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { Role } from '../roles/role.enum';

@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.Participant)
  create(@Body() createReservationDto: CreateReservationDto, @Request() req) {
    return this.reservationService.create(createReservationDto, req.user.userId);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  findAll() {
    return this.reservationService.findAll();
  }

  @Get('my')
  findByParticipant(@Request() req) {
    return this.reservationService.findByParticipant(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reservationService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  updateStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateReservationStatusDto) {
    return this.reservationService.updateStatus(id, updateStatusDto);
  }

  @Patch(':id/confirm')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.OK)
  confirm(@Param('id') id: string) {
    return this.reservationService.updateStatus(id, { status: ReservationStatus.CONFIRMED });
  }

  @Patch(':id/refuse')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.OK)
  refuse(@Param('id') id: string) {
    return this.reservationService.updateStatus(id, { status: ReservationStatus.REFUSED });
  }

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  cancelByParticipant(@Param('id') id: string, @Request() req) {
    return this.reservationService.cancelByParticipant(id, req.user.userId);
  }

  @Patch(':id/cancel-admin')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.OK)
  cancelByAdmin(@Param('id') id: string) {
    return this.reservationService.cancelByAdmin(id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  remove(@Param('id') id: string) {
    return this.reservationService.remove(id);
  }
}
