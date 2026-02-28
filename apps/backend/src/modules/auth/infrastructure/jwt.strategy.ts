import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { AUTH_REPOSITORY } from '../contracts/auth.constants';
import type { AccessTokenPayload } from '../domain/token-payload';
import type { AuthRepository } from '../domain/auth.repository';
import { Inject } from '@nestjs/common';

const getRequiredEnv = (name: string) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
};

/** Try cookie first, then Authorization header */
const cookieThenBearer = (req: Request): string | null => {
  const fromCookie = req.cookies?.accessToken;
  if (fromCookie) {
    return fromCookie as string;
  }
  return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepository,
  ) {
    super({
      jwtFromRequest: cookieThenBearer,
      ignoreExpiration: false,
      secretOrKey: getRequiredEnv('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: AccessTokenPayload) {
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
}
