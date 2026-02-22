import type { AuthUser } from './auth.user';

export type RefreshTokenRecord = {
  userId: string;
  tokenId: string;
  hashedToken: string;
  expiresAt: Date;
};

export interface AuthRepository {
  findByEmail(email: string): Promise<AuthUser | null>;
  findById(id: string): Promise<AuthUser | null>;
  saveUser(user: AuthUser): Promise<void>;
  saveRefreshToken(record: RefreshTokenRecord): Promise<void>;
  findRefreshToken(
    userId: string,
    tokenId: string,
  ): Promise<RefreshTokenRecord | null>;
  revokeRefreshToken(userId: string, tokenId: string): Promise<void>;
}
