import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useAudio } from '../context/AudioContext';
import { Home, Globe2, Search, Library, Music, Plus, Heart, ChevronDown } from 'lucide-react';

export function Sidebar({ activePage, setActivePage, onOpenStudio }) {
  const { currentUser, profile } = useAuth();
  const { playlists, createPlaylist } = useAudio();

  const getInitials = (name) => {
    if (!name) return 'SW';
    return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  };

  const handleCreatePlaylist = () => {
    const name = window.prompt('Name your playlist');
    if (name) {
      createPlaylist(name);
    }
  };

  return (
    <aside className="sidebar">
      <a className="brand" href="#" onClick={() => setActivePage('home')}>
        <span className="brand-mark">◒</span>
        <span>NewMusiq</span>
      </a>

      <nav className="main-nav" aria-label="Main navigation">
        <button
          className={`nav-item ${activePage === 'home' ? 'active' : ''}`}
          onClick={() => setActivePage('home')}
        >
          <Home size={18} />
          <span>Home</span>
        </button>

        <button
          className={`nav-item nav-subitem ${activePage === 'world-map' ? 'active' : ''}`}
          onClick={() => setActivePage('world-map')}
        >
          <Globe2 size={18} />
          <span>World Map</span>
        </button>

        <button
          className={`nav-item ${activePage === 'search' ? 'active' : ''}`}
          onClick={() => setActivePage('search')}
        >
          <Search size={18} />
          <span>Search</span>
        </button>

        <button
          className={`nav-item ${activePage === 'library' ? 'active' : ''}`}
          onClick={() => setActivePage('profile')}
        >
          <Library size={18} />
          <span>Your Library</span>
        </button>

        {currentUser?.role === 'artist' && (
          <button
            className="nav-item artist-only"
            onClick={onOpenStudio}
            style={{ color: '#6856ed', fontWeight: '700' }}
          >
            <Music size={18} />
            <span>Artist studio</span>
          </button>
        )}
      </nav>

      <div className="divider"></div>

      <div className="nav-label">YOUR COLLECTION</div>

      <button className="nav-item" onClick={handleCreatePlaylist}>
        <Plus size={18} />
        <span>Create playlist</span>
      </button>

      <button className="nav-item" onClick={() => setActivePage('profile')}>
        <Heart size={18} style={{ color: '#e5484d' }} />
        <span>Liked songs</span>
      </button>

      <div className="playlist-list">
        {playlists.map((pl, i) => (
          <button key={i} onClick={() => setActivePage('profile')}>
            {pl.name}
          </button>
        ))}
      </div>

      <div className="sidebar-bottom">
        <button className="profile-trigger" onClick={() => setActivePage('profile')}>
          <div className="avatar">
            {getInitials(profile?.name || currentUser?.name)}
          </div>
          <span className="name">{profile?.name || currentUser?.name || 'Alex Rivera'}</span>
          <ChevronDown size={14} className="chevron" />
        </button>
      </div>
    </aside>
  );
}
