import Taro from '@tarojs/taro'
import { BASE_URL } from '../constants'
import { getToken, clearAuth } from './storage'

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  needAuth?: boolean
}

export async function request<T = any>(options: RequestOptions): Promise<T> {
  const { url, method = 'GET', data, needAuth = false } = options

  const header: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (needAuth) {
    const token = getToken()
    if (token) {
      header['Authorization'] = `Bearer ${token}`
    }
  }

  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`

  try {
    const response = await Taro.request({
      url: fullUrl,
      method,
      data,
      header,
    })

    if (response.statusCode === 401) {
      clearAuth()
      Taro.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
      throw new Error('Unauthorized')
    }

    if (response.statusCode >= 400) {
      const errorData = response.data as any
      throw new Error(errorData?.error || errorData?.message || `请求失败 (${response.statusCode})`)
    }

    return response.data as T
  } catch (err: any) {
    if (err.message === 'Unauthorized') throw err
    throw new Error(err.errMsg || err.message || '网络请求失败')
  }
}
