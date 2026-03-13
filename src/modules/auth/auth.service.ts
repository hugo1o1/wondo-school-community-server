import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {}

  async wechatLogin(code: string) {
    // Exchange code for openid via WeChat API
    const { openid } = await this.getWechatSession(code);

    // Find or create user
    let user = await this.userService.findByOpenid(openid);
    if (!user) {
      user = await this.userService.create({ openid });
    }

    // Generate tokens
    const payload = { sub: user.id, openid: user.openid };
    const token = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });

    return {
      token,
      refreshToken,
      user: {
        id: user.id,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const newToken = this.jwtService.sign({ sub: payload.sub, openid: payload.openid });
      return { token: newToken };
    } catch {
      throw new UnauthorizedException('refreshToken已过期，请重新登录');
    }
  }

  private async getWechatSession(code: string): Promise<{ openid: string; session_key: string }> {
    const appId = this.configService.get('WECHAT_APP_ID');
    const appSecret = this.configService.get('WECHAT_APP_SECRET');
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.errcode) {
      throw new UnauthorizedException(`微信登录失败: ${data.errmsg}`);
    }

    return { openid: data.openid, session_key: data.session_key };
  }
}
