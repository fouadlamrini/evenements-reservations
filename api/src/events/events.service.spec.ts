import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { Model } from 'mongoose';
import { Event, EventStatus } from './schemas/event.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('EventsService', () => {
  let service: EventsService;
  let eventModel: Model<Event>;

  const mockEvent = {
    _id: 'event123',
    title: 'Test Event',
    description: 'Test Description',
    date: new Date('2024-12-25'),
    time: '14:00',
    location: 'Test Location',
    maxCapacity: 50,
    status: EventStatus.DRAFT,
    creatorId: 'admin123',
    save: jest.fn().mockImplementation(function() {
      return Promise.resolve(this);
    }),
  };

  const mockEventModel = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    exec: jest.fn(),
  };

  // Mock constructor for the event model
  const MockEventModel = jest.fn() as any;
  MockEventModel.mockImplementation(function(data) {
    const event = { 
      ...mockEvent, 
      ...data, 
      status: data.status || EventStatus.DRAFT,
    };
    event.save = jest.fn().mockResolvedValue(event);
    return event;
  });

  // Add all the model methods to the constructor
  MockEventModel.create = mockEventModel.create;
  MockEventModel.find = mockEventModel.find;
  MockEventModel.findById = mockEventModel.findById;
  MockEventModel.findByIdAndUpdate = mockEventModel.findByIdAndUpdate;
  MockEventModel.findByIdAndDelete = mockEventModel.findByIdAndDelete;
  MockEventModel.exec = mockEventModel.exec;

  const mockReservationModel = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn(),
    populate: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: 'EventModel',
          useValue: mockEventModel,
        },
        {
          provide: 'ReservationModel',
          useValue: mockReservationModel,
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    // Override the eventModel constructor
    (service as any).eventModel = MockEventModel;
    eventModel = module.get<Model<Event>>('EventModel');
  });

  describe('create', () => {
    it('should create an event successfully', async () => {
      const createEventDto: CreateEventDto = {
        title: 'Test Event',
        description: 'Test Description',
        date: new Date('2024-12-25'),
        time: '14:00',
        location: 'Test Location',
        maxCapacity: 50,
      };

      const expectedEvent = {
        ...createEventDto,
        creatorId: 'admin123',
        status: EventStatus.DRAFT,
      };

      const result = await service.create(createEventDto, 'admin123');

      expect(result.title).toBe(expectedEvent.title);
      expect(result.description).toBe(expectedEvent.description);
      expect(result.creatorId).toBe(expectedEvent.creatorId);
      expect(result.status).toBe(expectedEvent.status);
    });
  });

  describe('findAll', () => {
    it('should return all published events', async () => {
      const publishedEvents = [mockEvent];
      
      mockEventModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(publishedEvents),
      } as any);

      const result = await service.findAll();

      expect(result).toEqual(publishedEvents);
      expect(mockEventModel.find).toHaveBeenCalledWith({ status: EventStatus.PUBLISHED });
    });
  });

  describe('findAdminEvents', () => {
    it('should return admin events', async () => {
      const adminEvents = [mockEvent];
      
      mockEventModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(adminEvents),
      } as any);

      const result = await service.findAdminEvents('admin123');

      expect(result).toEqual(adminEvents);
      expect(mockEventModel.find).toHaveBeenCalledWith({ creatorId: 'admin123' });
    });
  });

  describe('findOne', () => {
    it('should return a published event', async () => {
      const publishedEvent = { ...mockEvent, status: EventStatus.PUBLISHED };
      mockEventModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(publishedEvent),
      } as any);

      const result = await service.findOne('event123');

      expect(result).toEqual(publishedEvent);
      expect(mockEventModel.findById).toHaveBeenCalledWith('event123');
    });

    it('should throw NotFoundException if event not found', async () => {
      mockEventModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(service.findOne('invalid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update event successfully', async () => {
      const updateEventDto: UpdateEventDto = {
        title: 'Updated Event',
      };

      const updatedEvent = { ...mockEvent, title: 'Updated Event' };
      
      mockEventModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockEvent),
      } as any);

      // Mock the save method to return the updated event
      const mockSave = jest.fn().mockResolvedValue(updatedEvent);
      mockEvent.save = mockSave;

      const result = await service.update('event123', updateEventDto, 'admin123');

      expect(result.title).toBe('Updated Event');
      expect(mockEventModel.findById).toHaveBeenCalledWith('event123');
    });

    it('should throw ForbiddenException if user is not creator', async () => {
      const updateEventDto: UpdateEventDto = { title: 'Updated Event' };
      
      const otherEvent = { ...mockEvent, creatorId: 'otherAdmin' };
      mockEventModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(otherEvent),
      } as any);

      await expect(
        service.update('event123', updateEventDto, 'admin123'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('publish', () => {
    it('should publish an event successfully', async () => {
      const publishedEvent = { ...mockEvent, status: EventStatus.PUBLISHED };
      
      mockEventModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockEvent),
      } as any);

      // Mock the save method to return the updated event
      const mockSave = jest.fn().mockResolvedValue(publishedEvent);
      mockEvent.save = mockSave;

      const result = await service.publish('event123', 'admin123');

      expect(result.status).toBe(EventStatus.PUBLISHED);
    });

    it('should throw ForbiddenException if user is not creator', async () => {
      const otherEvent = { ...mockEvent, creatorId: 'otherAdmin' };
      mockEventModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(otherEvent),
      } as any);

      await expect(service.publish('event123', 'admin123')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('cancel', () => {
    it('should cancel an event successfully', async () => {
      const canceledEvent = { ...mockEvent, status: EventStatus.CANCELED };
      
      mockEventModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockEvent),
      } as any);

      // Mock the save method to return the updated event
      const mockSave = jest.fn().mockResolvedValue(canceledEvent);
      mockEvent.save = mockSave;

      const result = await service.cancel('event123', 'admin123');

      expect(result.status).toBe(EventStatus.CANCELED);
    });
  });

  describe('remove', () => {
    it('should remove event successfully', async () => {
      mockEventModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockEvent),
      } as any);

      mockEventModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockEvent),
      } as any);

      const result = await service.remove('event123', 'admin123');

      expect(result).toEqual(mockEvent);
    });

    it('should throw ForbiddenException if user is not creator', async () => {
      const otherEvent = { ...mockEvent, creatorId: 'otherAdmin' };
      mockEventModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(otherEvent),
      } as any);

      await expect(service.remove('event123', 'admin123')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
