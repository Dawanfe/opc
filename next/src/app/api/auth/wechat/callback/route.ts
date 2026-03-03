import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import jwt from 'jsonwebtoken';

// 微信开放平台配置 - 请在环境变量中配置
const WECHAT_APP_ID = process.env.WECHAT_APP_ID || 'YOUR_WECHAT_APP_ID';
const WECHAT_APP_SECRET = process.env.WECHAT_APP_SECRET || 'YOUR_WECHAT_APP_SECRET';
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key-2024';
const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';

interface WechatTokenResponse {
  access_token?: string;
  expires_in?: number;
  refresh_token?: string;
  openid?: string;
  scope?: string;
  unionid?: string;
  errcode?: number;
  errmsg?: string;
}

interface WechatUserInfo {
  openid: string;
  nickname: string;
  sex: number;
  province: string;
  city: string;
  country: string;
  headimgurl: string;
  privilege: string[];
  unionid?: string;
  errcode?: number;
  errmsg?: string;
}

// 处理微信回调
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code) {
    // 用户取消了登录
    return NextResponse.redirect(`${FRONTEND_URL}?wechat_login=cancelled`);
  }

  try {
    // 1. 使用 code 换取 access_token
    const tokenUrl = new URL('https://api.weixin.qq.com/sns/oauth2/access_token');
    tokenUrl.searchParams.set('appid', WECHAT_APP_ID);
    tokenUrl.searchParams.set('secret', WECHAT_APP_SECRET);
    tokenUrl.searchParams.set('code', code);
    tokenUrl.searchParams.set('grant_type', 'authorization_code');

    const tokenResponse = await fetch(tokenUrl.toString());
    const tokenData: WechatTokenResponse = await tokenResponse.json();

    if (tokenData.errcode) {
      console.error('微信获取token失败:', tokenData);
      return NextResponse.redirect(`${FRONTEND_URL}?wechat_login=error&message=${encodeURIComponent(tokenData.errmsg || '获取token失败')}`);
    }

    const { access_token, openid, unionid } = tokenData;

    // 2. 使用 access_token 获取用户信息
    const userInfoUrl = new URL('https://api.weixin.qq.com/sns/userinfo');
    userInfoUrl.searchParams.set('access_token', access_token!);
    userInfoUrl.searchParams.set('openid', openid!);

    const userInfoResponse = await fetch(userInfoUrl.toString());
    const userInfo: WechatUserInfo = await userInfoResponse.json();

    if (userInfo.errcode) {
      console.error('微信获取用户信息失败:', userInfo);
      return NextResponse.redirect(`${FRONTEND_URL}?wechat_login=error&message=${encodeURIComponent(userInfo.errmsg || '获取用户信息失败')}`);
    }

    // 3. 查找或创建用户
    const db = getDb();

    // 先尝试通过 openid 查找用户
    let user = db.prepare('SELECT * FROM users WHERE wechatOpenId = ?').get(openid) as any;

    if (!user) {
      // 如果有 unionid，尝试通过 unionid 查找
      if (unionid) {
        user = db.prepare('SELECT * FROM users WHERE wechatUnionId = ?').get(unionid) as any;
      }
    }

    if (!user) {
      // 创建新用户
      const result = db.prepare(`
        INSERT INTO users (nickname, avatar, wechatOpenId, wechatUnionId, membershipType)
        VALUES (?, ?, ?, ?, 'free')
      `).run(
        userInfo.nickname || '微信用户',
        userInfo.headimgurl || null,
        openid,
        unionid || null
      );

      user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid) as any;
    } else {
      // 更新用户信息
      db.prepare(`
        UPDATE users
        SET nickname = ?, avatar = ?, wechatUnionId = COALESCE(?, wechatUnionId), updatedAt = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        userInfo.nickname || user.nickname,
        userInfo.headimgurl || user.avatar,
        unionid,
        user.id
      );
    }

    // 4. 生成 JWT token
    const token = jwt.sign(
      { userId: user.id, wechatOpenId: openid },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 5. 重定向到前端，携带 token
    const redirectUrl = new URL(FRONTEND_URL);
    redirectUrl.searchParams.set('wechat_login', 'success');
    redirectUrl.searchParams.set('token', token);
    redirectUrl.searchParams.set('user', JSON.stringify({
      id: user.id,
      nickname: user.nickname,
      avatar: user.avatar,
      membershipType: user.membershipType,
      phone: user.phone || null,
    }));

    return NextResponse.redirect(redirectUrl.toString());
  } catch (error) {
    console.error('微信登录回调处理失败:', error);
    return NextResponse.redirect(`${FRONTEND_URL}?wechat_login=error&message=${encodeURIComponent('登录处理失败')}`);
  }
}
