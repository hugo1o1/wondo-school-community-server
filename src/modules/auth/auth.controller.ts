import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { WechatLoginDto } from './dto/wechat-login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('wechat-login')
  @ApiOperation({ summary: '微信登录' })
  async wechatLogin(@Body() dto: WechatLoginDto) {
    return this.authService.wechatLogin(dto.code);
  }

  @Post('web-login')
  @ApiOperation({ summary: 'Web端账密登录' })
  async webLogin(@Body() body: { username: string; password: string }) {
    return this.authService.webLogin(body.username, body.password);
  }

  @Post('web-register')
  @ApiOperation({ summary: 'Web端注册' })
  async webRegister(@Body() body: { username: string; password: string; nickname?: string }) {
    return this.authService.webRegister(body.username, body.password, body.nickname || body.username);
  }

  @Post('refresh-token')
  @ApiOperation({ summary: '刷新Token' })
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }
}
