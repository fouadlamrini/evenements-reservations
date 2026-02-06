import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event, EventStatus } from './schemas/event.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(@InjectModel(Event.name) private eventModel: Model<Event>) {}

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
}
