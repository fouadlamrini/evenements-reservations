import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event, EventStatus } from './schemas/event.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';
import { Reservation, ReservationStatus } from '../reservation/schemas/reservation.schema';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<Event>,
    @InjectModel(Reservation.name) private reservationModel: Model<Reservation>
  ) {}

  async create(createEventDto: CreateEventDto, creatorId: string): Promise<Event> {
    const event = new this.eventModel({
      ...createEventDto,
      creatorId,
    });
    return event.save();
  }

  async findAll(): Promise<Event[]> {
    return this.eventModel.find({ status: EventStatus.PUBLISHED }).exec();
  }

  async findAdminEvents(creatorId: string): Promise<Event[]> {
    return this.eventModel.find({ creatorId }).exec();
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventModel.findById(id).exec();
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    
    if (event.status !== EventStatus.PUBLISHED) {
      throw new NotFoundException('Event not found');
    }
    
    return event;
  }

  async findOneWithReservationStats(id: string): Promise<Event & { confirmedReservations: number; totalReservations: number; fillRate: number }> {
    const event = await this.findOne(id);
    
    // Get reservation statistics for this event
    const confirmedReservations = await this.reservationModel.countDocuments({
      eventId: event._id,
      status: ReservationStatus.CONFIRMED
    }).exec();
    
    const totalReservations = await this.reservationModel.countDocuments({
      eventId: event._id,
      status: { $in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED] }
    }).exec();
    
    const fillRate = event.maxCapacity > 0 
      ? Math.round((confirmedReservations / event.maxCapacity) * 100)
      : 0;
    
    return {
      ...event.toObject(),
      confirmedReservations,
      totalReservations,
      fillRate
    };
  }

  async findAdminOne(id: string, creatorId: string): Promise<Event> {
    const event = await this.eventModel.findById(id).exec();
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    
    if (event.creatorId !== creatorId) {
      throw new ForbiddenException('Access denied');
    }
    
    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto, creatorId: string): Promise<Event> {
    const event = await this.findAdminOne(id, creatorId);
    
    Object.assign(event, updateEventDto);
    return event.save();
  }

  async remove(id: string, creatorId: string): Promise<Event> {
    const event = await this.findAdminOne(id, creatorId);
    
    // Delete all reservations associated with this event
    await this.reservationModel.deleteMany({ eventId: id }).exec();
    
    await this.eventModel.findByIdAndDelete(id).exec();
    return event;
  }

  async publish(id: string, creatorId: string): Promise<Event> {
    const event = await this.findAdminOne(id, creatorId);
    event.status = EventStatus.PUBLISHED;
    return event.save();
  }

  async cancel(id: string, creatorId: string): Promise<Event> {
    const event = await this.findAdminOne(id, creatorId);
    event.status = EventStatus.CANCELED;
    return event.save();
  }

  async getDashboardStats(): Promise<DashboardStatsDto> {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Get all events
    const totalEvents = await this.eventModel.countDocuments().exec();
    
    // Get upcoming events (next 30 days)
    const upcomingEvents = await this.eventModel.countDocuments({
      date: { $gte: now, $lte: thirtyDaysFromNow },
      status: EventStatus.PUBLISHED
    }).exec();

    // Get recent events (last 10)
    const recentEvents = await this.eventModel
      .find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('creatorId', 'email name')
      .exec();

    // Get reservation statistics
    const totalReservations = await this.reservationModel.countDocuments().exec();
    const confirmedReservations = await this.reservationModel.countDocuments({ 
      status: ReservationStatus.CONFIRMED 
    }).exec();
    const pendingReservations = await this.reservationModel.countDocuments({ 
      status: ReservationStatus.PENDING 
    }).exec();
    const refusedReservations = await this.reservationModel.countDocuments({ 
      status: ReservationStatus.REFUSED 
    }).exec();
    const canceledReservations = await this.reservationModel.countDocuments({ 
      status: ReservationStatus.CANCELED 
    }).exec();

    // Get recent reservations (last 10)
    const recentReservations = await this.reservationModel
      .find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('eventId', 'title date location')
      .populate('participantId', 'email name')
      .exec();

    // Calculate average fill rate
    const publishedEvents = await this.eventModel.find({ 
      status: EventStatus.PUBLISHED 
    }).exec();
    
    let totalCapacity = 0;
    let totalConfirmedReservations = 0;
    
    for (const event of publishedEvents) {
      totalCapacity += event.maxCapacity;
      const confirmedCount = await this.reservationModel.countDocuments({
        eventId: event._id,
        status: ReservationStatus.CONFIRMED
      }).exec();
      totalConfirmedReservations += confirmedCount;
    }
    
    const averageFillRate = totalCapacity > 0 
      ? Math.round((totalConfirmedReservations / totalCapacity) * 100)
      : 0;

    return {
      totalEvents,
      upcomingEvents,
      totalReservations,
      confirmedReservations,
      pendingReservations,
      refusedReservations,
      canceledReservations,
      averageFillRate,
      recentEvents,
      recentReservations
    };
  }
}
