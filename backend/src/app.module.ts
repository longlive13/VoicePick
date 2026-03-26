import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DubbingModule } from './dubbing/dubbing.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DubbingModule,
  ],
})
export class AppModule {}