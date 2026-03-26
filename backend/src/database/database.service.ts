import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, Client } from '@libsql/client';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private client: Client;

  constructor(private readonly configService: ConfigService) {
    const dbAbsolutePath = path.resolve(process.cwd(), 'storage', 'dubbing.db');
    const dbUrl = `file:${dbAbsolutePath}`;

    console.log('process.cwd():', process.cwd());
    console.log('DB absolute path:', dbAbsolutePath);
    console.log('DB exists:', fs.existsSync(dbAbsolutePath));

    this.client = createClient({
      url: dbUrl,
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