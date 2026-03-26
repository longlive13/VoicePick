import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { DubbingService } from '../service/dubbing.service';
import { MediaService } from '../service/media.service';
import { DubbingRequestDto } from '../dto/dubbing-request.dto';

@Controller('dubbing')
export class DubbingController {
  constructor(
    private readonly dubbingService: DubbingService,
    private readonly mediaService: MediaService,
  ) {}

  @Get('test-db')
  async testDb() {
    return this.dubbingService.testDb();
  }
  @Get(':id')
  async getDubbingResult(@Param('id', ParseIntPipe) id: number) {
    return this.dubbingService.getDubbingResultById(id);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './storage/uploads',
        filename: (req, file, cb) => {
          const mediaService = new MediaService();
          const savedFilename = mediaService.createUploadFilename(
            file.originalname,
          );
          cb(null, savedFilename);
        },
      }),
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: DubbingRequestDto,
  ) {
    if (!file) {
      throw new BadRequestException('파일이 없습니다.');
    }

    if (!body.targetLanguage) {
      throw new BadRequestException('targetLanguage가 필요합니다.');
    }

    return this.dubbingService.createUploadResult({
      originalFilename: file.originalname,
      savedFilename: file.filename,
      targetLanguage: body.targetLanguage,
    });
  }
}