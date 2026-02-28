import { Body, Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import type { LoginRequestDto } from '../../contracts';
import { LoginHandler } from './handler';
import { setAuthCookies } from '../../infrastructure/cookie.helper';

@Controller('api/auth')
export class LoginEndpoint {
  constructor(private readonly handler: LoginHandler) { }

  @Post('login')
  async handle(
    @Body() body: LoginRequestDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.handler.execute(body);
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    return { message: 'Login successful' };
  }
}
