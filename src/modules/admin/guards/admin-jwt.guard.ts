import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminJwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('未登录');
    }
    try {
      const token = authHeader.slice(7);
      const payload = this.jwtService.verify(token);
      if (payload.type !== 'admin') {
        throw new UnauthorizedException('无权限');
      }
      request.admin = { id: payload.sub, username: payload.username, role: payload.role };
      return true;
    } catch {
      throw new UnauthorizedException('登录已过期');
    }
  }
}
