import { Body, Controller, Param, Patch, Request, UseGuards } from '@nestjs/common';
import { TrackLessonProgressHandler } from './handler';
import { TrackLessonProgressRequestDto } from '../../contracts';
import { JwtAuthGuard, RolesGuard, Roles } from '../../../auth/contracts';

@Controller('api/education/progress')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TrackLessonProgressEndpoint {
    constructor(private readonly handler: TrackLessonProgressHandler) { }

    @Patch('lesson/:lessonId')
    @Roles('student')
    async handle(
        @Request() req: any,
        @Param('lessonId') lessonId: string,
        @Body() body: TrackLessonProgressRequestDto,
    ) {
        const progress = await this.handler.execute(req.user.userId, lessonId, body.completed);
        return { message: 'Lesson progress updated', progress };
    }
}
