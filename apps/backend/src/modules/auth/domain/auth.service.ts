import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import type {
  AuthenticatedUser,
  AuthTokensDto,
  LoginRequestDto,
  RegisterRequestDto,
} from '../contracts';
import { AUTH_ROLES, type Role } from '../contracts/auth.roles';
import { AUTH_REPOSITORY, PASSWORD_HASHER } from '../contracts/auth.constants';
import type { AuthRepository } from './auth.repository';
import type { AuthUser } from './auth.user';
import type { PasswordHasher } from './password-hasher';
import type { AccessTokenPayload, RefreshTokenPayload } from './token-payload';

const getRequiredEnv = (name: string) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
};

const parseTtlSeconds = (
  value: string | undefined,
  fallbackSeconds: number,
) => {
  if (!value) {
    return fallbackSeconds;
  }

  const match = value.match(/^(\d+)([smhd])$/);
  if (!match) {
    return fallbackSeconds;
  }

  const amount = Number.parseInt(match[1], 10);
  const unit = match[2];
  const multipliers: Record<string, number> = {
    s: 1,
    m: 60,
    h: 60 * 60,
    d: 24 * 60 * 60,
  };

  return amount * (multipliers[unit] ?? 1);
};

@Injectable()
export class AuthService {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
    private readonly jwtService: JwtService,
  ) {}

  async login(request: LoginRequestDto): Promise<AuthTokensDto> {
    const user = await this.authRepository.findByEmail(request.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await this.passwordHasher.compare(
      request.password,
      user.passwordHash,
    );
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueTokens(user);
  }

  async register(request: RegisterRequestDto): Promise<AuthTokensDto> {
    const existing = await this.authRepository.findByEmail(request.email);
    if (existing) {
      throw new BadRequestException('Email already registered');
    }

    const roles = this.normalizeRoles(request.roles);
    const passwordHash = await this.passwordHasher.hash(request.password);

    const user: AuthUser = {
      id: randomUUID(),
      email: request.email,
      passwordHash,
      roles,
    };

    await this.authRepository.saveUser(user);

    return this.issueTokens(user);
  }

  async refresh(refreshToken: string): Promise<AuthTokensDto> {
    const payload = await this.verifyRefreshToken(refreshToken);
    const record = await this.authRepository.findRefreshToken(
      payload.sub,
      payload.tokenId,
    );
    if (!record) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (record.expiresAt.getTime() < Date.now()) {
      await this.authRepository.revokeRefreshToken(
        payload.sub,
        payload.tokenId,
      );
      throw new UnauthorizedException('Refresh token expired');
    }

    const isValid = await this.passwordHasher.compare(
      refreshToken,
      record.hashedToken,
    );
    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.authRepository.revokeRefreshToken(payload.sub, payload.tokenId);

    const user = await this.authRepository.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.issueTokens(user);
  }

  async validateUser(payload: AccessTokenPayload): Promise<AuthenticatedUser> {
    const user = await this.authRepository.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      userId: user.id,
      email: user.email,
      roles: user.roles,
    };
  }

  private async issueTokens(user: AuthUser): Promise<AuthTokensDto> {
    const accessPayload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
    };

    const accessToken = await this.jwtService.signAsync(accessPayload, {
      secret: getRequiredEnv('JWT_ACCESS_SECRET'),
      expiresIn: parseTtlSeconds(process.env.JWT_ACCESS_TTL, 15 * 60),
    });

    const tokenId = randomUUID();
    const refreshPayload: RefreshTokenPayload = {
      sub: user.id,
      tokenId,
    };

    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      secret: getRequiredEnv('JWT_REFRESH_SECRET'),
      expiresIn: parseTtlSeconds(process.env.JWT_REFRESH_TTL, 7 * 24 * 60 * 60),
    });

    const hashedToken = await this.passwordHasher.hash(refreshToken);
    const expiresAt = this.getExpiryDate(process.env.JWT_REFRESH_TTL ?? '7d');

    await this.authRepository.saveRefreshToken({
      userId: user.id,
      tokenId,
      hashedToken,
      expiresAt,
    });

    return { accessToken, refreshToken };
  }

  private async verifyRefreshToken(
    refreshToken: string,
  ): Promise<RefreshTokenPayload> {
    try {
      return await this.jwtService.verifyAsync<RefreshTokenPayload>(
        refreshToken,
        {
          secret: getRequiredEnv('JWT_REFRESH_SECRET'),
        },
      );
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private getExpiryDate(duration: string): Date {
    const now = Date.now();
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) {
      return new Date(now + 7 * 24 * 60 * 60 * 1000);
    }

    const value = Number.parseInt(match[1], 10);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return new Date(now + value * (multipliers[unit] ?? multipliers.d));
  }

  private normalizeRoles(roles: string[] | undefined): Role[] {
    if (!roles || roles.length === 0) {
      return ['patient'];
    }

    const normalized = roles.map((role) => role.trim());
    const invalid = normalized.filter(
      (role) => !AUTH_ROLES.includes(role as Role),
    );
    if (invalid.length > 0) {
      throw new BadRequestException(`Invalid roles: ${invalid.join(', ')}`);
    }

    return normalized as Role[];
  }
}
