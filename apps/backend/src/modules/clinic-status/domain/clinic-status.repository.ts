import { ClinicStatusDto } from '../contracts/clinic-status.dto';

export interface ClinicStatusRepository {
  getCurrentStatus(): Promise<ClinicStatusDto>;
}
