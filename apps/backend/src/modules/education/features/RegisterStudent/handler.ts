import { Inject, Injectable, ConflictException } from '@nestjs/common';
import { STUDENT_PROFILE_REPOSITORY } from '../../domain/student-profile.repository';
import type { StudentProfileRepository } from '../../domain/student-profile.repository';
import type { RegisterStudentRequestDto, StudentProfileDto } from '../../contracts/education.dto';
import type { AuthenticatedUser } from '../../../auth/contracts';

@Injectable()
export class RegisterStudentHandler {
    constructor(
        @Inject(STUDENT_PROFILE_REPOSITORY)
        private readonly repository: StudentProfileRepository,
    ) { }

    async execute(user: AuthenticatedUser, request: RegisterStudentRequestDto): Promise<StudentProfileDto> {
        const existing = await this.repository.findByUserId(user.userId);
        if (existing) {
            throw new ConflictException('Student profile already exists for this user');
        }

        return this.repository.createProfile({
            userId: user.userId,
            university: request.university,
            studentIdNumber: request.studentIdNumber,
            verificationStatus: 'pending',
            subscriptionStatus: 'inactive',
            subscriptionExpiresAt: null,
        });
    }
}
