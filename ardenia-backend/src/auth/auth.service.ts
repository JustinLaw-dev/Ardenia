import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../database/database.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private databaseService: DatabaseService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, username, displayName } = registerDto;

    // Check if user already exists
    const existingUser = await this.databaseService.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Check username uniqueness if provided
    if (username) {
      const existingUsername = await this.databaseService.user.findUnique({
        where: { username },
      });

      if (existingUsername) {
        throw new ConflictException('Username already taken');
      }
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user with ADHD-optimized defaults
    const user = await this.databaseService.user.create({
      data: {
        email,
        passwordHash,
        username,
        displayName: displayName || username || email.split('@')[0],
        // ADHD defaults
        rewardSensitivity: 5,
        preferredTaskLength: 25, // Pomodoro default
        breakLength: 5,
        enableHapticFeedback: true,
        enableSoundEffects: true,
        enableAnimations: true,
        theme: 'light',
        totalPoints: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email);

    return {
      user,
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user
    const user = await this.databaseService.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.databaseService.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        totalPoints: user.totalPoints,
        level: user.level,
        currentStreak: user.currentStreak,
      },
      ...tokens,
    };
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;

    // Verify refresh token
    let payload;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check if refresh token exists in database
    const storedToken = await this.databaseService.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    // Check if token is expired
    if (storedToken.expiresAt < new Date()) {
      await this.databaseService.refreshToken.delete({
        where: { id: storedToken.id },
      });
      throw new UnauthorizedException('Refresh token expired');
    }

    // Generate new tokens
    const tokens = await this.generateTokens(payload.sub, payload.email);

    // Delete old refresh token
    await this.databaseService.refreshToken.delete({
      where: { id: storedToken.id },
    });

    return tokens;
  }

  async logout(userId: string, refreshToken: string) {
    // Delete refresh token
    await this.databaseService.refreshToken.deleteMany({
      where: {
        userId,
        token: refreshToken,
      },
    });

    return { message: 'Logged out successfully' };
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    // Generate access token
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN'),
    });

    // Generate refresh token
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN'),
    });

    // Store refresh token in database
    const expiresIn = this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN');
    const expiresAt = new Date();

    // Parse expiration time (e.g., "7d" -> 7 days)
    const timeValue = parseInt(expiresIn);
    const timeUnit = expiresIn.slice(-1);

    if (timeUnit === 'd') {
      expiresAt.setDate(expiresAt.getDate() + timeValue);
    } else if (timeUnit === 'h') {
      expiresAt.setHours(expiresAt.getHours() + timeValue);
    } else if (timeUnit === 'm') {
      expiresAt.setMinutes(expiresAt.getMinutes() + timeValue);
    }

    await this.databaseService.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async validateUser(userId: string) {
    const user = await this.databaseService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        totalPoints: true,
        level: true,
        currentStreak: true,
        longestStreak: true,
        adhdSubtype: true,
        rewardSensitivity: true,
        preferredTaskLength: true,
        breakLength: true,
        theme: true,
        enableHapticFeedback: true,
        enableSoundEffects: true,
        enableAnimations: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
