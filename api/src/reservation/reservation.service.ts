import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Reservation, ReservationStatus } from './schemas/reservation.schema';
import { Event } from '../events/schemas/event.schema';
import { User } from '../users/schemas/user.schema';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationStatusDto } from './dto/update-reservation.dto';

@Injectable()
export class ReservationService {
  constructor(
    @InjectModel(Reservation.name) private reservationModel: Model<Reservation>,
    @InjectModel(Event.name) private eventModel: Model<Event>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(
    createReservationDto: CreateReservationDto,
    participantId: string,
  ): Promise<Reservation> {
    const { eventId } = createReservationDto;

    // Check if user exists and is a participant
    const user = await this.userModel.findById(participantId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== 'Participant') {
      throw new ForbiddenException(
        'Admins are not allowed to make reservations',
      );
    }

    // Check if event exists and is published
    const event = await this.eventModel.findById(eventId).exec();
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.status !== 'PUBLISHED') {
      throw new BadRequestException('Event is not available for reservation');
    }

    // Check if user already has a reservation for this event
    const existingReservation = await this.reservationModel
      .findOne({
        eventId: new Types.ObjectId(eventId),
        participantId: new Types.ObjectId(participantId),
        status: {
          $in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED],
        },
      })
      .exec();

    if (existingReservation) {
      throw new BadRequestException(
        'You already have a reservation for this event',
      );
    }

    const reservation = new this.reservationModel({
      eventId: new Types.ObjectId(eventId),
      participantId: new Types.ObjectId(participantId),
      status: ReservationStatus.PENDING,
    });

    return reservation.save();
  }

  async findByParticipant(participantId: string): Promise<Reservation[]> {
    return this.reservationModel
      .find({ participantId: new Types.ObjectId(participantId) })
      .populate('eventId')
      .exec();
  }

  async findAll(): Promise<Reservation[]> {
    return this.reservationModel
      .find()
      .populate('eventId')
      .populate('participantId', '-password')
      .exec();
  }

  async findOne(id: string): Promise<Reservation> {
    const reservation = await this.reservationModel
      .findById(id)
      .populate('eventId')
      .populate('participantId', '-password')
      .exec();

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    return reservation;
  }

  async updateStatus(
    id: string,
    updateStatusDto: UpdateReservationStatusDto,
    adminId?: string,
  ): Promise<Reservation> {
    const reservation = await this.findOne(id);
    const { status } = updateStatusDto;

    // Validate status transitions
    if (reservation.status === ReservationStatus.CANCELED) {
      throw new BadRequestException('Cannot update a canceled reservation');
    }

    if (
      reservation.status === ReservationStatus.REFUSED &&
      status !== ReservationStatus.CONFIRMED
    ) {
      throw new BadRequestException('Cannot update a refused reservation');
    }

    // If confirming, check event capacity
    if (status === ReservationStatus.CONFIRMED) {
      const event = await this.eventModel.findById(reservation.eventId).exec();
      if (!event) {
        throw new NotFoundException('Associated event not found');
      }

      const confirmedReservations = await this.reservationModel
        .countDocuments({
          eventId: reservation.eventId,
          status: ReservationStatus.CONFIRMED,
        })
        .exec();

      if (confirmedReservations >= event.maxCapacity) {
        throw new BadRequestException('Event is full');
      }
    }

    reservation.status = status;
    return reservation.save();
  }

  async cancelByParticipant(
    id: string,
    participantId: string,
  ): Promise<Reservation> {
    const reservation = await this.reservationModel.findById(id).exec();

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (reservation.participantId.toString() !== participantId) {
      throw new ForbiddenException('You can only cancel your own reservations');
    }

    if (reservation.status === ReservationStatus.CANCELED) {
      throw new BadRequestException('Reservation is already canceled');
    }

    if (reservation.status === ReservationStatus.REFUSED) {
      throw new BadRequestException('Cannot cancel a refused reservation');
    }

    reservation.status = ReservationStatus.CANCELED;
    reservation.canceledBy = 'PARTICIPANT';
    return reservation.save();
  }

  async cancelByAdmin(id: string): Promise<Reservation> {
    const reservation = await this.reservationModel.findById(id).exec();
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (reservation.status === ReservationStatus.CANCELED) {
      throw new BadRequestException('Reservation is already canceled');
    }

    if (reservation.status === ReservationStatus.REFUSED) {
      throw new BadRequestException('Cannot cancel a refused reservation');
    }

    reservation.status = ReservationStatus.CANCELED;
    reservation.canceledBy = 'ADMIN';
    return reservation.save();
  }

  async remove(id: string): Promise<Reservation> {
    const reservation = await this.findOne(id);
    await this.reservationModel.findByIdAndDelete(id).exec();
    return reservation;
  }
}
