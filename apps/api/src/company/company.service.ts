import { Injectable, NotFoundException } from '@nestjs/common';
import { CompanyRepository } from '../repositories/company.repository';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompanyService {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async getCurrentCompany(currentCompanyId: string) {
    const company = await this.companyRepository.findById(currentCompanyId);
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  updateCurrentCompany(currentCompanyId: string, dto: UpdateCompanyDto) {
    return this.companyRepository.updateById(currentCompanyId, dto);
  }
}
