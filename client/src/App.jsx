import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { GAME_NAME } from './config/gameConfig';
import { authService } from './services/authService';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import LandingPage from './pages/LandingPage';
import LevelSelectPage from './pages/LevelSelectPage';
import GamePage from './pages/GamePage';
import LeaderboardPage from './pages/LeaderboardPage';
import AchievementsPage from './pages/AchievementsPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DailyChallengePage from './pages/DailyChallengePage';
import SettingsPage from './pages/SettingsPage';
import HelpPage from './pages/HelpPage';
import AdminPage from './pages/AdminPage';

function AppLayout({ user, setUser, onLogout, onProgressUpdate }) {
  const location = useLocation();
  const isGameRoute = location.pathname.startsWith('/game');

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      height: isGameRoute ? '100vh' : 'auto',
      maxHeight: isGameRoute ? '100vh' : 'none',
      overflow: isGameRoute ? 'hidden' : 'visible'
    }}>
      {!isGameRoute && <Navbar user={user} onLogout={onLogout} />}

      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: isGameRoute ? '100%' : 'auto',
        maxHeight: isGameRoute ? '100%' : 'none',
        overflow: isGameRoute ? 'hidden' : 'visible'
      }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/levels" element={<LevelSelectPage user={user} />} />
          <Route path="/game/:levelId" element={<GamePage user={user} onProgressUpdate={onProgressUpdate} />} />
          <Route path="/leaderboard" element={<LeaderboardPage user={user} />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/daily" element={<DailyChallengePage />} />
          <Route path="/dashboard" element={<DashboardPage user={user} />} />
          <Route path="/profile" element={<DashboardPage user={user} />} />
          <Route path="/login" element={<LoginPage onLoginSuccess={setUser} />} />
          <Route path="/register" element={<RegisterPage onLoginSuccess={setUser} />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isGameRoute && <Footer />}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Dynamic Browser Title from GAME_NAME (Requirement 6 & 9)
    document.title = `${GAME_NAME} | Cosmic Puzzle Arcade`;

    async function checkAuth() {
      const activeUser = await authService.fetchMe();
      if (activeUser) {
        setUser(activeUser);
      }
      setLoading(false);
    }
    checkAuth();
  }, []);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  const handleProgressUpdate = (updatedProgress) => {
    if (user && updatedProgress) {
      setUser(prev => ({ ...prev, ...updatedProgress }));
    }
  };

  return (
    <BrowserRouter>
      <AppLayout
        user={user}
        setUser={setUser}
        onLogout={handleLogout}
        onProgressUpdate={handleProgressUpdate}
      />
    </BrowserRouter>
  );
}

