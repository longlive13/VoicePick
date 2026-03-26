import { Injectable, InternalServerErrorException } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class TranslationService {
  private client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  async translateText(text: string, targetLanguage: string): Promise<string> {
    if (!process.env.OPENAI_API_KEY) {
      throw new InternalServerErrorException(
        'OPENAI_API_KEY가 설정되지 않았습니다.',
      );
    }

    if (!text?.trim()) {
      return '';
    }

    try {
      const response = await this.client.responses.create({
        model: 'gpt-5.4',
        input: [
          {
            role: 'system',
            content:
              'You are a translation assistant. Translate the user text accurately and naturally. Return only the translated text, with no explanation.',
          },
          {
            role: 'user',
            content: `Translate the following text into ${targetLanguage}:\n\n${text}`,
          },
        ],
      });

      const translatedText = response.output_text?.trim();

      if (!translatedText) {
        throw new InternalServerErrorException(
          '번역 결과가 비어 있습니다.',
        );
      }

      return translatedText;
    } catch (error: any) {
      console.error(
        'OpenAI translation error:',
        error?.response?.data || error?.message || error,
      );
      throw new InternalServerErrorException('텍스트 번역에 실패했습니다.');
    }
  }
}