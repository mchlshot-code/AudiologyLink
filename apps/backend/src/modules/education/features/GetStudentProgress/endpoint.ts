import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { GetStudentProgressHandler } from './handler';
import { JwtAuthGuard, RolesGuard, Roles } from '../../../auth/contracts';

@Controller('api/education/progress')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GetStudentProgressEndpoint {
    constructor(private readonly handler: GetStudentProgressHandler) { }

    @Get('overview')
    @Roles('student')
    async handle(@Request() req: any) {
        return this.handler.execute(req.user.userId);
    }
}
