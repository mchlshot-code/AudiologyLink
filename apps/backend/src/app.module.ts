import { Module } from '@nestjs/common';
import { ClinicStatusModule } from './modules/clinic-status/clinic-status.module';

@Module({
  imports: [ClinicStatusModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
