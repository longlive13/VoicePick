import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { MediaService } from './media.service';
import { TranscriptionService } from './transcription.service';
import { TranslationService } from './translation.service';
import { SynthesisService } from './synthesis.service';
import * as path from 'path';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class DubbingService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly mediaService: MediaService,
    private readonly transcriptionService: TranscriptionService,
    private readonly translationService: TranslationService,
    private readonly synthesisService: SynthesisService,
  ) {}

  async testDb() {
    const db = this.databaseService.getClient();
    const result = await db.execute('SELECT * FROM dubbing_jobs');
    return result.rows;
  }

  async createUploadResult(params: {
    originalFilename: string;
    savedFilename: string;
    targetLanguage: string;
  }) {
    const db = this.databaseService.getClient();
    const uploadedFilePath = `/tmp/uploads/${params.savedFilename}`;
    const audioPath = await this.mediaService.prepareAudio(uploadedFilePath);
    const transcript = await this.transcriptionService.transcribe(audioPath);
    const translatedText = await this.translationService.translateText(
      transcript,
      params.targetLanguage,
    );

    const outputFilename = `${params.savedFilename.split('.')[0]}_dubbed.mp3`;
    const outputAudioPath = await this.synthesisService.synthesizeToFile(
      translatedText,
      outputFilename,
    );
    const insertResult = await db.execute({
      sql: `
        INSERT INTO dubbing_jobs (
          original_filename,
          target_language,
          transcript,
          translated_text,
          output_audio_path
        )
        VALUES (?, ?, ?, ?, ?)
      `,
      args: [
        params.originalFilename,
        params.targetLanguage,
        transcript,
        translatedText,
        outputAudioPath,
      ],
    });

    return {
      success: true,
      jobId: Number(insertResult.lastInsertRowid),
      originalFilename: params.originalFilename,
      savedFilename: params.savedFilename,
      targetLanguage: params.targetLanguage,
      uploadPath: `/uploads/${params.savedFilename}`,
      audioPath,
      transcript,
      translatedText,
      outputAudioPath,
      outputAudioUrl: `/files/${path.basename(outputAudioPath)}`,
      downloadAudioUrl: `/files/download/${path.basename(outputAudioPath)}`,
    };
  }
   async getDubbingResultById(id: number) {
    const db = this.databaseService.getClient();

    const result = await db.execute({
      sql: `
        SELECT
          id,
          original_filename,
          target_language,
          transcript,
          translated_text,
          output_audio_path,
          created_at
        FROM dubbing_jobs
        WHERE id = ?
      `,
      args: [id],
    });

    const rows = result.rows as any[];

    if (!rows || rows.length === 0) {
        throw new NotFoundException('해당 더빙 결과를 찾을 수 없습니다.');
    }

    const row = rows[0];
    const outputAudioPath = String(row.output_audio_path);

    return {
      id: Number(row.id),
      originalFilename: row.original_filename,
      targetLanguage: row.target_language,
      transcript: row.transcript,
      translatedText: row.translated_text,
      outputAudioPath,
      outputAudioUrl: `/files/${path.basename(outputAudioPath)}`,
      downloadAudioUrl: `/files/download/${path.basename(outputAudioPath)}`,
      createdAt: row.created_at,
    };
  }
  
}