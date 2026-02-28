import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { RegisterStudentHandler } from './handler';
import { RegisterStudentRequestDto } from '../../contracts';
import { JwtAuthGuard, RolesGuard, Roles } from '../../../auth/contracts';

@Controller('api/education/students')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RegisterStudentEndpoint {
    constructor(private readonly handler: RegisterStudentHandler) { }

    @Post('register')
    @Roles('student')
    async handle(@Request() req: any, @Body() body: RegisterStudentRequestDto) {
        const profile = await this.handler.execute(req.user, body);
        return { message: 'Student profile created', profile };
    }
}
