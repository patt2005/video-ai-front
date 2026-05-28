import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './app.tsx'
import { ApiProvider } from './contexts/apiContext.tsx'
import { AuthProvider } from './contexts/authContext.tsx'
import { ThemeProvider } from './contexts/themeContext.tsx'
import { PaddleProvider } from './contexts/paddleContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ApiProvider>
        <AuthProvider>
          <PaddleProvider>
            <App />
          </PaddleProvider>
        </AuthProvider>
      </ApiProvider>
    </ThemeProvider>
  </StrictMode>,
)
