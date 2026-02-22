import { Pool, type PoolConfig } from 'pg';
import type {
  AuthRepository,
  RefreshTokenRecord,
} from '../domain/auth.repository';
import type { AuthUser } from '../domain/auth.user';

const getSchemaName = (value: string) => {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) {
    throw new Error('Invalid schema name');
  }
  return value;
};

export class PostgresAuthRepository implements AuthRepository {
  private readonly pool: Pool;
  private readonly schema: string;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not set');
    }

    this.schema = getSchemaName(process.env.AUTH_SCHEMA ?? 'auth');
    const poolConfig: PoolConfig = {
      connectionString,
      ssl:
        process.env.DATABASE_SSL === 'true'
          ? { rejectUnauthorized: false }
          : undefined,
    };
    this.pool = new Pool(poolConfig);
  }

  async findByEmail(email: string): Promise<AuthUser | null> {
    const result = await this.pool.query<AuthUser>(
      `select user_id as id, email, password_hash as "passwordHash", roles
       from ${this.schema}.auth_users
       where lower(email) = lower($1)
       limit 1`,
      [email],
    );

    return result.rows[0] ?? null;
  }

  async findById(id: string): Promise<AuthUser | null> {
    const result = await this.pool.query<AuthUser>(
      `select user_id as id, email, password_hash as "passwordHash", roles
       from ${this.schema}.auth_users
       where user_id = $1
       limit 1`,
      [id],
    );

    return result.rows[0] ?? null;
  }

  async saveUser(user: AuthUser): Promise<void> {
    await this.pool.query(
      `insert into ${this.schema}.auth_users (user_id, email, password_hash, roles)
       values ($1, $2, $3, $4)
       on conflict (user_id)
       do update set email = excluded.email, password_hash = excluded.password_hash, roles = excluded.roles`,
      [user.id, user.email, user.passwordHash, user.roles],
    );
  }

  async saveRefreshToken(record: RefreshTokenRecord): Promise<void> {
    await this.pool.query(
      `insert into ${this.schema}.auth_refresh_tokens (user_id, token_id, hashed_token, expires_at)
       values ($1, $2, $3, $4)`,
      [record.userId, record.tokenId, record.hashedToken, record.expiresAt],
    );
  }

  async findRefreshToken(
    userId: string,
    tokenId: string,
  ): Promise<RefreshTokenRecord | null> {
    const result = await this.pool.query<RefreshTokenRecord>(
      `select user_id as "userId", token_id as "tokenId", hashed_token as "hashedToken", expires_at as "expiresAt"
       from ${this.schema}.auth_refresh_tokens
       where user_id = $1 and token_id = $2
       limit 1`,
      [userId, tokenId],
    );

    return result.rows[0] ?? null;
  }

  async revokeRefreshToken(userId: string, tokenId: string): Promise<void> {
    await this.pool.query(
      `delete from ${this.schema}.auth_refresh_tokens where user_id = $1 and token_id = $2`,
      [userId, tokenId],
    );
  }
}
