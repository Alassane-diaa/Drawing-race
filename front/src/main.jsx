import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import GamePage from './pages/GamePage.jsx'
import StatsPage from './pages/StatsPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import MultiplayerPage from './pages/MultiplayerPage.jsx'
import { ProtectedRoute } from './routes/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext.jsx' 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/game" element={<GamePage />} />
          <Route 
              path="/stats" 
              element={
                  <ProtectedRoute>
                      <StatsPage />
                  </ProtectedRoute>
              } 
          />
          <Route path="/register" element={<RegisterPage/>} />
          <Route path="/login" element={<LoginPage/>} />
          <Route 
            path="/play" 
            element={
            <ProtectedRoute>
              <MultiplayerPage/>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
