import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService
  ) {}

  async validateUser(email: string) {
    const db = this.databaseService.getClient();

    const result = await db.execute({
      sql: `SELECT * FROM allowed_users WHERE email = ?`,
      args: [email],
    });

    const rows = result.rows as any[];

    if (!rows || rows.length === 0) {
      throw new UnauthorizedException('허용되지 않은 사용자입니다.');
    }
    const accessToken = this.jwtService.sign({ email });
    return {
      success: true,
      email,
      accessToken,
      message: '허용된 사용자입니다.',
    };
  }
}