import { Body, Controller, Post } from '@nestjs/common';
import type { RefreshRequestDto } from '../../contracts';
import { RefreshHandler } from './handler';

@Controller('api/auth')
export class RefreshEndpoint {
  constructor(private readonly handler: RefreshHandler) {}

  @Post('refresh')
  async handle(@Body() body: RefreshRequestDto) {
    return this.handler.execute(body.refreshToken);
  }
}
