import { ClinicStatusRepository } from '../domain/clinic-status.repository';

export class InMemoryClinicStatusRepository implements ClinicStatusRepository {
  getCurrentStatus() {
    return Promise.resolve({
      clinicId: 'lagos-main',
      name: 'AudiologyLink Lagos',
      status: 'open' as const,
      updatedAt: new Date().toISOString(),
    });
  }
}
