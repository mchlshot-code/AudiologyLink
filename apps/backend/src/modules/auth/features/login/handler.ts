import { Injectable } from '@nestjs/common';
import { AuthService } from '../../domain/auth.service';
import type { LoginRequestDto } from '../../contracts';

@Injectable()
export class LoginHandler {
  constructor(private readonly authService: AuthService) {}

  async execute(request: LoginRequestDto) {
    return this.authService.login(request);
  }
}
