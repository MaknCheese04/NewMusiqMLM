import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAudio } from '../../context/AudioContext';

const artists = [
  ["Luna Vale", "Dream pop · 128K monthly listeners", "LV", "linear-gradient(135deg,#df789f,#6d568d)"],
  ["The Violets", "Indie rock · 92K monthly listeners", "TV", "linear-gradient(135deg,#252b58,#a789e4)"],
  ["Milo Sun", "Alternative · 77K monthly listeners", "MS", "linear-gradient(135deg,#69beba,#d6df8d)"],
  ["June Harper", "Soul · 64K monthly listeners", "JH", "linear-gradient(135deg,#e19d56,#974565)"]
];

export function ProfilePage({ onEditProfile }) {
  const { profile, currentUser } = useAuth();
  const { savedSongs, playlists } = useAudio();

  const getInitials = (name) => {
    if (!name) return 'AR';
    return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  };

  const displayName = profile?.name || currentUser?.name || 'Alex Rivera';

  return (
    <div className="profile-page-container">
      <section className="profile-hero">
        <div className="profile-cover"></div>
        <div className="profile-intro">
          <div className="profile-avatar">
            {getInitials(displayName)}
          </div>
          <div>
            <p className="eyebrow">LISTENER PROFILE</p>
            <h1>{displayName}</h1>
            <p>{profile?.bio || 'Chasing warm melodies and new late-night discoveries.'}</p>
            <div className="profile-meta">
              <span>✦ {playlists.length} playlists</span>
              <span>♡ {savedSongs.length} liked songs</span>
              <span>♬ {artists.length} artists followed</span>
            </div>
          </div>
          <button className="edit-profile" onClick={onEditProfile}>
            Edit profile
          </button>
        </div>
      </section>

      <section className="profile-section">
        <div className="section-header">
          <div>
            <h2>Your sound identity</h2>
            <p>Genres that shape your recommendations.</p>
          </div>
        </div>
        <div className="genre-chips">
          {(profile?.genres || ['Indie pop', 'Dream pop', 'Neo soul', 'Electronic']).map((genre, idx) => (
            <span key={idx}>{genre}</span>
          ))}
        </div>
      </section>

      <section className="profile-section">
        <div className="section-header">
          <div>
            <h2>Artists you follow</h2>
            <p>Keep up with the voices you love.</p>
          </div>
        </div>
        <div className="artist-grid">
          {artists.map(([name, detail, avatar, art], idx) => (
            <article key={idx} className="artist-card">
              <div className="artist-avatar" style={{ background: art }}>
                {avatar}
              </div>
              <div>
                <h3>{name}</h3>
                <p>{detail}</p>
              </div>
              <button className="following">Following</button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
