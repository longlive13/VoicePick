import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, Client } from '@libsql/client';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private client: Client;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>('DATABASE_URL');
    const authToken = this.configService.get<string>('DATABASE_AUTH_TOKEN');

    if (!url) {
      throw new Error('DATABASE_URL is missing');
    }

    if (!authToken) {
      throw new Error('DATABASE_AUTH_TOKEN is missing');
    }

    this.client = createClient({
      url,
      authToken,
    });
  }

  async onModuleInit() {
    await this.client.execute('SELECT 1');
    console.log('✅ Turso Database connected');
  }

  getClient(): Client {
    return this.client;
  }
}