import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DubbingController } from './controller/dubbing.controller';
import { FilesController } from './controller/files.controller';
import { DubbingService } from './service/dubbing.service';
import { MediaService } from './service/media.service';
import { TranscriptionService } from './service/transcription.service';
import { TranslationService } from './service/translation.service';
import { SynthesisService } from './service/synthesis.service';
import { DatabaseService } from '../database/database.service';
import { AuthGuard } from '../auth/auth.guard';  

@Module({
  imports: [
    JwtModule.register({
      secret: 'my-secret-key', // ⚠️ 나중에 .env로 빼기
      signOptions: { expiresIn: '1h' },
    }),
  ],

  controllers: [DubbingController, FilesController],
  providers: [
    DubbingService,
    MediaService,
    TranscriptionService,
    TranslationService,
    SynthesisService,
    DatabaseService,
    AuthGuard,
  ],
})
export class DubbingModule {}