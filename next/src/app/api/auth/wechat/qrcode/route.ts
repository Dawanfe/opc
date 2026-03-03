import { NextResponse } from 'next/server';
import crypto from 'crypto';

// 微信开放平台配置 - 请在环境变量中配置
const WECHAT_APP_ID = process.env.WECHAT_APP_ID || 'YOUR_WECHAT_APP_ID';
const REDIRECT_URI = process.env.WECHAT_REDIRECT_URI || 'http://localhost:3000/api/auth/wechat/callback';

// 生成微信扫码登录的 URL
export async function GET() {
  try {
    // 生成随机 state 用于防止 CSRF 攻击
    const state = crypto.randomBytes(16).toString('hex');

    // 构建微信扫码登录 URL
    // 参考文档: https://developers.weixin.qq.com/doc/oplatform/Website_App/WeChat_Login/Wechat_Login.html
    const wechatAuthUrl = new URL('https://open.weixin.qq.com/connect/qrconnect');
    wechatAuthUrl.searchParams.set('appid', WECHAT_APP_ID);
    wechatAuthUrl.searchParams.set('redirect_uri', encodeURIComponent(REDIRECT_URI));
    wechatAuthUrl.searchParams.set('response_type', 'code');
    wechatAuthUrl.searchParams.set('scope', 'snsapi_login');
    wechatAuthUrl.searchParams.set('state', state);

    return NextResponse.json({
      success: true,
      data: {
        qrcodeUrl: wechatAuthUrl.toString(),
        state,
        appId: WECHAT_APP_ID,
        redirectUri: REDIRECT_URI,
      }
    });
  } catch (error) {
    console.error('生成微信登录二维码失败:', error);
    return NextResponse.json(
      { success: false, error: '生成二维码失败' },
      { status: 500 }
    );
  }
}
