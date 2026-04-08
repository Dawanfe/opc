import { PropsWithChildren } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import Taro from '@tarojs/taro'
import './app.scss'

// 全局分享配置
Taro.onShareAppMessage(() => ({
  title: 'WeOPC - 全国一站式OPC服务平台',
  path: '/pages/index/index',
  imageUrl: ''
}))

function App({ children }: PropsWithChildren) {
  return <AuthProvider>{children}</AuthProvider>
}

export default App
