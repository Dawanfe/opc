import Taro from '@tarojs/taro'
import { STORAGE_KEYS } from '../constants'

export interface User {
  id: number
  phone?: string
  nickname?: string
  avatar?: string
  membershipType: 'free' | 'pro' | 'enterprise'
  wechatOpenId?: string
}

export function getToken(): string | null {
  try {
    return Taro.getStorageSync(STORAGE_KEYS.TOKEN) || null
  } catch {
    return null
  }
}

export function setToken(token: string): void {
  Taro.setStorageSync(STORAGE_KEYS.TOKEN, token)
}

export function getUserData(): User | null {
  try {
    const data = Taro.getStorageSync(STORAGE_KEYS.USER_DATA)
    return data ? (typeof data === 'string' ? JSON.parse(data) : data) : null
  } catch {
    return null
  }
}

export function setUserData(user: User): void {
  Taro.setStorageSync(STORAGE_KEYS.USER_DATA, JSON.stringify(user))
}

export function clearAuth(): void {
  try {
    Taro.removeStorageSync(STORAGE_KEYS.TOKEN)
    Taro.removeStorageSync(STORAGE_KEYS.USER_DATA)
  } catch {}
}

export function getPendingInviteCode(): string | null {
  try {
    return Taro.getStorageSync(STORAGE_KEYS.PENDING_INVITE_CODE) || null
  } catch {
    return null
  }
}

export function setPendingInviteCode(code: string): void {
  Taro.setStorageSync(STORAGE_KEYS.PENDING_INVITE_CODE, code)
}

export function clearPendingInviteCode(): void {
  try {
    Taro.removeStorageSync(STORAGE_KEYS.PENDING_INVITE_CODE)
  } catch {}
}
