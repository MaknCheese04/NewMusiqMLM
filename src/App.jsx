import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AudioProvider } from './context/AudioContext';
import { AuthScreen } from './components/AuthScreen';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Player } from './components/Player';
import { HomePage } from './components/pages/HomePage';
import { SearchPage } from './components/pages/SearchPage';
import { ProfilePage } from './components/pages/ProfilePage';
import { SettingsPage } from './components/pages/SettingsPage';
import { ArtistStudioModal } from './components/modals/ArtistStudioModal';
import { EditProfileModal } from './components/modals/EditProfileModal';
import './styles/index.css';

function MainApp() {
  const { session, loading } = useAuth();
  const [activePage, setActivePage] = useState('home');
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  if (loading) {
    return null;
  }

  if (!session) {
    return <AuthScreen />;
  }

  return (
    <div className="app-shell">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        onOpenStudio={() => setIsStudioOpen(true)}
      />

      <main className="content-wrapper">
        <Header
          activePage={activePage}
          setActivePage={setActivePage}
          onOpenSettings={() => setActivePage('settings')}
          onEditProfile={() => setIsEditProfileOpen(true)}
        />

        {activePage === 'home' && <HomePage />}
        {activePage === 'search' && <SearchPage onClose={() => setActivePage('home')} />}
        {activePage === 'profile' && <ProfilePage onEditProfile={() => setIsEditProfileOpen(true)} />}
        {activePage === 'settings' && <SettingsPage />}
      </main>

      <Player />

      {isStudioOpen && (
        <ArtistStudioModal onClose={() => setIsStudioOpen(false)} />
      )}

      {isEditProfileOpen && (
        <EditProfileModal onClose={() => setIsEditProfileOpen(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AudioProvider>
        <MainApp />
      </AudioProvider>
    </AuthProvider>
  );
}
