import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CANCELED = 'CANCELED',
}

@Schema({ timestamps: true })
export class Event extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  time: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  maxCapacity: number;

  @Prop({ 
    type: String, 
    enum: EventStatus, 
    default: EventStatus.DRAFT 
  })
  status: EventStatus;

  @Prop({ required: true })
  creatorId: string;
}

export const EventSchema = SchemaFactory.createForClass(Event);