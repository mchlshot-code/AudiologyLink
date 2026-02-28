import { Controller, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { RefreshHandler } from './handler';
import { setAuthCookies } from '../../infrastructure/cookie.helper';

@Controller('api/auth')
export class RefreshEndpoint {
  constructor(private readonly handler: RefreshHandler) { }

  @Post('refresh')
  async handle(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken as string | undefined;
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token');
    }

    const tokens = await this.handler.execute(refreshToken);
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    return { message: 'Token refreshed' };
  }
}
