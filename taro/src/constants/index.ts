// Backend API base URL
// H5 开发模式下 API 走代理（空字符串），小程序使用完整 URL
import Taro from '@tarojs/taro'

const isH5 = Taro.getEnv() === Taro.ENV_TYPE.WEB

// API 请求地址：H5 走 devServer proxy，小程序走完整 URL
export const BASE_URL = isH5 ? '' : TARO_APP_BASE_URL

// 静态资源地址：始终使用完整 URL（图片不受 CORS 限制）
export const ASSET_URL = TARO_APP_BASE_URL

// Web URL for invite links
export const WEB_URL = 'https://weopc.com.cn'

// Storage keys
export const STORAGE_KEYS = {
  TOKEN: 'user_token',
  USER_DATA: 'user_data',
  PENDING_INVITE_CODE: 'pendingInviteCode',
} as const

// City filter list
export const CITY_FILTERS = [
  '全部', '北京', '上海', '深圳', '杭州', '广州', '南京', '成都', '武汉', '厦门',
] as const

// Marketplace categories
export const DEMAND_CATEGORIES = [
  { id: 'all', label: '全部' },
  { id: 'AI应用开发', label: 'AI应用开发' },
  { id: 'AI漫画/短剧', label: 'AI漫画/短剧' },
  { id: 'AIGC图片/视频', label: 'AIGC图片/视频' },
  { id: 'AI咨询', label: 'AI咨询' },
] as const

// News categories
export const NEWS_CATEGORIES = [
  { id: 'all', label: '全部' },
  { id: 'policy', label: '政策' },
  { id: 'news', label: '新闻' },
  { id: 'analysis', label: '分析' },
] as const
