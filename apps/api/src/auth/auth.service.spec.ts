import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const company = {
    id: 'company-1',
    name: 'Alpha Company',
    status: 'ACTIVE',
    plan: 'FREE',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z')
  };
  const adminUser = {
    id: 'user-1',
    companyId: company.id,
    name: 'Alpha Admin',
    email: 'admin@alpha.example',
    passwordHash: 'hashed-secret',
    role: 'ADMIN',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z')
  };

  const authRepository = {
    registerCompanyWithAdmin: vi.fn()
  };
  const userRepository = {
    findByEmail: vi.fn(),
    findById: vi.fn()
  };
  const passwordService = {
    hash: vi.fn(),
    compare: vi.fn()
  };
  const jwtService = {
    signAsync: vi.fn()
  };

  let service: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AuthService(
      authRepository as never,
      userRepository as never,
      passwordService as never,
      jwtService as never
    );
  });

  it('registers a company and admin user bound to the new company', async () => {
    passwordService.hash.mockResolvedValue('hashed-secret');
    authRepository.registerCompanyWithAdmin.mockResolvedValue({
      company,
      user: adminUser
    });
    jwtService.signAsync.mockResolvedValue('access-token');

    const result = await service.register({
      companyName: 'Alpha Company',
      name: 'Alpha Admin',
      email: 'admin@alpha.example',
      password: 'secret123'
    });

    expect(passwordService.hash).toHaveBeenCalledWith('secret123');
    expect(authRepository.registerCompanyWithAdmin).toHaveBeenCalledWith({
      companyName: 'Alpha Company',
      admin: {
        name: 'Alpha Admin',
        email: 'admin@alpha.example',
        passwordHash: 'hashed-secret'
      }
    });
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: adminUser.id,
      companyId: company.id,
      email: adminUser.email,
      role: adminUser.role
    });
    expect(result.accessToken).toBe('access-token');
    expect(result.user.companyId).toBe(company.id);
    expect(result.company.id).toBe(company.id);
    expect(result.user).not.toHaveProperty('passwordHash');
  });

  it('rejects duplicate admin email inside the same company during login context', async () => {
    userRepository.findByEmail.mockResolvedValue(adminUser);

    await expect(
      service.login({
        companyId: company.id,
        email: 'admin@alpha.example',
        password: 'wrong-password'
      })
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('logs in with companyId, email, and password', async () => {
    userRepository.findByEmail.mockResolvedValue(adminUser);
    passwordService.compare.mockResolvedValue(true);
    jwtService.signAsync.mockResolvedValue('access-token');

    const result = await service.login({
      companyId: company.id,
      email: 'admin@alpha.example',
      password: 'secret123'
    });

    expect(userRepository.findByEmail).toHaveBeenCalledWith(
      company.id,
      'admin@alpha.example'
    );
    expect(result.accessToken).toBe('access-token');
    expect(result.user.companyId).toBe(company.id);
  });

  it('returns current user only within the current company', async () => {
    userRepository.findById.mockResolvedValue(adminUser);

    const result = await service.getMe({
      id: adminUser.id,
      companyId: company.id,
      email: adminUser.email,
      role: adminUser.role
    });

    expect(userRepository.findById).toHaveBeenCalledWith(
      company.id,
      adminUser.id
    );
    expect(result.companyId).toBe(company.id);
    expect(result).not.toHaveProperty('passwordHash');
  });

  it('throws when current user no longer exists in current company', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(
      service.getMe({
        id: adminUser.id,
        companyId: company.id,
        email: adminUser.email,
        role: adminUser.role
      })
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
