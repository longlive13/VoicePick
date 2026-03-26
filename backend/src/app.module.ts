import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DubbingModule } from './dubbing/dubbing.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DubbingModule,
    AuthModule,
  ],
})
export class AppModule {}