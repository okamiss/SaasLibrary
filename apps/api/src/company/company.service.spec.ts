import { NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CompanyService } from './company.service';

describe('CompanyService', () => {
  const company = {
    id: 'company-1',
    name: 'Alpha Company',
    status: 'ACTIVE',
    plan: 'FREE',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z')
  };
  const companyRepository = {
    findById: vi.fn(),
    updateById: vi.fn()
  };

  let service: CompanyService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new CompanyService(companyRepository as never);
  });

  it('gets the current company by currentCompanyId', async () => {
    companyRepository.findById.mockResolvedValue(company);

    const result = await service.getCurrentCompany(company.id);

    expect(companyRepository.findById).toHaveBeenCalledWith(company.id);
    expect(result.id).toBe(company.id);
  });

  it('updates only the current company', async () => {
    companyRepository.updateById.mockResolvedValue({
      ...company,
      name: 'Updated Company'
    });

    const result = await service.updateCurrentCompany(company.id, {
      name: 'Updated Company'
    });

    expect(companyRepository.updateById).toHaveBeenCalledWith(company.id, {
      name: 'Updated Company'
    });
    expect(result.name).toBe('Updated Company');
  });

  it('throws when current company is missing', async () => {
    companyRepository.findById.mockResolvedValue(null);

    await expect(service.getCurrentCompany(company.id)).rejects.toBeInstanceOf(
      NotFoundException
    );
  });
});
