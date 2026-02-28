import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { SubmitQuizAttemptHandler } from './handler';
import { SubmitQuizAttemptRequestDto } from '../../contracts';
import { JwtAuthGuard, RolesGuard, Roles } from '../../../auth/contracts';

@Controller('api/education')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubmitQuizAttemptEndpoint {
    constructor(private readonly handler: SubmitQuizAttemptHandler) { }

    @Post('quiz-attempts')
    @Roles('student')
    async handle(@Request() req: any, @Body() body: SubmitQuizAttemptRequestDto) {
        const attempt = await this.handler.execute(
            req.user.userId,
            body.quizId,
            body.scorePercentage,
            body.passed,
        );
        return { message: 'Quiz attempt recorded', attempt };
    }
}
