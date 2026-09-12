import React, { useState, useEffect } from 'react';
import { useAudio } from '../../context/AudioContext';
import { safeStorage } from '../../lib/safeStorage';
import { Search as SearchIcon, ArrowUpRight, Music, Play } from 'lucide-react';

const songLyrics = {
  'Velvet Skies': 'Under velvet skies, we let the city fade away tonight',
  'After Hours': 'After hours, the neon knows our names',
  'Open Road': 'Take the open road and leave the old world behind',
  'Gold Dust': 'You left gold dust on the kitchen floor',
  'Blue Motel': 'Meet me at the blue motel where the radio still glows',
  'Daylight': 'We found daylight in the middle of the storm',
  'Dream pop': 'Float with me where the daylight turns to dreams'
};

const searchIndex = [
  { name: 'Velvet Skies', detail: 'Luna Vale', type: 'Song', art: 'linear-gradient(135deg,#df789f,#f8c18e 55%,#493f7d)', lyrics: songLyrics['Velvet Skies'] },
  { name: 'After Hours', detail: 'The Violets', type: 'Song', art: 'linear-gradient(135deg,#2b315c,#a589e8)', lyrics: songLyrics['After Hours'] },
  { name: 'Open Road', detail: 'Milo Sun', type: 'Song', art: 'linear-gradient(135deg,#7bc3c0,#d2e189)', lyrics: songLyrics['Open Road'] },
  { name: 'Gold Dust', detail: 'June Harper', type: 'Song', art: 'linear-gradient(135deg,#e5ae5a,#8e456d)', lyrics: songLyrics['Gold Dust'] },
  { name: 'Blue Motel', detail: 'Neon Coast', type: 'Song', art: 'linear-gradient(135deg,#315878,#cc6c80)', lyrics: songLyrics['Blue Motel'] },
  { name: 'Luna Vale', detail: 'Dream pop · 128K monthly listeners', type: 'Artist', art: 'linear-gradient(135deg,#df789f,#6d568d)' },
  { name: 'The Violets', detail: 'Indie rock · 92K monthly listeners', type: 'Artist', art: 'linear-gradient(135deg,#252b58,#a789e4)' },
  { name: 'Night drives', detail: 'Playlist for you', type: 'Playlist', art: 'linear-gradient(135deg,#2a235e,#ea7c9c)' },
  { name: 'Daylight', detail: 'An easy, uplifting mix', type: 'Playlist', art: 'linear-gradient(135deg,#f8be70,#e37d6c)' }
];

export function SearchPage({ onClose }) {
  const { playTrack } = useAudio();
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState(() => {
    const saved = safeStorage.getItem('soundwave-search-history');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    safeStorage.setItem('soundwave-search-history', JSON.stringify(history));
  }, [history]);

  const handleSaveSearch = (q) => {
    if (!q || q.length < 2) return;
    setHistory(prev => [q, ...prev.filter(item => item.toLowerCase() !== q.toLowerCase())].slice(0, 8));
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const normalized = query.toLowerCase().trim();
  const results = normalized
    ? searchIndex.filter(item =>
        `${item.name} ${item.detail} ${item.type} ${item.lyrics || ''}`
          .toLowerCase()
          .includes(normalized)
      ).slice(0, 8)
    : searchIndex.slice(0, 5);

  return (
    <div className="search-page-container" style={{ padding: '0 48px', maxWidth: '800px' }}>
      <section className="search-area" style={{ marginTop: '20px' }}>
        <p className="eyebrow">EXPLORE SOUNDS</p>
        <h1 style={{ fontFamily: 'Outfit', fontSize: '38px', fontWeight: 800, marginBottom: '24px' }}>
          Find exactly what<br />
          <em style={{ color: '#6856ed', fontStyle: 'normal' }}>moves you.</em>
        </h1>

        <div className="music-search" style={{
          height: '60px',
          border: '1px solid #d8d5e5',
          borderRadius: '14px',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          padding: '0 18px',
          gap: '12px',
          boxShadow: '0 8px 24px rgba(41, 37, 64, 0.05)'
        }}>
          <SearchIcon size={22} style={{ color: '#6856ed' }} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveSearch(query);
            }}
            placeholder="Search songs, lyrics, artists, playlists…"
            style={{
              border: 'none',
              outline: 'none',
              flex: 1,
              fontSize: '16px',
              fontFamily: 'DM Sans'
            }}
            autoFocus
          />
          <kbd style={{ color: '#92909d', border: '1px solid #e1dfe8', borderRadius: '5px', padding: '3px 6px', fontSize: '10px' }}>
            Esc
          </kbd>
        </div>

        <div className="search-history-actions" style={{ display: 'flex', gap: '14px', marginTop: '16px' }}>
          <button
            onClick={() => setShowHistory(prev => !prev)}
            style={{ fontSize: '13px', fontWeight: 700, color: '#6856ed' }}
          >
            Recent searches
          </button>
          {history.length > 0 && showHistory && (
            <button
              onClick={handleClearHistory}
              style={{ fontSize: '13px', fontWeight: 700, color: '#a34b56' }}
            >
              Clear history
            </button>
          )}
        </div>

        {showHistory && (
          <div className="search-history" style={{ marginTop: '10px', padding: '8px 0', borderBottom: '1px solid #eceaf1' }}>
            {history.length ? history.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(item);
                  handleSaveSearch(item);
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 0', color: '#5d5e6c', fontSize: '13px' }}
              >
                <ArrowUpRight size={14} /> {item}
              </button>
            )) : <p style={{ color: '#77798b', fontSize: '13px' }}>No recent searches yet.</p>}
          </div>
        )}

        <div className="search-suggestions" style={{ display: 'grid', gap: '10px', marginTop: '24px' }}>
          {results.map((item, idx) => {
            const isLyricMatch = item.lyrics && !`${item.name} ${item.detail} ${item.type}`.toLowerCase().includes(normalized);
            return (
              <button
                key={idx}
                className="search-result"
                onClick={() => {
                  handleSaveSearch(item.name);
                  playTrack({ title: item.name, artist: item.detail, art: item.art || 'linear-gradient(135deg,#7264e9,#e990b5)' });
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: '#ffffff',
                  border: '1px solid #eceaf1',
                  textAlign: 'left',
                  width: '100%'
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: item.art || '#e8e5ff',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#fff',
                  fontWeight: 700
                }}>
                  {item.type === 'Song' ? <Play size={16} fill="#fff" /> : <Music size={16} />}
                </div>
                <div style={{ flex: 1 }}>
                  <strong style={{ display: 'block', fontSize: '15px', fontFamily: 'Outfit' }}>{item.name}</strong>
                  <small style={{ color: '#77798b', fontSize: '12px' }}>
                    {isLyricMatch ? `Lyric match · “${item.lyrics}”` : `${item.type} · ${item.detail}`}
                  </small>
                </div>
              </button>
            );
          })}
        </div>

        <p className="search-hint" style={{ color: '#77798b', fontSize: '13px', marginTop: '24px' }}>
          Try “velvet skies”, “neon knows”, or “gold dust”
        </p>
      </section>
    </div>
  );
}
