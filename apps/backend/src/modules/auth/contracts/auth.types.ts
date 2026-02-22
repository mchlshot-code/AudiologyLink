import type { Role } from './auth.roles';

export type AuthenticatedUser = {
  userId: string;
  email: string;
  roles: Role[];
};
