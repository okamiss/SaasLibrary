import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentCompanyId } from '../auth/decorators/current-company-id.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CompanyService } from './company.service';
import { UpdateCompanyDto } from './dto/update-company.dto';

@ApiTags('Companies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get('current')
  @ApiOkResponse({ description: 'Returns the current tenant company.' })
  getCurrent(@CurrentCompanyId() currentCompanyId: string) {
    return this.companyService.getCurrentCompany(currentCompanyId);
  }

  @Patch('current')
  @ApiOkResponse({ description: 'Updates the current tenant company.' })
  updateCurrent(
    @CurrentCompanyId() currentCompanyId: string,
    @Body() dto: UpdateCompanyDto
  ) {
    return this.companyService.updateCurrentCompany(currentCompanyId, dto);
  }
}
