import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAudio } from '../../context/AudioContext';

const genreList = [
  'Alternative', 'Ambient', 'Blues', 'Dance', 'Electronic', 'Folk', 'Hip-hop',
  'House', 'Indie', 'Jazz', 'K-pop', 'Latin', 'Lo-fi', 'Metal', 'Pop', 'Punk',
  'R&B', 'Rap', 'Rock', 'Singer-songwriter', 'Soul', 'Techno'
];

export function ArtistStudioModal({ onClose }) {
  const { currentUser } = useAuth();
  const { artistReleases, addRelease, playTrack } = useAudio();

  const [title, setTitle] = useState('');
  const [album, setAlbum] = useState('');
  const [genre, setGenre] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [status, setStatus] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!audioFile) return;

    const audioUrl = URL.createObjectURL(audioFile);
    const coverUrl = coverFile ? URL.createObjectURL(coverFile) : '';

    const newRelease = {
      title,
      album: album || 'Single',
      genre,
      lyrics,
      artist: currentUser?.artistName || currentUser?.name || 'Independent Artist',
      url: audioUrl,
      art: coverUrl ? `url(${coverUrl})` : 'linear-gradient(135deg,#7264e9,#e990b5)',
      duration: 210
    };

    addRelease(newRelease);
    setStatus('Published for this session — listeners can stream it now.');
    setTitle('');
    setAlbum('');
    setGenre('');
    setLyrics('');
    setAudioFile(null);
    setCoverFile(null);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">ARTIST STUDIO</p>
            <h2>Upload a release</h2>
          </div>
          <button onClick={onClose} style={{ fontSize: '24px', color: '#767687' }}>×</button>
        </div>

        <p style={{ color: '#77798b', fontSize: '13px', marginBottom: '20px' }}>
          Upload an audio file and cover to make a streamable release available in this browser session.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Song title</label>
            <input
              required
              maxLength={80}
              placeholder="e.g. Midnight on 8th"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Album title</label>
            <input
              maxLength={80}
              placeholder="Single or album name"
              value={album}
              onChange={(e) => setAlbum(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Genre</label>
            <input
              required
              list="genres"
              placeholder="Choose a genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
            />
            <datalist id="genres">
              {genreList.map((g, i) => (
                <option key={i} value={g} />
              ))}
            </datalist>
          </div>

          <div className="form-group">
            <label>Lyrics <small style={{ fontWeight: 400, color: '#77798b' }}>(optional; use [mm:ss] before lines to sync them)</small></label>
            <textarea rows={5} value={lyrics} onChange={(e) => setLyrics(e.target.value)} placeholder={'[00:12] First line\n[00:18] Next line'} />
          </div>

          <div className="form-group">
            <label>Audio file <small style={{ fontWeight: 400, color: '#77798b' }}>(MP3, WAV, M4A, OGG)</small></label>
            <input
              type="file"
              accept="audio/*"
              required
              onChange={(e) => setAudioFile(e.target.files[0])}
            />
          </div>

          <div className="form-group">
            <label>Album cover <small style={{ fontWeight: 400, color: '#77798b' }}>(JPG, PNG, WebP)</small></label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverFile(e.target.files[0])}
            />
          </div>

          <button
            type="submit"
            className="btn-play-hero"
            style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}
          >
            Publish song
          </button>

          {status && <p style={{ color: '#4d9b78', fontSize: '12px', marginTop: '12px', textAlign: 'center' }}>{status}</p>}

          <section style={{ borderTop: '1px solid #eceaf1', marginTop: '24px', paddingTop: '16px' }}>
            <h3 style={{ fontFamily: 'Outfit', fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>
              Your session releases
            </h3>
            {artistReleases.length ? (
              <div style={{ display: 'grid', gap: '8px' }}>
                {artistReleases.map((rel, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => playTrack(rel)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '8px 12px',
                      background: '#f7f6fc',
                      borderRadius: '8px',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ width: '36px', height: '36px', borderRadius: '6px', background: rel.art, display: 'grid', placeItems: 'center', color: '#fff' }}>
                      ♫
                    </div>
                    <div>
                      <strong style={{ display: 'block', fontSize: '13px' }}>{rel.title}</strong>
                      <small style={{ color: '#77798b', fontSize: '11px' }}>{rel.album} · {rel.genre}</small>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p style={{ color: '#77798b', fontSize: '12px' }}>Your uploaded songs will appear here.</p>
            )}
          </section>
        </form>
      </div>
    </div>
  );
}
