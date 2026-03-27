import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, Client } from '@libsql/client';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private client: Client;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>('DATABASE_URL');
    const authToken = this.configService.get<string>('DATABASE_AUTH_TOKEN');

    this.client = createClient({
      url: url!,
      authToken: authToken, 
    });
  }

  async onModuleInit() {
    try {
      await this.client.execute('SELECT 1');
      console.log('✅ Turso Database connected');
    } catch (e) {
      console.error('❌ Database connection failed:', e);
    }
  }

  getClient(): Client {
    return this.client;
  }
}