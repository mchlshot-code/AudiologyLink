import { Module } from '@nestjs/common';
import { CLINIC_STATUS_REPOSITORY } from './contracts/clinic-status.dto';
import { GetClinicStatusEndpoint } from './features/GetClinicStatus/endpoint';
import { GetClinicStatusHandler } from './features/GetClinicStatus/handler';
import { InMemoryClinicStatusRepository } from './infrastructure/in-memory-clinic-status.repository';
import { PostgresClinicStatusRepository } from './infrastructure/postgres-clinic-status.repository';

@Module({
  controllers: [GetClinicStatusEndpoint],
  providers: [
    GetClinicStatusHandler,
    {
      provide: CLINIC_STATUS_REPOSITORY,
      useFactory: () => {
        if (process.env.DATABASE_URL) {
          return new PostgresClinicStatusRepository();
        }
        return new InMemoryClinicStatusRepository();
      },
    },
  ],
})
export class ClinicStatusModule { }
