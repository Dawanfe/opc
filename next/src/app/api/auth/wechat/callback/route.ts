import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import jwt from 'jsonwebtoken';

// 微信配置 - 双AppID方案
// PC端：网站应用（开放平台）
const WECHAT_WEB_APP_ID = process.env.WECHAT_APP_ID || 'YOUR_WECHAT_APP_ID';
const WECHAT_WEB_APP_SECRET = process.env.WECHAT_APP_SECRET || 'YOUR_WECHAT_APP_SECRET';

// 移动端：公众号（公众平台）
const WECHAT_MP_APP_ID = process.env.WECHAT_MP_APP_ID || '';
const WECHAT_MP_APP_SECRET = process.env.WECHAT_MP_APP_SECRET || '';

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

// 处理微信回调 - 支持双AppID（PC网站应用 + 移动端公众号）
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code) {
    // 用户取消了登录
    return NextResponse.redirect(`${FRONTEND_URL}?wechat_login=cancelled`);
  }

  try {
    // 判断是PC端还是移动端的回调
    // 方法：尝试用PC端的AppID换取token，失败则使用移动端的AppID
    let appId = WECHAT_WEB_APP_ID;
    let appSecret = WECHAT_WEB_APP_SECRET;
    let isMobileCallback = false;

    // 1. 使用 code 换取 access_token
    let tokenUrl = new URL('https://api.weixin.qq.com/sns/oauth2/access_token');
    tokenUrl.searchParams.set('appid', appId);
    tokenUrl.searchParams.set('secret', appSecret);
    tokenUrl.searchParams.set('code', code);
    tokenUrl.searchParams.set('grant_type', 'authorization_code');

    let tokenResponse = await fetch(tokenUrl.toString());
    let tokenData: WechatTokenResponse = await tokenResponse.json();

    // 如果PC端失败（错误码40163表示code已使用或无效），尝试移动端
    if (tokenData.errcode && WECHAT_MP_APP_ID && WECHAT_MP_APP_SECRET) {
      console.log('[WeChat Callback] PC端获取token失败，尝试使用移动端公众号AppID');
      appId = WECHAT_MP_APP_ID;
      appSecret = WECHAT_MP_APP_SECRET;
      isMobileCallback = true;

      tokenUrl = new URL('https://api.weixin.qq.com/sns/oauth2/access_token');
      tokenUrl.searchParams.set('appid', appId);
      tokenUrl.searchParams.set('secret', appSecret);
      tokenUrl.searchParams.set('code', code);
      tokenUrl.searchParams.set('grant_type', 'authorization_code');

      tokenResponse = await fetch(tokenUrl.toString());
      tokenData = await tokenResponse.json();
    }

    if (tokenData.errcode) {
      console.error('微信获取token失败:', tokenData);
      return NextResponse.redirect(`${FRONTEND_URL}?wechat_login=error&message=${encodeURIComponent(tokenData.errmsg || '获取token失败')}`);
    }

    const { access_token, openid, unionid } = tokenData;

    console.log(`[WeChat Callback] 登录来源: ${isMobileCallback ? '移动端公众号' : 'PC端网站应用'}`);
    console.log(`[WeChat Callback] AppID: ${appId}`);
    console.log(`[WeChat Callback] OpenID: ${openid}`);

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
