import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EDUCATION_REPOSITORY, type EducationRepository } from '../../domain/education.repository';
import { STUDENT_PROFILE_REPOSITORY, type StudentProfileRepository } from '../../domain/student-profile.repository';

@Injectable()
export class TrackLessonProgressHandler {
    constructor(
        @Inject(EDUCATION_REPOSITORY) private readonly educationRepo: EducationRepository,
        @Inject(STUDENT_PROFILE_REPOSITORY) private readonly profileRepo: StudentProfileRepository,
    ) { }

    /**
     * Upserts lesson progress for the authenticated student.
     * The handler resolves the enrollment from the student profile and the lesson's parent course.
     * For MVP simplicity, lessonId is the Strapi lesson reference and we find the first active enrollment.
     */
    async execute(userId: string, lessonId: string, completed: boolean) {
        const profile = await this.profileRepo.findByUserId(userId);
        if (!profile) {
            throw new NotFoundException('Student profile not found.');
        }

        // Find the student's enrollments — the frontend sends the lessonId,
        // and lesson_progress is scoped to an enrollment.
        // For MVP: we find ALL active enrollments. The lesson_progress table's
        // UNIQUE(enrollment_id, lesson_reference_id) will ensure correctness.
        const enrollments = await this.educationRepo.findEnrollmentsByStudent(profile.id);
        if (!enrollments.length) {
            throw new NotFoundException('No active enrollments found.');
        }

        // Use the first active enrollment (MVP — single course per student is typical initially).
        // In a multi-course scenario, the frontend would pass courseSlug too.
        const enrollment = enrollments[0];

        const progress = await this.educationRepo.upsertLessonProgress(enrollment.id, lessonId, completed);
        return progress;
    }
}
