import { Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { clearAuthCookies } from '../../infrastructure/cookie.helper';

@Controller('api/auth')
export class LogoutEndpoint {
    @Post('logout')
    handle(@Res({ passthrough: true }) res: Response) {
        clearAuthCookies(res);
        return { message: 'Logged out' };
    }
}
