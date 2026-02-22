import type { Role } from '../contracts/auth.roles';

export type AccessTokenPayload = {
  sub: string;
  email: string;
  roles: Role[];
};

export type RefreshTokenPayload = {
  sub: string;
  tokenId: string;
};
