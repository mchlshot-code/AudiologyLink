import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PostgresStudentProfileRepository } from './infrastructure/postgres-student-profile.repository';
import { STUDENT_PROFILE_REPOSITORY } from './domain/student-profile.repository';
import { EDUCATION_REPOSITORY } from './domain/education.repository';
import { PostgresEducationRepository } from './infrastructure/postgres-education.repository';

// ── Existing Features ──
import { RegisterStudentEndpoint } from './features/register-student/endpoint';
import { RegisterStudentHandler } from './features/register-student/handler';
import { VerifyStudentEndpoint } from './features/verify-student/endpoint';
import { VerifyStudentHandler } from './features/verify-student/handler';

// ── New Features ──
import { EnrollInCourseEndpoint } from './features/enroll-in-course/endpoint';
import { EnrollInCourseHandler } from './features/enroll-in-course/handler';
import { TrackLessonProgressEndpoint } from './features/track-lesson-progress/endpoint';
import { TrackLessonProgressHandler } from './features/track-lesson-progress/handler';
import { SubmitQuizAttemptEndpoint } from './features/submit-quiz-attempt/endpoint';
import { SubmitQuizAttemptHandler } from './features/submit-quiz-attempt/handler';
import { GetStudentProgressEndpoint } from './features/get-student-progress/endpoint';
import { GetStudentProgressHandler } from './features/get-student-progress/handler';

@Module({
    imports: [AuthModule],
    controllers: [
        RegisterStudentEndpoint,
        VerifyStudentEndpoint,
        EnrollInCourseEndpoint,
        TrackLessonProgressEndpoint,
        SubmitQuizAttemptEndpoint,
        GetStudentProgressEndpoint,
    ],
    providers: [
        {
            provide: STUDENT_PROFILE_REPOSITORY,
            useClass: PostgresStudentProfileRepository,
        },
        {
            provide: EDUCATION_REPOSITORY,
            useClass: PostgresEducationRepository,
        },
        RegisterStudentHandler,
        VerifyStudentHandler,
        EnrollInCourseHandler,
        TrackLessonProgressHandler,
        SubmitQuizAttemptHandler,
        GetStudentProgressHandler,
    ],
    exports: [],
})
export class EducationModule { }
