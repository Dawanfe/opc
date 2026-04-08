import { PropsWithChildren } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import './app.scss'

function App({ children }: PropsWithChildren) {
  return <AuthProvider>{children}</AuthProvider>
}

export default App
