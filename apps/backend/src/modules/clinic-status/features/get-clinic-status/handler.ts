import { Inject, Injectable } from '@nestjs/common';
import { CLINIC_STATUS_REPOSITORY } from '../../contracts/clinic-status.dto';
import type { ClinicStatusRepository } from '../../domain/clinic-status.repository';

@Injectable()
export class GetClinicStatusHandler {
  constructor(
    @Inject(CLINIC_STATUS_REPOSITORY)
    private readonly clinicStatusRepository: ClinicStatusRepository,
  ) {}

  async execute() {
    return this.clinicStatusRepository.getCurrentStatus();
  }
}
