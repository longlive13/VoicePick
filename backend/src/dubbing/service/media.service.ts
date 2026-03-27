import { BadRequestException, Injectable } from '@nestjs/common';
import { extname, basename, join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import ffmpegPath from 'ffmpeg-static';

const execAsync = promisify(exec);

@Injectable()
export class MediaService {
  constructor() {
    fs.mkdirSync('/tmp/temp', { recursive: true });
  }

  createUploadFilename(originalName: string): string {
    const timestamp = Date.now();
    const extension = extname(originalName);
    const baseName = originalName
      .replace(extension, '')
      .replace(/[^a-zA-Z0-9-_]/g, '_');

    return `${baseName}_${timestamp}${extension}`;
  }

  async prepareAudio(filePath: string): Promise<string> {
    const extension = extname(filePath).toLowerCase();

    const audioExtensions = ['.mp3', '.wav', '.m4a'];
    const videoExtensions = ['.mp4', '.mov', '.avi'];

    if (audioExtensions.includes(extension)) {
      return this.cropAudio(filePath);
    }

    if (videoExtensions.includes(extension)) {
      const extracted = await this.extractAudioFromVideo(filePath);
      return this.cropAudio(extracted);
    }

    throw new BadRequestException('지원하지 않는 파일 형식입니다.');
  }

  private async extractAudioFromVideo(videoPath: string): Promise<string> {
    const fileNameWithoutExt = basename(videoPath, extname(videoPath));
    const outputPath = join('/tmp', 'temp', `${fileNameWithoutExt}_extracted.mp3`);

    if (!ffmpegPath) {
      throw new BadRequestException('ffmpeg 경로를 찾을 수 없습니다.');
    }

    const command = `"${ffmpegPath}" -y -i "${videoPath}" -vn -acodec libmp3lame "${outputPath}"`;

    try {
      const result = await execAsync(command);
      console.log('ffmpeg extract stdout:', result.stdout);
      console.log('ffmpeg extract stderr:', result.stderr);
      return outputPath;
    } catch (error: any) {
      console.error('ffmpeg extract error:', error);
      console.error('ffmpeg extract stderr:', error?.stderr);
      throw new BadRequestException(
        `비디오에서 오디오 추출에 실패했습니다. ${error?.stderr || error?.message || ''}`,
      );
    }
  }

  private async cropAudio(inputPath: string): Promise<string> {
    const fileNameWithoutExt = basename(inputPath, extname(inputPath));
    const outputPath = join('/tmp', 'temp', `${fileNameWithoutExt}_cropped.mp3`);

    if (!ffmpegPath) {
      throw new BadRequestException('ffmpeg 경로를 찾을 수 없습니다.');
    }

    const command = `"${ffmpegPath}" -y -i "${inputPath}" -t 60 "${outputPath}"`;

    try {
      const result = await execAsync(command);
      console.log('ffmpeg crop stdout:', result.stdout);
      console.log('ffmpeg crop stderr:', result.stderr);
      return outputPath;
    } catch (error: any) {
      console.error('ffmpeg crop error:', error);
      console.error('ffmpeg crop stderr:', error?.stderr);
      throw new BadRequestException(
        `오디오 자르기에 실패했습니다. ${error?.stderr || error?.message || ''}`,
      );
    }
  }
}