import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../contracts';
import type { AuthenticatedUser } from '../../contracts';

@Controller('api/auth')
export class MeEndpoint {
    @UseGuards(JwtAuthGuard)
    @Get('me')
    handle(@Req() req: Request) {
        const user = req.user as AuthenticatedUser;
        return {
            userId: user.userId,
            email: user.email,
            roles: user.roles,
        };
    }
}
