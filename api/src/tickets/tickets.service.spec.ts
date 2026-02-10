import { Test, TestingModule } from '@nestjs/testing';
import { TicketsService } from './tickets.service';
import { Model } from 'mongoose';

describe('TicketsService', () => {
  let service: TicketsService;

  const mockReservationModel = {
    findById: jest.fn(),
    populate: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };

  const mockEventModel = {
    findById: jest.fn(),
    populate: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };

  const mockUserModel = {
    findById: jest.fn(),
    populate: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        {
          provide: 'ReservationModel',
          useValue: mockReservationModel,
        },
        {
          provide: 'EventModel',
          useValue: mockEventModel,
        },
        {
          provide: 'UserModel',
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
