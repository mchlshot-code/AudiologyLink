export class RegisterStudentRequestDto {
    university: string;
    studentIdNumber: string;
}

export class VerifyStudentRequestDto {
    verificationStatus: 'verified' | 'rejected';
}

export interface StudentProfileDto {
    id: string;
    userId: string;
    university: string;
    studentIdNumber: string;
    verificationStatus: 'pending' | 'verified' | 'rejected';
    subscriptionStatus: 'inactive' | 'active' | 'past_due';
    subscriptionExpiresAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

// ── Enrollment ──

export class EnrollInCourseRequestDto {
    courseSlug: string;
}

export interface CourseEnrollmentDto {
    id: string;
    studentId: string;
    courseReferenceId: string;
    status: 'active' | 'completed' | 'dropped';
    progressPercentage: number;
    createdAt: Date;
    updatedAt: Date;
}

// ── Lesson Progress ──

export class TrackLessonProgressRequestDto {
    completed: boolean;
}

export interface LessonProgressDto {
    id: string;
    enrollmentId: string;
    lessonReferenceId: string;
    status: 'not_started' | 'in_progress' | 'completed';
    lastAccessedAt: Date;
    createdAt: Date;
}

// ── Quiz Attempt ──

export class SubmitQuizAttemptRequestDto {
    quizId: string;
    scorePercentage: number;
    passed: boolean;
}

export interface QuizAttemptDto {
    id: string;
    studentId: string;
    quizReferenceId: string;
    score: number;
    passed: boolean;
    attemptedAt: Date;
}

// ── Student Progress Overview ──

export interface StudentProgressOverviewDto {
    enrolledCourses: string[];
    completedLessons: string[];
    quizAttempts: { quizId: string; score: number; passed: boolean }[];
}
