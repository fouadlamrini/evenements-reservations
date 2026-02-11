import { Test, TestingModule } from '@nestjs/testing';
import { ReservationService } from './reservation.service';
import { Model } from 'mongoose';
import { Reservation, ReservationStatus } from './schemas/reservation.schema';
import { Event, EventStatus } from '../events/schemas/event.schema';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationStatusDto } from './dto/update-reservation.dto';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Types } from 'mongoose';

describe('ReservationService', () => {
  let service: ReservationService;
  let reservationModel: Model<Reservation>;
  let eventModel: Model<Event>;

  const mockEvent = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
    title: 'Test Event',
    status: EventStatus.PUBLISHED,
    maxCapacity: 10,
    save: jest.fn(),
  };

  const mockReservation = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439012'),
    eventId: new Types.ObjectId('507f1f77bcf86cd799439011'),
    participantId: new Types.ObjectId('507f1f77bcf86cd799439013'),
    status: ReservationStatus.PENDING,
    save: jest.fn(),
  };

  const mockReservationModel = {
    create: jest.fn(),
    findOne: jest.fn().mockReturnValue({
      exec: jest.fn(),
    }),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn().mockReturnValue({
      exec: jest.fn(),
    }),
    constructor: jest.fn().mockImplementation(function(data) {
      return { ...data, save: jest.fn().mockResolvedValue(this) };
    }),
  };

  // Mock constructor for the reservation model
  const MockReservationModel = jest.fn() as any;
  MockReservationModel.mockImplementation(function(data) {
    const reservation = { ...data };
    reservation.save = jest.fn().mockResolvedValue(reservation);
    return reservation;
  });

  // Add all the model methods to the constructor
  MockReservationModel.create = mockReservationModel.create;
  MockReservationModel.findOne = mockReservationModel.findOne;
  MockReservationModel.find = mockReservationModel.find;
  MockReservationModel.findById = mockReservationModel.findById;
  MockReservationModel.findByIdAndDelete = mockReservationModel.findByIdAndDelete;
  MockReservationModel.countDocuments = mockReservationModel.countDocuments;

const createMockFindByIdWithExec = (returnValue) => {
  MockReservationModel.findById.mockReturnValue({
    exec: jest.fn().mockResolvedValue(returnValue),
  });
};

const createMockFindByIdWithPopulate = (returnValue) => {
  MockReservationModel.findById.mockReturnValue({
    exec: jest.fn().mockResolvedValue(returnValue),
    populate: jest.fn().mockReturnThis(),
  });
};

  const mockEventModel = {
    findById: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockEvent),
    }),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationService,
        {
          provide: 'ReservationModel',
          useValue: mockReservationModel,
        },
        {
          provide: 'EventModel',
          useValue: mockEventModel,
        },
      ],
    }).compile();

    service = module.get<ReservationService>(ReservationService);
    reservationModel = module.get<Model<Reservation>>('ReservationModel');
    eventModel = module.get<Model<Event>>('EventModel');
    
    // Override the reservationModel constructor
    (service as any).reservationModel = MockReservationModel;
  });

  describe('create', () => {
    it('should create a reservation successfully', async () => {
      const createReservationDto: CreateReservationDto = {
        eventId: '507f1f77bcf86cd799439011',
      };

      const participantId = '507f1f77bcf86cd799439013';

      // Mock event exists and is published
      createMockFindByIdWithExec(mockEvent);

      // Mock user doesn't have existing reservation
      MockReservationModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      // Mock reservation creation
      MockReservationModel.create.mockResolvedValue(mockReservation);

      const result = await service.create(createReservationDto, participantId);

      expect(result.eventId.toString()).toBe(mockReservation.eventId.toString());
      expect(result.participantId.toString()).toBe(mockReservation.participantId.toString());
      expect(result.status).toBe(mockReservation.status);
    });

    it('should throw BadRequestException if user already has reservation', async () => {
      const createReservationDto: CreateReservationDto = {
        eventId: '507f1f77bcf86cd799439011',
      };

      const participantId = '507f1f77bcf86cd799439013';

      // Mock event exists and is published
      createMockFindByIdWithExec(mockEvent);

      // Mock user already has reservation
      MockReservationModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockReservation),
      });

      await expect(service.create(createReservationDto, participantId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if event is not published', async () => {
      const createReservationDto: CreateReservationDto = { eventId: '507f1f77bcf86cd799439011' };
      const participantId = '507f1f77bcf86cd799439013';

      mockEventModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          ...mockEvent,
          status: EventStatus.DRAFT,
        }),
      });

      await expect(service.create(createReservationDto, participantId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if user already has reservation', async () => {
      const createReservationDto: CreateReservationDto = { eventId: '507f1f77bcf86cd799439011' };
      const participantId = '507f1f77bcf86cd799439013';

      mockEventModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockEvent),
      });
      MockReservationModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockReservation),
      });

      await expect(service.create(createReservationDto, participantId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateStatus', () => {
    it('should confirm a reservation successfully', async () => {
      const updateStatusDto: UpdateReservationStatusDto = { status: ReservationStatus.CONFIRMED };
      
      createMockFindByIdWithPopulate(mockReservation);
      mockEventModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockEvent),
      });
      MockReservationModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(5),
      });
      mockReservation.save.mockResolvedValue({
        ...mockReservation,
        status: ReservationStatus.CONFIRMED,
      });

      const result = await service.updateStatus('507f1f77bcf86cd799439012', updateStatusDto);

      expect(result.status).toBe(ReservationStatus.CONFIRMED);
    });

    it('should throw BadRequestException if event is full', async () => {
      const updateStatusDto: UpdateReservationStatusDto = { status: ReservationStatus.CONFIRMED };
      
      createMockFindByIdWithPopulate(mockReservation);
      mockEventModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockEvent),
      });
      MockReservationModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(10),
      });

      await expect(service.updateStatus('507f1f77bcf86cd799439012', updateStatusDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if reservation is canceled', async () => {
      const updateStatusDto: UpdateReservationStatusDto = { status: ReservationStatus.CONFIRMED };
      
      createMockFindByIdWithPopulate({
        ...mockReservation,
        status: ReservationStatus.CANCELED,
      });

      await expect(service.updateStatus('507f1f77bcf86cd799439012', updateStatusDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('cancelByParticipant', () => {
    it('should cancel reservation by participant', async () => {
      createMockFindByIdWithExec(mockReservation);
      mockReservation.save.mockResolvedValue({
        ...mockReservation,
        status: ReservationStatus.CANCELED,
        canceledBy: 'PARTICIPANT',
      });

      const result = await service.cancelByParticipant('507f1f77bcf86cd799439012', '507f1f77bcf86cd799439013');

      expect(result.status).toBe(ReservationStatus.CANCELED);
      expect(result.canceledBy).toBe('PARTICIPANT');
    });

    it('should throw ForbiddenException if user tries to cancel other reservation', async () => {
      createMockFindByIdWithExec({
        ...mockReservation,
        participantId: new Types.ObjectId('507f1f77bcf86cd799439014'),
      });

      await expect(
        service.cancelByParticipant('507f1f77bcf86cd799439012', '507f1f77bcf86cd799439013'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
