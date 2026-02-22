import type { Role } from '../contracts/auth.roles';

export type AuthUser = {
  id: string;
  email: string;
  passwordHash: string;
  roles: Role[];
};
