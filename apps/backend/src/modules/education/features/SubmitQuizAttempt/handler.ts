import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EDUCATION_REPOSITORY, type EducationRepository } from '../../domain/education.repository';
import { STUDENT_PROFILE_REPOSITORY, type StudentProfileRepository } from '../../domain/student-profile.repository';

@Injectable()
export class SubmitQuizAttemptHandler {
    constructor(
        @Inject(EDUCATION_REPOSITORY) private readonly educationRepo: EducationRepository,
        @Inject(STUDENT_PROFILE_REPOSITORY) private readonly profileRepo: StudentProfileRepository,
    ) { }

    async execute(userId: string, quizId: string, scorePercentage: number, passed: boolean) {
        const profile = await this.profileRepo.findByUserId(userId);
        if (!profile) {
            throw new NotFoundException('Student profile not found.');
        }

        const attempt = await this.educationRepo.createQuizAttempt(
            profile.id,
            quizId,
            scorePercentage,
            passed,
        );

        return attempt;
    }
}
