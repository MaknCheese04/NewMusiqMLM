import React from 'react';
import { useAuth } from '../../context/AuthContext';

export function SettingsPage({ theme, setTheme }) {
  const { logout } = useAuth();

  return (
    <div className="settings-page-container" style={{ padding: '0 48px', maxWidth: '780px' }}>
      <section className="settings-card">
        <p className="eyebrow">ACCOUNT</p>
        <h1>Settings</h1>
        <p className="settings-subtitle">Manage your NewMusiq account and preferences.</p>

        <div className="setting-row theme-setting-row">
          <div>
            <h3>Appearance</h3>
            <p>Choose the waves that match your mood.</p>
          </div>
          <div className="theme-options" role="group" aria-label="Color theme">
            <button type="button" className={`theme-option theme-option-light ${theme === 'light' ? 'selected' : ''}`}
              onClick={() => setTheme('light')} aria-pressed={theme === 'light'}>
              <span className="theme-preview" aria-hidden="true" />
              <span>Light</span>
            </button>
            <button type="button" className={`theme-option theme-option-dark ${theme === 'dark' ? 'selected' : ''}`}
              onClick={() => setTheme('dark')} aria-pressed={theme === 'dark'}>
              <span className="theme-preview" aria-hidden="true" />
              <span>Dark</span>
            </button>
          </div>
        </div>

        <div className="setting-row">
          <div>
            <h3>Playback preferences</h3>
            <p>Autoplay, explicit content, and audio quality.</p>
          </div>
          <button>Manage</button>
        </div>

        <div className="setting-row">
          <div>
            <h3>Privacy</h3>
            <p>Control what listeners and artists can see.</p>
          </div>
          <button>Manage</button>
        </div>

        <div className="settings-danger" style={{ marginTop: '40px' }}>
          <div>
            <h3>Sign out of NewMusiq</h3>
            <p>You can sign back in anytime.</p>
          </div>
          <button onClick={logout}>Sign out</button>
        </div>
      </section>
    </div>
  );
}
