import { Pool, type PoolConfig } from 'pg';
import type { EducationRepository } from '../domain/education.repository';
import type {
    CourseEnrollmentDto,
    LessonProgressDto,
    QuizAttemptDto,
    StudentProgressOverviewDto,
} from '../contracts/education.dto';

export class PostgresEducationRepository implements EducationRepository {
    private readonly pool: Pool;
    private readonly schema = 'education';

    constructor() {
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) {
            throw new Error('DATABASE_URL is not set');
        }

        const poolConfig: PoolConfig = {
            connectionString,
            ssl:
                process.env.DATABASE_SSL === 'true'
                    ? { rejectUnauthorized: false }
                    : undefined,
        };
        this.pool = new Pool(poolConfig);
    }

    // ── Enrollments ──────────────────────────────────────────────────────────

    async createEnrollment(studentId: string, courseSlug: string): Promise<CourseEnrollmentDto> {
        const result = await this.pool.query<any>(
            `INSERT INTO ${this.schema}.course_enrollments
                (student_id, course_reference_id, status, progress_percentage)
             VALUES ($1, $2, 'active', 0)
             RETURNING
                id, student_id AS "studentId", course_reference_id AS "courseReferenceId",
                status, progress_percentage AS "progressPercentage",
                created_at AS "createdAt", updated_at AS "updatedAt"`,
            [studentId, courseSlug],
        );
        return result.rows[0];
    }

    async findEnrollmentByStudentAndCourse(studentId: string, courseSlug: string): Promise<CourseEnrollmentDto | null> {
        const result = await this.pool.query<any>(
            `SELECT id, student_id AS "studentId", course_reference_id AS "courseReferenceId",
                    status, progress_percentage AS "progressPercentage",
                    created_at AS "createdAt", updated_at AS "updatedAt"
             FROM ${this.schema}.course_enrollments
             WHERE student_id = $1 AND course_reference_id = $2
             LIMIT 1`,
            [studentId, courseSlug],
        );
        return result.rows[0] ?? null;
    }

    async findEnrollmentsByStudent(studentId: string): Promise<CourseEnrollmentDto[]> {
        const result = await this.pool.query<any>(
            `SELECT id, student_id AS "studentId", course_reference_id AS "courseReferenceId",
                    status, progress_percentage AS "progressPercentage",
                    created_at AS "createdAt", updated_at AS "updatedAt"
             FROM ${this.schema}.course_enrollments
             WHERE student_id = $1
             ORDER BY created_at DESC`,
            [studentId],
        );
        return result.rows;
    }

    // ── Lesson Progress ──────────────────────────────────────────────────────

    async upsertLessonProgress(enrollmentId: string, lessonId: string, completed: boolean): Promise<LessonProgressDto> {
        const status = completed ? 'completed' : 'in_progress';
        const result = await this.pool.query<any>(
            `INSERT INTO ${this.schema}.lesson_progress
                (enrollment_id, lesson_reference_id, status, last_accessed_at)
             VALUES ($1, $2, $3, NOW())
             ON CONFLICT (enrollment_id, lesson_reference_id)
             DO UPDATE SET
                status = $3,
                last_accessed_at = NOW()
             RETURNING
                id, enrollment_id AS "enrollmentId", lesson_reference_id AS "lessonReferenceId",
                status, last_accessed_at AS "lastAccessedAt",
                created_at AS "createdAt"`,
            [enrollmentId, lessonId, status],
        );
        return result.rows[0];
    }

    // ── Quiz Attempts ────────────────────────────────────────────────────────

    async createQuizAttempt(studentId: string, quizId: string, scorePercentage: number, passed: boolean): Promise<QuizAttemptDto> {
        const result = await this.pool.query<any>(
            `INSERT INTO ${this.schema}.quiz_attempts
                (student_id, quiz_reference_id, score, passed, completed_at)
             VALUES ($1, $2, $3, $4, NOW())
             RETURNING
                id, student_id AS "studentId", quiz_reference_id AS "quizReferenceId",
                score, passed,
                created_at AS "attemptedAt"`,
            [studentId, quizId, scorePercentage, passed],
        );
        return result.rows[0];
    }

    // ── Progress Overview ────────────────────────────────────────────────────

    async getStudentProgressOverview(studentId: string): Promise<StudentProgressOverviewDto> {
        // Run the three queries in parallel for performance
        const [enrollmentsResult, lessonsResult, quizzesResult] = await Promise.all([
            this.pool.query<any>(
                `SELECT course_reference_id
                 FROM ${this.schema}.course_enrollments
                 WHERE student_id = $1 AND status = 'active'`,
                [studentId],
            ),
            this.pool.query<any>(
                `SELECT lp.lesson_reference_id
                 FROM ${this.schema}.lesson_progress lp
                 JOIN ${this.schema}.course_enrollments ce ON ce.id = lp.enrollment_id
                 WHERE ce.student_id = $1 AND lp.status = 'completed'`,
                [studentId],
            ),
            this.pool.query<any>(
                `SELECT quiz_reference_id AS "quizId", score, passed
                 FROM ${this.schema}.quiz_attempts
                 WHERE student_id = $1
                 ORDER BY created_at DESC`,
                [studentId],
            ),
        ]);

        return {
            enrolledCourses: enrollmentsResult.rows.map((r: any) => r.course_reference_id),
            completedLessons: lessonsResult.rows.map((r: any) => r.lesson_reference_id),
            quizAttempts: quizzesResult.rows,
        };
    }
}
