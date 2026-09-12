import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { safeStorage } from '../lib/safeStorage';

const AuthContext = createContext();

const defaultProfile = {
  name: 'Alex Rivera',
  bio: 'Chasing warm melodies and new late-night discoveries.',
  genres: ['Indie pop', 'Dream pop', 'Neo soul', 'Electronic']
};

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(() => {
    const saved = safeStorage.getItem('soundwave-profile');
    try {
      return saved ? JSON.parse(saved) : defaultProfile;
    } catch {
      return defaultProfile;
    }
  });

  useEffect(() => {
    // 1. Fetch current session on load
    supabase.auth.getSession().then(({ data: { session: activeSession } }) => {
      setSession(activeSession);
      setUser(activeSession?.user ?? null);
      if (activeSession?.user?.user_metadata?.name) {
        setProfile(prev => ({
          ...prev,
          name: activeSession.user.user_metadata.name
        }));
      }
      setLoading(false);
    }).catch(err => {
      console.warn('Error fetching Supabase session:', err);
      setLoading(false);
    });

    // 2. Listen to real-time auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user?.user_metadata?.name) {
        setProfile(prev => ({
          ...prev,
          name: currentSession.user.user_metadata.name
        }));
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    safeStorage.setItem('soundwave-profile', JSON.stringify(profile));
  }, [profile]);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  };

  const register = async ({ email, password, name, role, artistName }) => {
    const displayName = name.trim() || email.split('@')[0];
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          name: displayName,
          role: role || 'listener',
          artistName: artistName || displayName
        }
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data?.user) {
      setProfile(prev => ({ ...prev, name: displayName }));
    }

    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
  };

  const updateProfile = (updated) => {
    setProfile(prev => ({
      ...prev,
      ...updated
    }));
  };

  const currentUser = user ? {
    email: user.email,
    name: user.user_metadata?.name || profile.name,
    role: user.user_metadata?.role || 'listener',
    artistName: user.user_metadata?.artistName || ''
  } : null;

  return (
    <AuthContext.Provider value={{
      session,
      user,
      currentUser,
      loading,
      profile,
      login,
      register,
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
