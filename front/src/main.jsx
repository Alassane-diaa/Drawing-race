import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import Doc from './pages/Doc.jsx'
import App from './App.jsx'
import GamePage from './pages/GamePage.jsx'
import StatsPage from './pages/StatsPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import MultiplayerPage from './pages/MultiplayerPage.jsx'
import { ProtectedRoute } from './routes/ProtectedRoute';
import { PublicOnlyRoute } from './routes/PublicOnlyRoute';
import { AuthProvider } from './contexts/AuthContext.jsx' 
import Navbar from './components/Navbar.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/doc" element={<Doc />} />
          <Route path="/home" element={<App />} />
          <Route path="/game" element={<Navigate to="/solo/game" replace />} />
          <Route path="/solo/game" element={<GamePage />} />
          <Route
            path="/multiplayer/game"
            element={
              <ProtectedRoute>
                <GamePage />
              </ProtectedRoute>
            }
          />
          <Route 
              path="/stats" 
              element={
                  <ProtectedRoute>
                      <StatsPage />
                  </ProtectedRoute>
              } 
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <RegisterPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />
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
