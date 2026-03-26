import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, Client } from '@libsql/client';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private client: Client;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>('DATABASE_URL');

    if (!url) {
      throw new Error('DATABASE_URL is not set');
    }

    this.client = createClient({
      url,
    });
  }

  async onModuleInit() {
    await this.client.execute('SELECT 1');
    console.log('✅ Database connected');
  }

  getClient(): Client {
    return this.client;
  }
}