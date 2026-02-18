export type ClinicStatusDto = {
  clinicId: string;
  name: string;
  status: 'open' | 'closed';
  updatedAt: string;
};

export const CLINIC_STATUS_REPOSITORY = 'CLINIC_STATUS_REPOSITORY';
