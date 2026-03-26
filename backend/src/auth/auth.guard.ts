import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('토큰 없음');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('토큰 형식이 올바르지 않습니다.');
    }

    try {
      const decoded = this.jwtService.verify(token);
      request.user = decoded; // 필요하면 사용
      return true;
    } catch (err) {
      throw new UnauthorizedException('토큰 유효하지 않음');
    }
  }
}