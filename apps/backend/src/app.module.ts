import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { ClinicStatusModule } from './modules/clinic-status/clinic-status.module';

@Module({
  imports: [AuthModule, ClinicStatusModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
