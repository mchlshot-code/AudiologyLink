import { Injectable } from '@nestjs/common';
import { AuthService } from '../../domain/auth.service';
import type { RegisterRequestDto } from '../../contracts';

@Injectable()
export class RegisterHandler {
  constructor(private readonly authService: AuthService) {}

  async execute(request: RegisterRequestDto) {
    return this.authService.register(request);
  }
}
