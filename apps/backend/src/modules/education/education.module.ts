import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PostgresStudentProfileRepository } from './infrastructure/postgres-student-profile.repository';
import { STUDENT_PROFILE_REPOSITORY } from './domain/student-profile.repository';
import { RegisterStudentEndpoint } from './features/register-student/endpoint';
import { RegisterStudentHandler } from './features/register-student/handler';
import { VerifyStudentEndpoint } from './features/verify-student/endpoint';
import { VerifyStudentHandler } from './features/verify-student/handler';

@Module({
    imports: [AuthModule], // Import AuthModule to use JwtAuthGuard and JwtService
    controllers: [
        RegisterStudentEndpoint,
        VerifyStudentEndpoint,
    ],
    providers: [
        {
            provide: STUDENT_PROFILE_REPOSITORY,
            useClass: PostgresStudentProfileRepository,
        },
        RegisterStudentHandler,
        VerifyStudentHandler,
    ],
    exports: [],
})
export class EducationModule { }
