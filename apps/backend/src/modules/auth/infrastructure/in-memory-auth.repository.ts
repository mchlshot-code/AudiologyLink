import type {
  AuthRepository,
  RefreshTokenRecord,
} from '../domain/auth.repository';
import type { AuthUser } from '../domain/auth.user';

export class InMemoryAuthRepository implements AuthRepository {
  private readonly usersById = new Map<string, AuthUser>();
  private readonly usersByEmail = new Map<string, AuthUser>();
  private readonly refreshTokens = new Map<string, RefreshTokenRecord>();

  constructor(seedUsers: AuthUser[] = []) {
    seedUsers.forEach((user) => this.storeUser(user));
  }

  findByEmail(email: string): Promise<AuthUser | null> {
    return Promise.resolve(this.usersByEmail.get(email.toLowerCase()) ?? null);
  }

  findById(id: string): Promise<AuthUser | null> {
    return Promise.resolve(this.usersById.get(id) ?? null);
  }

  saveUser(user: AuthUser): Promise<void> {
    this.storeUser(user);
    return Promise.resolve();
  }

  saveRefreshToken(record: RefreshTokenRecord): Promise<void> {
    this.refreshTokens.set(
      this.getRefreshKey(record.userId, record.tokenId),
      record,
    );
    return Promise.resolve();
  }

  findRefreshToken(
    userId: string,
    tokenId: string,
  ): Promise<RefreshTokenRecord | null> {
    return Promise.resolve(
      this.refreshTokens.get(this.getRefreshKey(userId, tokenId)) ?? null,
    );
  }

  revokeRefreshToken(userId: string, tokenId: string): Promise<void> {
    this.refreshTokens.delete(this.getRefreshKey(userId, tokenId));
    return Promise.resolve();
  }

  private storeUser(user: AuthUser) {
    this.usersById.set(user.id, user);
    this.usersByEmail.set(user.email.toLowerCase(), user);
  }

  private getRefreshKey(userId: string, tokenId: string) {
    return `${userId}:${tokenId}`;
  }
}
