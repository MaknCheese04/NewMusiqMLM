import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export function EditProfileModal({ onClose }) {
  const { profile, updateProfile } = useAuth();
  const [name, setName] = useState(profile?.name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [genres, setGenres] = useState(profile?.genres ? profile.genres.join(', ') : '');

  const handleSubmit = (e) => {
    e.preventDefault();
    const genreArray = genres
      .split(',')
      .map(item => item.trim())
      .filter(Boolean)
      .slice(0, 6);

    updateProfile({
      name: name.trim() || 'Alex Rivera',
      bio: bio.trim() || 'Chasing warm melodies and new late-night discoveries.',
      genres: genreArray.length ? genreArray : ['Indie pop', 'Dream pop', 'Neo soul', 'Electronic']
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">MAKE IT YOURS</p>
            <h2>Personalize your profile</h2>
          </div>
          <button onClick={onClose} style={{ fontSize: '24px', color: '#767687' }}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Display name</label>
            <input
              required
              maxLength={32}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>About you</label>
            <textarea
              maxLength={120}
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Favorite genres <small style={{ fontWeight: 400, color: '#77798b' }}>(Separate with commas)</small></label>
            <input
              maxLength={100}
              value={genres}
              onChange={(e) => setGenres(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '10px 16px', borderRadius: '20px', background: '#f1f0f5', fontWeight: 700, fontSize: '13px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ padding: '10px 18px', borderRadius: '20px', background: '#6856ed', color: '#fff', fontWeight: 700, fontSize: '13px' }}
            >
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
