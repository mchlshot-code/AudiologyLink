import type {
    CourseEnrollmentDto,
    LessonProgressDto,
    QuizAttemptDto,
    StudentProgressOverviewDto,
} from '../contracts/education.dto';

export const EDUCATION_REPOSITORY = Symbol('EDUCATION_REPOSITORY');

export interface EducationRepository {
    // ── Enrollments ──
    createEnrollment(studentId: string, courseSlug: string): Promise<CourseEnrollmentDto>;
    findEnrollmentByStudentAndCourse(studentId: string, courseSlug: string): Promise<CourseEnrollmentDto | null>;

    // ── Lesson Progress ──
    upsertLessonProgress(enrollmentId: string, lessonId: string, completed: boolean): Promise<LessonProgressDto>;

    // ── Quiz Attempts ──
    createQuizAttempt(studentId: string, quizId: string, scorePercentage: number, passed: boolean): Promise<QuizAttemptDto>;

    // ── Progress Overview ──
    getStudentProgressOverview(studentId: string): Promise<StudentProgressOverviewDto>;

    // ── Helper: find enrollment by student + course slug ──
    findEnrollmentsByStudent(studentId: string): Promise<CourseEnrollmentDto[]>;
}
