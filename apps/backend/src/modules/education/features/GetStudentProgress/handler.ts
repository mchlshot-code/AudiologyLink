import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EDUCATION_REPOSITORY, type EducationRepository } from '../../domain/education.repository';
import { STUDENT_PROFILE_REPOSITORY, type StudentProfileRepository } from '../../domain/student-profile.repository';

@Injectable()
export class GetStudentProgressHandler {
    constructor(
        @Inject(EDUCATION_REPOSITORY) private readonly educationRepo: EducationRepository,
        @Inject(STUDENT_PROFILE_REPOSITORY) private readonly profileRepo: StudentProfileRepository,
    ) { }

    async execute(userId: string) {
        const profile = await this.profileRepo.findByUserId(userId);
        if (!profile) {
            throw new NotFoundException('Student profile not found.');
        }

        return this.educationRepo.getStudentProgressOverview(profile.id);
    }
}
