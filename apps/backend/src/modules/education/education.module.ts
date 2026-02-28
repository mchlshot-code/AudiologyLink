import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PostgresStudentProfileRepository } from './infrastructure/postgres-student-profile.repository';
import { STUDENT_PROFILE_REPOSITORY } from './domain/student-profile.repository';
import { EDUCATION_REPOSITORY } from './domain/education.repository';
import { PostgresEducationRepository } from './infrastructure/postgres-education.repository';

// ── Existing Features ──
import { RegisterStudentEndpoint } from './features/RegisterStudent/endpoint';
import { RegisterStudentHandler } from './features/RegisterStudent/handler';
import { VerifyStudentEndpoint } from './features/VerifyStudent/endpoint';
import { VerifyStudentHandler } from './features/VerifyStudent/handler';

// ── New Features ──
import { EnrollInCourseEndpoint } from './features/EnrollInCourse/endpoint';
import { EnrollInCourseHandler } from './features/EnrollInCourse/handler';
import { TrackLessonProgressEndpoint } from './features/TrackLessonProgress/endpoint';
import { TrackLessonProgressHandler } from './features/TrackLessonProgress/handler';
import { SubmitQuizAttemptEndpoint } from './features/SubmitQuizAttempt/endpoint';
import { SubmitQuizAttemptHandler } from './features/SubmitQuizAttempt/handler';
import { GetStudentProgressEndpoint } from './features/GetStudentProgress/endpoint';
import { GetStudentProgressHandler } from './features/GetStudentProgress/handler';

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
