import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service';

@Module({
  imports: [
    JwtModule.register({
      secret: 'my-secret-key', // ⚠️ 나중에 .env로 빼기
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, DatabaseService],
})
export class AuthModule {}