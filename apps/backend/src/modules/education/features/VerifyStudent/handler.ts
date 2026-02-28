import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { STUDENT_PROFILE_REPOSITORY } from '../../domain/student-profile.repository';
import type { StudentProfileRepository } from '../../domain/student-profile.repository';
import type { VerifyStudentRequestDto, StudentProfileDto } from '../../contracts/education.dto';

@Injectable()
export class VerifyStudentHandler {
    constructor(
        @Inject(STUDENT_PROFILE_REPOSITORY)
        private readonly repository: StudentProfileRepository,
    ) { }

    async execute(userId: string, request: VerifyStudentRequestDto): Promise<StudentProfileDto> {
        const profile = await this.repository.findByUserId(userId);
        if (!profile) {
            throw new NotFoundException('Student profile not found');
        }

        const updated = await this.repository.updateVerificationStatus(userId, request.verificationStatus);
        if (!updated) {
            throw new NotFoundException('Failed to update student profile');
        }

        return updated;
    }
}
