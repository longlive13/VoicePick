import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import FormData from 'form-data';
import * as fs from 'fs';

@Injectable()
export class TranscriptionService {
  async transcribe(audioPath: string): Promise<string> {
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      throw new InternalServerErrorException(
        'ELEVENLABS_API_KEY가 설정되지 않았습니다.',
      );
    }

    const formData = new FormData();
    formData.append('model_id', 'scribe_v2');
    formData.append('file', fs.createReadStream(audioPath));

    try {
      const response = await axios.post(
        'https://api.elevenlabs.io/v1/speech-to-text',
        formData,
        {
          headers: {
            'xi-api-key': apiKey,
            ...formData.getHeaders(),
          },
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
        },
      );

      const data = response.data;

      const transcript =
        data?.text ??
        data?.transcript?.text ??
        data?.transcript ??
        data?.full_text ??
        '';

      if (!transcript || typeof transcript !== 'string') {
        throw new InternalServerErrorException(
          '전사 결과에서 transcript를 찾지 못했습니다.',
        );
      }

      return transcript;
    } catch (error: any) {
      console.error(
        'ElevenLabs STT error:',
        error?.response?.data || error.message,
      );
      throw new InternalServerErrorException('음성 전사에 실패했습니다.');
    }
  }
}