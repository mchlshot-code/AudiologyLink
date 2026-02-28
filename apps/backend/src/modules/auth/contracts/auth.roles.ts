export const AUTH_ROLES = [
  'admin',
  'clinician',
  'receptionist',
  'patient',
  'student',
] as const;

export type Role = (typeof AUTH_ROLES)[number];
