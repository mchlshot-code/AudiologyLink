import { Injectable } from '@nestjs/common';
import { AuthService } from '../../domain/auth.service';

@Injectable()
export class RefreshHandler {
  constructor(private readonly authService: AuthService) {}

  async execute(refreshToken: string) {
    return this.authService.refresh(refreshToken);
  }
}
