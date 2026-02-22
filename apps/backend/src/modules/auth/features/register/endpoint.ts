import { Body, Controller, Post } from '@nestjs/common';
import type { RegisterRequestDto } from '../../contracts';
import { RegisterHandler } from './handler';

@Controller('api/auth')
export class RegisterEndpoint {
  constructor(private readonly handler: RegisterHandler) {}

  @Post('register')
  async handle(@Body() body: RegisterRequestDto) {
    return this.handler.execute(body);
  }
}
