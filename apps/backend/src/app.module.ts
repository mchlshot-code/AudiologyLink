import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { ClinicStatusModule } from './modules/clinic-status/clinic-status.module';
import { HealthController } from './health.controller';

@Module({
  imports: [AuthModule, ClinicStatusModule],
  controllers: [HealthController],
  providers: [],
})
export class AppModule { }

