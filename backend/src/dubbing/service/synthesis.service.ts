import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SynthesisService {
  constructor() {
    fs.mkdirSync('/tmp/outputs', { recursive: true });
  }

  async synthesizeToFile(
    text: string,
    outputFilename: string,
  ): Promise<string> {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = process.env.ELEVENLABS_VOICE_ID;

    if (!apiKey) {
      throw new InternalServerErrorException(
        'ELEVENLABS_API_KEY가 설정되지 않았습니다.',
      );
    }

    if (!voiceId) {
      throw new InternalServerErrorException(
        'ELEVENLABS_VOICE_ID가 설정되지 않았습니다.',
      );
    }

    if (!text?.trim()) {
      throw new InternalServerErrorException('합성할 텍스트가 비어 있습니다.');
    }

    const outputPath = path.join('/tmp', 'outputs', outputFilename);

    try {
      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          text,
          model_id: 'eleven_multilingual_v2',
        },
        {
          headers: {
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
            Accept: 'audio/mpeg',
          },
          responseType: 'arraybuffer',
        },
      );

      fs.writeFileSync(outputPath, response.data);
      return outputPath;
    } catch (error: any) {
      console.error(
        'ElevenLabs TTS error:',
        error?.response?.data || error?.message || error,
      );
      throw new InternalServerErrorException('음성 합성에 실패했습니다.');
    }
  }
}