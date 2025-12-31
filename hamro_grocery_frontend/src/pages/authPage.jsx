import React, { useState, useEffect } from 'react';
import SignupPage from '../components/auth/SignupPage';
import LoginPage from '../components/auth/LoginPage';
import NavigationContext from '../context/NavigationContext';

export const AuthPage = () => {
  const [view, setView] = useState('login'); 

  const navigate = (target) => {
    setView(target); 
  };

  
  const contextValue = { navigate };

  useEffect(() => {
    
    const hash = window.location.hash.replace('#/', '');
    if (hash === 'signup') {
      setView('signup');
    } else {
      setView('login'); 
    }

    const handleHashChange = () => {
      const updated = window.location.hash.replace('#/', '');
      setView(updated || 'login');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <NavigationContext.Provider value={contextValue}>
      {view === 'signup' ? <SignupPage /> : <LoginPage />}
    </NavigationContext.Provider>
  );
};
export default AuthPage;