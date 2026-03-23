import { createContext, useContext, useState, useEffect, PropsWithChildren, useCallback } from 'react'
import { request } from '../utils/request'
import { getToken, setToken, getUserData, setUserData, clearAuth, User } from '../utils/storage'

interface AuthContextType {
  isLoggedIn: boolean
  user: User | null
  token: string | null
  login: (phone: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (phone: string, password: string, nickname?: string, inviteCode?: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  showLoginModal: boolean
  setShowLoginModal: (show: boolean) => void
  requireAuth: (callback: () => void) => void
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  token: null,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: () => {},
  showLoginModal: false,
  setShowLoginModal: () => {},
  requireAuth: () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [token, setTokenState] = useState<string | null>(null)
  const [showLoginModal, setShowLoginModal] = useState(false)

  // Hydrate from storage on mount
  useEffect(() => {
    const savedToken = getToken()
    const savedUser = getUserData()
    if (savedToken && savedUser) {
      setTokenState(savedToken)
      setUser(savedUser)
      setIsLoggedIn(true)
    }
  }, [])

  const login = useCallback(async (phone: string, password: string) => {
    try {
      const data = await request<{ token: string; user: User }>({
        url: '/api/auth/login',
        method: 'POST',
        data: { phone, password },
      })
      setToken(data.token)
      setUserData(data.user)
      setTokenState(data.token)
      setUser(data.user)
      setIsLoggedIn(true)
      setShowLoginModal(false)
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message || '登录失败' }
    }
  }, [])

  const register = useCallback(async (phone: string, password: string, nickname?: string, inviteCode?: string) => {
    try {
      await request({
        url: '/api/auth/register',
        method: 'POST',
        data: { phone, password, nickname, inviteCode },
      })
      // Auto login after registration
      const result = await login(phone, password)
      return result
    } catch (err: any) {
      return { success: false, error: err.message || '注册失败' }
    }
  }, [login])

  const logout = useCallback(() => {
    clearAuth()
    setTokenState(null)
    setUser(null)
    setIsLoggedIn(false)
  }, [])

  const requireAuth = useCallback((callback: () => void) => {
    if (isLoggedIn) {
      callback()
    } else {
      setShowLoginModal(true)
    }
  }, [isLoggedIn])

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        token,
        login,
        register,
        logout,
        showLoginModal,
        setShowLoginModal,
        requireAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
