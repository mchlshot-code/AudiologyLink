import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { VerifyStudentHandler } from './handler';
import { VerifyStudentRequestDto } from '../../contracts';
import { JwtAuthGuard, RolesGuard, Roles } from '../../../auth/contracts';

@Controller('api/education/students')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VerifyStudentEndpoint {
    constructor(private readonly handler: VerifyStudentHandler) { }

    @Patch(':userId/verify')
    @Roles('admin', 'clinician') // Admins or clinicians can verify
    async handle(@Param('userId') userId: string, @Body() body: VerifyStudentRequestDto) {
        const profile = await this.handler.execute(userId, body);
        return { message: 'Student verification updated', profile };
    }
}
