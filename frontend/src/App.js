import React, { useState, useEffect } from 'react';
import Auth from './Auth';
import Dashboard from './Dashboard';
import PublicProfile from './PublicProfile';
import './App.css';

function App() {
  const [view, setView] = useState('loading');
  const [profileId, setProfileId] = useState(null);

  useEffect(() => {
    const path = window.location.pathname;
    
    if (path.startsWith('/profile/')) {
      const id = path.split('/')[2];
      setProfileId(id);
      setView('public');
    } else {
      const token = localStorage.getItem('token');
      if (token) {
        setView('dashboard');
      } else {
        setView('auth');
      }
    }
    
    // Listen to popstate for back button
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handlePopState = () => {
    const path = window.location.pathname;
    if (path.startsWith('/profile/')) {
      setProfileId(path.split('/')[2]);
      setView('public');
    } else if (localStorage.getItem('token')) {
      setView('dashboard');
    } else {
      setView('auth');
    }
  };

  const handleLogin = () => {
    setView('dashboard');
    window.history.pushState({}, '', '/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setView('auth');
    window.history.pushState({}, '', '/');
  };

  if (view === 'loading') return <div className="loading-screen">Loading...</div>;

  return (
    <div className="App">
      {view === 'auth' && <Auth onLogin={handleLogin} />}
      {view === 'dashboard' && <Dashboard onLogout={handleLogout} />}
      {view === 'public' && <PublicProfile userId={profileId} />}
    </div>
  );
}

export default App;
