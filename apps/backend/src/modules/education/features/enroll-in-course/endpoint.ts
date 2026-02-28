import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { EnrollInCourseHandler } from './handler';
import { EnrollInCourseRequestDto } from '../../contracts';
import { JwtAuthGuard, RolesGuard, Roles } from '../../../auth/contracts';

@Controller('api/education')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EnrollInCourseEndpoint {
    constructor(private readonly handler: EnrollInCourseHandler) { }

    @Post('enrollments')
    @Roles('student')
    async handle(@Request() req: any, @Body() body: EnrollInCourseRequestDto) {
        const enrollment = await this.handler.execute(req.user.userId, body.courseSlug);
        return { message: 'Enrolled successfully', enrollment };
    }
}
