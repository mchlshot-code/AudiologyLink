import { Inject, Injectable, ConflictException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EDUCATION_REPOSITORY, type EducationRepository } from '../../domain/education.repository';
import { STUDENT_PROFILE_REPOSITORY, type StudentProfileRepository } from '../../domain/student-profile.repository';

@Injectable()
export class EnrollInCourseHandler {
    constructor(
        @Inject(EDUCATION_REPOSITORY) private readonly educationRepo: EducationRepository,
        @Inject(STUDENT_PROFILE_REPOSITORY) private readonly profileRepo: StudentProfileRepository,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    async execute(userId: string, courseSlug: string) {
        // 1. Look up the student profile by user_id
        const profile = await this.profileRepo.findByUserId(userId);
        if (!profile) {
            throw new ConflictException('Student profile not found. Please complete registration first.');
        }

        // 2. Check for existing enrollment
        const existing = await this.educationRepo.findEnrollmentByStudentAndCourse(profile.id, courseSlug);
        if (existing) {
            throw new ConflictException('You are already enrolled in this course.');
        }

        // 3. Create enrollment
        const enrollment = await this.educationRepo.createEnrollment(profile.id, courseSlug);

        // 4. Emit event
        this.eventEmitter.emit('student.enrolled', {
            userId,
            studentId: profile.id,
            courseSlug,
            enrollmentId: enrollment.id,
        });

        return enrollment;
    }
}
