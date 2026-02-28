import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { randomUUID } from 'crypto';
import { AUTH_REPOSITORY, PASSWORD_HASHER } from './contracts/auth.constants';
import { AUTH_ROLES, type Role } from './contracts/auth.roles';
import { LoginEndpoint } from './features/login/endpoint';
import { LoginHandler } from './features/login/handler';
import { RegisterEndpoint } from './features/register/endpoint';
import { RegisterHandler } from './features/register/handler';
import { RefreshEndpoint } from './features/refresh/endpoint';
import { RefreshHandler } from './features/refresh/handler';
import { MeEndpoint } from './features/me/endpoint';
import { LogoutEndpoint } from './features/logout/endpoint';
import type { AuthRepository } from './domain/auth.repository';
import type { AuthUser } from './domain/auth.user';
import type { PasswordHasher } from './domain/password-hasher';
import { AuthService } from './domain/auth.service';
import { BcryptPasswordHasher } from './infrastructure/bcrypt-password-hasher';
import { InMemoryAuthRepository } from './infrastructure/in-memory-auth.repository';
import { JwtStrategy } from './infrastructure/jwt.strategy';
import { PostgresAuthRepository } from './infrastructure/postgres-auth.repository';

const parseRoles = (value: string | undefined): Role[] => {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((role) => role.trim())
    .filter((role): role is (typeof AUTH_ROLES)[number] =>
      AUTH_ROLES.includes(role as (typeof AUTH_ROLES)[number]),
    );
};

const getSeedUser = async (
  passwordHasher: PasswordHasher,
): Promise<AuthUser | null> => {
  const email = process.env.AUTH_SEED_EMAIL;
  const password = process.env.AUTH_SEED_PASSWORD;
  if (!email || !password) {
    return null;
  }

  const rolesFromEnv = parseRoles(process.env.AUTH_SEED_ROLES);
  const roles: Role[] = rolesFromEnv.length ? rolesFromEnv : ['admin'];
  const passwordHash = await passwordHasher.hash(password);

  return {
    id: randomUUID(),
    email,
    passwordHash,
    roles,
  };
};

@Module({
  imports: [PassportModule, JwtModule.register({})],
  controllers: [
    LoginEndpoint,
    RefreshEndpoint,
    RegisterEndpoint,
    MeEndpoint,
    LogoutEndpoint,
  ],
  providers: [
    AuthService,
    LoginHandler,
    RefreshHandler,
    RegisterHandler,
    JwtStrategy,
    {
      provide: PASSWORD_HASHER,
      useClass: BcryptPasswordHasher,
    },
    {
      provide: AUTH_REPOSITORY,
      useFactory: async (
        passwordHasher: PasswordHasher,
      ): Promise<AuthRepository> => {
        const repository = process.env.DATABASE_URL
          ? new PostgresAuthRepository()
          : new InMemoryAuthRepository();
        const seedUser = await getSeedUser(passwordHasher);
        if (seedUser) {
          await repository.saveUser(seedUser);
        }
        return repository;
      },
      inject: [PASSWORD_HASHER],
    },
  ],
})
export class AuthModule { }
