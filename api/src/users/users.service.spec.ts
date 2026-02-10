import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { Model } from 'mongoose';

describe('UsersService', () => {
  let service: UsersService;

  const mockUserModel = {
    create: jest.fn(),
    constructor: jest.fn().mockImplementation(function(data) {
      return { ...data, save: jest.fn().mockResolvedValue(this) };
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: 'UserModel',
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
