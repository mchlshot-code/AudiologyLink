import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { ClinicStatusModule } from './modules/clinic-status/clinic-status.module';
import { EducationModule } from './modules/education/education.module';
import { HealthController } from './health.controller';

@Module({
  imports: [AuthModule, ClinicStatusModule, EducationModule],
  controllers: [HealthController],
  providers: [],
})
export class AppModule { }

