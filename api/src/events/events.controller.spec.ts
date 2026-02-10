import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

describe('EventsController', () => {
  let controller: EventsController;
  let eventsService: EventsService;

  const mockEventsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findAdminEvents: jest.fn(),
    findOne: jest.fn(),
    findAdminOne: jest.fn(),
    update: jest.fn(),
    publish: jest.fn(),
    cancel: jest.fn(),
    remove: jest.fn(),
    getDashboardStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        {
          provide: EventsService,
          useValue: mockEventsService,
        },
      ],
    }).compile();

    controller = module.get<EventsController>(EventsController);
    eventsService = module.get<EventsService>(EventsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
