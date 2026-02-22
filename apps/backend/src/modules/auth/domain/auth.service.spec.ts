import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InMemoryAuthRepository } from '../infrastructure/in-memory-auth.repository';
import { AuthService } from './auth.service';
import type { PasswordHasher } from './password-hasher';

class TestPasswordHasher implements PasswordHasher {
  hash(value: string): Promise<string> {
    return Promise.resolve(`hashed:${value}`);
  }

  compare(value: string, hash: string): Promise<boolean> {
    return Promise.resolve(hash === `hashed:${value}`);
  }
}

describe('AuthService', () => {
  const jwtService = new JwtService();
  let authService: AuthService;
  let repository: InMemoryAuthRepository;
  let passwordHasher: PasswordHasher;

  beforeAll(() => {
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.JWT_ACCESS_TTL = '5m';
    process.env.JWT_REFRESH_TTL = '10m';
  });

  beforeEach(() => {
    repository = new InMemoryAuthRepository();
    passwordHasher = new TestPasswordHasher();
    authService = new AuthService(repository, passwordHasher, jwtService);
  });

  it('registers a user with patient role by default', async () => {
    await authService.register({
      email: 'patient@example.com',
      password: 'secret',
    });

    const user = await repository.findByEmail('patient@example.com');
    expect(user?.roles).toEqual(['patient']);
  });

  it('rejects invalid roles during registration', async () => {
    await expect(
      authService.register({
        email: 'bad@example.com',
        password: 'secret',
        roles: ['invalid'],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects login with invalid credentials', async () => {
    await authService.register({
      email: 'auth@example.com',
      password: 'secret',
    });

    await expect(
      authService.login({ email: 'auth@example.com', password: 'wrong' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('revokes refresh token after use', async () => {
    const tokens = await authService.register({
      email: 'refresh@example.com',
      password: 'secret',
    });

    await authService.refresh(tokens.refreshToken);

    await expect(
      authService.refresh(tokens.refreshToken),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
