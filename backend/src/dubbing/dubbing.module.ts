import { Module } from '@nestjs/common';
import { DubbingController } from './controller/dubbing.controller';
import { FilesController } from './controller/files.controller';
import { DubbingService } from './service/dubbing.service';
import { MediaService } from './service/media.service';
import { TranscriptionService } from './service/transcription.service';
import { TranslationService } from './service/translation.service';
import { SynthesisService } from './service/synthesis.service';
import { DatabaseService } from '../database/database.service';

@Module({
  controllers: [DubbingController, FilesController],
  providers: [
    DubbingService,
    MediaService,
    TranscriptionService,
    TranslationService,
    SynthesisService,
    DatabaseService,
  ],
})
export class DubbingModule {}