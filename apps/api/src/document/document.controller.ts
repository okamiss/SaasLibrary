import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiTags
} from '@nestjs/swagger';
import { CurrentCompanyId } from '../auth/decorators/current-company-id.decorator';
import { CurrentUserDecorator } from '../auth/decorators/current-user.decorator';
import { CurrentUser } from '../auth/interfaces/current-user.interface';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DOCUMENT_UPLOAD_FIELD } from './document.constants';
import { DocumentService } from './document.service';
import { DocumentUploadFile } from './document.types';

@ApiTags('Documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor(DOCUMENT_UPLOAD_FIELD))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: [DOCUMENT_UPLOAD_FIELD],
      properties: {
        [DOCUMENT_UPLOAD_FIELD]: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })
  @ApiOkResponse({ description: 'Uploads a document and enqueues parsing.' })
  upload(
    @CurrentUserDecorator() currentUser: CurrentUser,
    @UploadedFile() file?: DocumentUploadFile
  ) {
    return this.documentService.upload(currentUser, file);
  }

  @Get()
  @ApiOkResponse({ description: 'Lists documents for the current company.' })
  findMany(@CurrentCompanyId() companyId: string) {
    return this.documentService.findMany(companyId);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Returns one document in the current company.' })
  findById(@CurrentCompanyId() companyId: string, @Param('id') id: string) {
    return this.documentService.findById(companyId, id);
  }

  @Delete(':id')
  @ApiOkResponse({
    description: 'Deletes a document, its OSS file, and document chunks.'
  })
  delete(@CurrentCompanyId() companyId: string, @Param('id') id: string) {
    return this.documentService.delete(companyId, id);
  }

  @Post(':id/reparse')
  @ApiOkResponse({ description: 'Enqueues parsing again for a document.' })
  reparse(@CurrentCompanyId() companyId: string, @Param('id') id: string) {
    return this.documentService.reparse(companyId, id);
  }
}
