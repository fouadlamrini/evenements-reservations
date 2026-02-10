import { Test, TestingModule } from '@nestjs/testing';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';

describe('ReservationController', () => {
  let controller: ReservationController;
  let reservationService: ReservationService;

  const mockReservationService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getReservationsByEvent: jest.fn(),
    getReservationsByParticipant: jest.fn(),
    updateStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationController],
      providers: [
        {
          provide: ReservationService,
          useValue: mockReservationService,
        },
      ],
    }).compile();

    controller = module.get<ReservationController>(ReservationController);
    reservationService = module.get<ReservationService>(ReservationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
