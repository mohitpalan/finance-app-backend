import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

// Mock bcrypt
jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        JWT_SECRET: 'test-secret',
        JWT_REFRESH_SECRET: 'test-refresh-secret',
        JWT_EXPIRATION: '3600',
        JWT_REFRESH_EXPIRATION: '604800',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'Password123!',
      firstName: 'John',
      lastName: 'Doe',
    };

    it('should successfully register a new user', async () => {
      const hashedPassword = 'hashed-password';
      const hashedRefreshToken = 'hashed-refresh-token';
      const mockUser = {
        id: '123',
        email: registerDto.email,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        role: 'USER',
        createdAt: new Date(),
      };
      const mockTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null); // No existing user
      (bcrypt.hash as jest.Mock).mockImplementation((data) =>
        data === 'Password123!' ? hashedPassword : hashedRefreshToken,
      );
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValueOnce(mockTokens.accessToken);
      mockJwtService.signAsync.mockResolvedValueOnce(mockTokens.refreshToken);
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      const result = await service.register(registerDto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: registerDto.email,
          password: hashedPassword,
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
        },
      });
      expect(result.data.user).toEqual(mockUser);
      expect(result.data.accessToken).toEqual(mockTokens.accessToken);
      expect(result.data.refreshToken).toEqual(mockTokens.refreshToken);
      expect(result.message).toEqual('User registered successfully');
    });

    it('should throw ConflictException if user already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: '123',
        email: registerDto.email,
      });

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.register(registerDto)).rejects.toThrow(
        'User with this email already exists',
      );
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    const mockUser = {
      id: '123',
      email: loginDto.email,
      password: 'hashed-password',
      firstName: 'John',
      lastName: 'Doe',
      role: 'USER',
      status: 'ACTIVE',
      refreshToken: null,
    };

    it('should successfully login a user', async () => {
      const mockTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValueOnce(mockTokens.accessToken);
      mockJwtService.signAsync.mockResolvedValueOnce(mockTokens.refreshToken);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-refresh-token');
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      const result = await service.login(loginDto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
      expect(result.data.user.id).toEqual(mockUser.id);
      expect(result.data.user.email).toEqual(mockUser.email);
      expect(result.data.accessToken).toEqual(mockTokens.accessToken);
      expect(result.message).toEqual('Login successful');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should throw UnauthorizedException if user is not active', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        status: 'INACTIVE',
      });

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'User account is not active',
      );
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });

  describe('refresh', () => {
    const refreshTokenDto: RefreshTokenDto = {
      refreshToken: 'valid-refresh-token',
    };

    const mockUser = {
      id: '123',
      email: 'test@example.com',
      role: 'USER',
      refreshToken: 'hashed-refresh-token',
    };

    it('should successfully refresh tokens', async () => {
      const mockPayload = { sub: '123', email: 'test@example.com', role: 'USER' };
      const newTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      mockJwtService.verify.mockReturnValue(mockPayload);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValueOnce(newTokens.accessToken);
      mockJwtService.signAsync.mockResolvedValueOnce(newTokens.refreshToken);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-refresh-token');
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      const result = await service.refresh(refreshTokenDto);

      expect(mockJwtService.verify).toHaveBeenCalledWith(
        refreshTokenDto.refreshToken,
        { secret: 'test-refresh-secret' },
      );
      expect(result.data.accessToken).toEqual(newTokens.accessToken);
      expect(result.data.refreshToken).toEqual(newTokens.refreshToken);
      expect(result.message).toEqual('Token refreshed successfully');
    });

    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refresh(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.refresh(refreshTokenDto)).rejects.toThrow(
        'Invalid refresh token',
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const mockPayload = { sub: '123', email: 'test@example.com', role: 'USER' };
      mockJwtService.verify.mockReturnValue(mockPayload);
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.refresh(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if stored refresh token does not match', async () => {
      const mockPayload = { sub: '123', email: 'test@example.com', role: 'USER' };
      mockJwtService.verify.mockReturnValue(mockPayload);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.refresh(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should successfully logout user', async () => {
      const userId = '123';
      mockPrismaService.user.update.mockResolvedValue({});

      const result = await service.logout(userId);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { refreshToken: null },
      });
      expect(result.data).toBeNull();
      expect(result.message).toEqual('Logout successful');
    });
  });

  describe('getMe', () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'USER',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should successfully get user info', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getMe('123');

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '123' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(result.data).toEqual(mockUser);
      expect(result.message).toEqual('User retrieved successfully');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getMe('123')).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.getMe('123')).rejects.toThrow('User not found');
    });
  });
});
