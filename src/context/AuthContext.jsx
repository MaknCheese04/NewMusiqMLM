import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const defaultProfile = {
  name: 'Alex Rivera',
  bio: 'Chasing warm melodies and new late-night discoveries.',
  genres: ['Indie pop', 'Dream pop', 'Neo soul', 'Electronic']
};

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => localStorage.getItem('soundwave-session') || null);
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('soundwave-profile');
    return saved ? JSON.parse(saved) : defaultProfile;
  });

  const [accounts, setAccounts] = useState(() => {
    const saved = localStorage.getItem('soundwave-accounts');
    return saved ? JSON.parse(saved) : [];
  });

  const currentUser = accounts.find(a => a.email === session) || (session ? {
    email: session,
    name: profile.name,
    role: 'listener',
    artistName: ''
  } : null);

  useEffect(() => {
    if (session) {
      localStorage.setItem('soundwave-session', session);
    } else {
      localStorage.removeItem('soundwave-session');
    }
  }, [session]);

  useEffect(() => {
    localStorage.setItem('soundwave-profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('soundwave-accounts', JSON.stringify(accounts));
  }, [accounts]);

  const loginDemo = () => {
    const email = 'demo@soundwave.app';
    const existing = accounts.find(a => a.email === email);
    if (!existing) {
      const demoAccount = {
        email,
        password: 'demo1234',
        name: 'Demo Listener',
        role: 'listener',
        artistName: ''
      };
      setAccounts(prev => [...prev, demoAccount]);
    }
    setProfile(prev => ({ ...prev, name: 'Demo Listener' }));
    setSession(email);
  };

  const login = (email, password) => {
    const formattedEmail = email.trim().toLowerCase();
    const account = accounts.find(a => a.email === formattedEmail);
    if (account && account.password !== password) {
      throw new Error('That password does not match this account.');
    }
    if (!account) {
      const name = formattedEmail.split('@')[0];
      const newAcc = { email: formattedEmail, password, name, role: 'listener', artistName: '' };
      setAccounts(prev => [...prev, newAcc]);
      setProfile(prev => ({ ...prev, name }));
    } else {
      setProfile(prev => ({ ...prev, name: account.name }));
    }
    setSession(formattedEmail);
  };

  const register = ({ email, password, name, role, artistName }) => {
    const formattedEmail = email.trim().toLowerCase();
    if (accounts.some(a => a.email === formattedEmail)) {
      throw new Error('An account with that email already exists.');
    }
    const displayName = name.trim() || formattedEmail.split('@')[0];
    const newAcc = {
      email: formattedEmail,
      password,
      name: displayName,
      role: role || 'listener',
      artistName: artistName || displayName
    };
    setAccounts(prev => [...prev, newAcc]);
    setProfile(prev => ({ ...prev, name: displayName }));
    setSession(formattedEmail);
  };

  const logout = () => {
    setSession(null);
  };

  const updateProfile = (updated) => {
    setProfile(prev => ({
      ...prev,
      ...updated
    }));
  };

  return (
    <AuthContext.Provider value={{
      session,
      currentUser,
      profile,
      login,
      register,
      loginDemo,
      logout,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
