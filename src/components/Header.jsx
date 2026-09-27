import React from 'react';
import { ChevronLeft, ChevronRight, Settings, Bell } from 'lucide-react';

export function Header({ activePage, setActivePage, onOpenSettings, onEditProfile }) {
  return (
    <header className="main-header">
      <div className="history-nav">
        <button aria-label="Back" onClick={() => setActivePage('home')}>
          <ChevronLeft size={18} />
        </button>
        <button aria-label="Open world map" onClick={() => setActivePage('world-map')}>
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="header-actions">
        <a className="contact-link" href="mailto:hello@soundwave.app">
          Contact us
        </a>
        
        {activePage === 'profile' && (
          <button className="settings-link-btn" onClick={onOpenSettings} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700' }}>
            <Settings size={16} /> Settings
          </button>
        )}

        {activePage === 'profile' ? (
          <button className="btn-upgrade" onClick={onEditProfile}>
            Edit profile
          </button>
        ) : (
          <button className="btn-upgrade btn-premium">Explore Premium</button>
        )}

        <button className="history-nav button" style={{ borderRadius: '50%', width: '32px', height: '32px', border: '1px solid #eceaf1', display: 'grid', placeItems: 'center' }}>
          <Bell size={16} />
        </button>
      </div>
    </header>
  );
}
