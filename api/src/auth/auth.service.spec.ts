import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { Role } from '../roles/role.enum';
import { CreateUserDto } from '../users/dto/create-user.dto';

// Mock bcrypt at the top level
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

const bcrypt = require('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUser = {
    _id: 'user123',
    email: 'test@example.com',
    password: 'hashedPassword',
    role: Role.Participant,
    name: 'Test User',
    toObject: jest.fn().mockReturnValue({
      _id: 'user123',
      email: 'test@example.com',
      password: 'hashedPassword',
      role: Role.Participant,
      name: 'Test User',
    }),
  };

  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Reset bcrypt mocks specifically
    bcrypt.compare.mockReset();
    bcrypt.hash.mockReset();
  });

  describe('login', () => {
    it('should return access token and user info for valid credentials', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login('test@example.com', 'password');

      expect(result).toEqual({
        access_token: 'jwt-token',
        user: {
          userId: 'user123',
          email: 'test@example.com',
          name: 'Test User',
          role: Role.Participant,
        },
      });
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedPassword');
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: 'user123',
        email: 'test@example.com',
        role: Role.Participant,
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.login('test@example.com', 'password')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      await expect(service.login('test@example.com', 'wrongpassword')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('register', () => {
    it('should create and return new user', async () => {
      const registerDto: CreateUserDto = {
        email: 'newuser@example.com',
        password: 'password',
        role: Role.Participant,
        name: 'New User',
      };

      const createdUser = {
        _id: 'newuser123',
        email: 'newuser@example.com',
        name: 'New User',
        password: 'hashedPassword',
        role: Role.Participant,
        toObject: jest.fn().mockReturnValue({
          _id: 'newuser123',
          email: 'newuser@example.com',
          password: 'hashedPassword',
          role: Role.Participant,
          name: 'New User',
        }),
      };

      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue(createdUser);
      bcrypt.hash.mockResolvedValue('hashedPassword');
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.register(registerDto);

      expect(result).toEqual({
        access_token: 'jwt-token',
        user: {
          userId: 'newuser123',
          email: 'newuser@example.com',
          name: 'New User',
          role: Role.Participant,
        },
      });
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith('newuser@example.com');
      expect(mockUsersService.create).toHaveBeenCalledWith(registerDto, Role.Participant);
    });

    it('should throw UnauthorizedException if user already exists', async () => {
      const registerDto: CreateUserDto = {
        email: 'existing@example.com',
        password: 'password',
        role: Role.Participant,
        name: 'Existing User',
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should use Participant role as default if not provided', async () => {
      const registerDto: CreateUserDto = {
        email: 'newuser@example.com',
        password: 'password',
        name: 'New User',
        role: Role.Participant,
      };

      const createdUser = {
        ...mockUser,
        _id: 'newuser123',
        email: 'newuser@example.com',
        toObject: jest.fn().mockReturnValue({
          _id: 'newuser123',
          email: 'newuser@example.com',
          password: 'hashedPassword',
          role: Role.Participant,
          name: 'New User',
        }),
      };

      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue(createdUser);
      bcrypt.hash.mockResolvedValue('hashedPassword');
      mockJwtService.sign.mockReturnValue('jwt-token');

      await service.register(registerDto);

      expect(mockUsersService.create).toHaveBeenCalledWith(registerDto, Role.Participant);
    });
  });
});
