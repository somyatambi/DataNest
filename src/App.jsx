import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import LandingPage from './components/LandingPage';
import LoginModal from './components/LoginModal';
import SignupModal from './components/SignupModal';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';

function App() {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-green-400 text-xl">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return <Dashboard user={user} onLogout={logout} />;
  }

  return (
    <div>
      <Navbar
        onLogin={() => setShowLogin(true)}
        onGetStarted={() => setShowSignup(true)}
      />
      <LandingPage
        onGetStarted={() => setShowSignup(true)}
        onLogin={() => setShowLogin(true)}
      />
      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSwitchToSignup={() => { setShowLogin(false); setShowSignup(true); }}
        />
      )}
      {showSignup && (
        <SignupModal
          onClose={() => setShowSignup(false)}
          onSwitchToLogin={() => { setShowSignup(false); setShowLogin(true); }}
        />
      )}
    </div>
  );
}

export default App;
