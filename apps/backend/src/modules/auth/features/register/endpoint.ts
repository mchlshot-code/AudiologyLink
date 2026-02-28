import { Body, Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import type { RegisterRequestDto } from '../../contracts';
import { RegisterHandler } from './handler';
import { setAuthCookies } from '../../infrastructure/cookie.helper';

@Controller('api/auth')
export class RegisterEndpoint {
  constructor(private readonly handler: RegisterHandler) { }

  @Post('register')
  async handle(
    @Body() body: RegisterRequestDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.handler.execute(body);
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    return { message: 'Registration successful' };
  }
}
