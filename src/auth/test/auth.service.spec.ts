import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { getModelToken } from '@nestjs/sequelize';
import { User, UserRole } from '../../../sequelize/models/user';
import { MailerService } from '../../mailer/mailer.service';
import { HttpException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let cacheManager: any;
  let userModel: any;
  let mailerService: MailerService;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test',
    surname: 'User',
    password: 'hashedPassword',
    role: UserRole.USER,
    isEmailVerified: false,
    patronymic: '',
    avatarPath: '',
    tours: [],
    organizationApplication: null,
    bookings: [],
    dataValues: {
      id: 1,
      email: 'test@example.com',
      name: 'Test',
      surname: 'User',
      password: 'hashedPassword',
      role: UserRole.USER,
      isEmailVerified: false,
      patronymic: '',
      avatarPath: '',
    }
  } as unknown as User;

  beforeEach(async () => {
    process.env.REDIS_APPROVE_KEY = '123456';
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        {
          provide: MailerService,
          useValue: {
            sendVerificationCode: jest.fn(),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    cacheManager = module.get(CACHE_MANAGER);
    userModel = module.get(getModelToken(User));
    mailerService = module.get<MailerService>(MailerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserInfo', () => {
    it('should return user info', async () => {
      userModel.findOne.mockResolvedValue(mockUser);
      const result = await service.getUserInfo(1);
      expect(result).toEqual(mockUser);
    });
  });

  describe('loginUser', () => {
    it('should login user successfully', async () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };
      const token = 'jwt-token';
      const verifiedUser = { ...mockUser, isEmailVerified: true } as unknown as User;

      jest.spyOn(service, 'validateUser').mockResolvedValue(verifiedUser);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue(token);

      const result = await service.loginUser(loginDto);

      expect(result).toEqual({
        token,
        user: { ...verifiedUser, dataValues: { ...verifiedUser.dataValues, password: '' } }
      });
    });
  });

  describe('registerUser', () => {
    it('should register new user successfully', async () => {
      const registerDto = {
        email: 'new@example.com',
        password: 'password123',
        name: 'New',
        surname: 'User'
      };

      cacheManager.get.mockResolvedValue(process.env.REDIS_APPROVE_KEY);
      userModel.create.mockResolvedValue(mockUser);
      
      const result = await service.registerUser(registerDto);

      expect(result).toHaveProperty('user');
      expect(mockUser.dataValues.password).toBe('');
    });

    it('should throw error if approve code is invalid', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test',
        surname: 'User'
      };

      cacheManager.get.mockResolvedValue('wrong-code');

      await expect(service.registerUser(registerDto)).rejects.toThrow(HttpException);
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      const verifyDto = {
        email: 'test@example.com',
        code: '123456'
      };

      userModel.findOne.mockResolvedValue(null);
      cacheManager.get.mockResolvedValue('123456');

      await service.verifyEmail(verifyDto);

      expect(cacheManager.set).toHaveBeenCalledWith(
        `verify:${verifyDto.email}`,
        process.env.REDIS_APPROVE_KEY,
        expect.any(Number)
      );
    });

    it('should throw error if user already exists', async () => {
      const verifyDto = {
        email: 'test@example.com',
        code: '123456'
      };

      userModel.findOne.mockResolvedValue(mockUser);

      await expect(service.verifyEmail(verifyDto)).rejects.toThrow(HttpException);
    });

    it('should throw error if verification code is invalid', async () => {
      const verifyDto = {
        email: 'test@example.com',
        code: '123456'
      };

      userModel.findOne.mockResolvedValue(null);
      cacheManager.get.mockResolvedValue('654321');

      await expect(service.verifyEmail(verifyDto)).rejects.toThrow(HttpException);
    });
  });

  describe('validateUser', () => {
    it('should validate user successfully', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123'
      };

      userModel.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));

      const result = await service.validateUser(loginDto);
      expect(result).toEqual(mockUser);
    });

    it('should throw error if user not found', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      userModel.findOne.mockResolvedValue(null);

      await expect(service.validateUser(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw error if password is incorrect', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      userModel.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      await expect(service.validateUser(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });
}); 