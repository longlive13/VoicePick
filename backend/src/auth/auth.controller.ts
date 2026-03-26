import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('google')
  async googleLogin(@Body() body: { email?: string }) {
    if (!body.email) {
      throw new BadRequestException('email이 필요합니다.');
    }

    return this.authService.validateUser(body.email);
  }
}