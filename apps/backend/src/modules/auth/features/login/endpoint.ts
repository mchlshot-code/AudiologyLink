import { Body, Controller, Post } from '@nestjs/common';
import type { LoginRequestDto } from '../../contracts';
import { LoginHandler } from './handler';

@Controller('api/auth')
export class LoginEndpoint {
  constructor(private readonly handler: LoginHandler) {}

  @Post('login')
  async handle(@Body() body: LoginRequestDto) {
    return this.handler.execute(body);
  }
}
