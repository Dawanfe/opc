// 全局类型声明

// 微信登录 JS-SDK
interface WxLoginConfig {
  self_redirect: boolean;
  id: string;
  appid: string;
  scope: string;
  redirect_uri: string;
  state: string;
  style?: string;
  href?: string;
}

interface Window {
  WxLogin: new (config: WxLoginConfig) => void;
}
