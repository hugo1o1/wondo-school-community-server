import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
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

  async webLogin(username: string, password: string) {
    const user = await this.userService.findByUsernameWithPassword(username);
    if (!user || !user.password) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    if (user.status === 1) {
      throw new UnauthorizedException('账号已被禁用');
    }

    const payload = { sub: user.id, openid: user.openid };
    const token = this.jwtService.sign(payload);
    return {
      token,
      user: {
        id: user.id,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  async webRegister(username: string, password: string, nickname: string) {
    const existing = await this.userService.findByUsernameWithPassword(username);
    if (existing) {
      throw new BadRequestException('用户名已存在');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userService.create({
      username,
      password: hashedPassword,
      nickname: nickname || username,
      openid: `web_${username}_${Date.now()}`,
    });

    const payload = { sub: user.id, openid: user.openid };
    const token = this.jwtService.sign(payload);
    return {
      token,
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
