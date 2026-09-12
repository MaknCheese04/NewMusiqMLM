import React from 'react';
import { useAudio } from '../context/AudioContext';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Heart, Volume2, Loader2, Star } from 'lucide-react';

export function Player() {
  const {
    currentTrack,
    isPlaying,
    isRetrieving,
    retrievalStatus,
    elapsed,
    duration,
    volume,
    savedSongs,
    currentRating,
    ratingSaving,
    ratingError,
    rateTrack,
    togglePlay,
    playNext,
    playPrevious,
    handleSeek,
    setVolume,
    toggleLike
  } = useAudio();

  const formatTime = (sec) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isLiked = savedSongs.some(s => s.title === currentTrack.title);
  const totalDuration = duration || 224;

  return (
    <footer className="player-bar">
      <div className="now-playing">
        <div
          className="now-playing-thumb"
          style={{ background: currentTrack.art || 'linear-gradient(135deg,#7264e9,#e990b5)' }}
        >
          {isRetrieving && (
            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: 'inherit',
              background: 'rgba(0,0,0,0.5)',
              display: 'grid',
              placeItems: 'center',
              color: '#fff'
            }}>
              <Loader2 className="animate-spin" size={20} />
            </div>
          )}
        </div>
        <div className="now-playing-info">
          <strong>{currentTrack.title || 'Velvet Skies'}</strong>
          <small>{currentTrack.artist || 'Luna Vale'} {currentTrack.album ? `· ${currentTrack.album}` : ''}</small>
          {retrievalStatus && (
            <div style={{ fontSize: '10px', color: '#6856ed', marginTop: '2px', fontWeight: 600 }}>
              {retrievalStatus}
            </div>
          )}
        </div>
        <button
          className={`btn-like ${isLiked ? 'liked' : ''}`}
          onClick={() => toggleLike(currentTrack)}
          aria-label="Like song"
        >
          <Heart size={18} fill={isLiked ? '#e5484d' : 'none'} />
        </button>
      </div>

      <div className="playback-controls">
        <div className="controls-row">
          <button title="Shuffle"><Shuffle size={16} /></button>
          <button title="Previous" onClick={playPrevious}><SkipBack size={18} /></button>
          <button className="btn-main-play" onClick={togglePlay} disabled={isRetrieving} aria-label={isPlaying ? "Pause" : "Play"}>
            {isRetrieving ? (
              <Loader2 className="animate-spin" size={18} color="#ffffff" />
            ) : isPlaying ? (
              <Pause size={18} fill="#ffffff" />
            ) : (
              <Play size={18} fill="#ffffff" style={{ marginLeft: '2px' }} />
            )}
          </button>
          <button title="Next" onClick={playNext}><SkipForward size={18} /></button>
          <button title="Repeat"><Repeat size={16} /></button>
        </div>

        <div className="timeline">
          <span>{formatTime(elapsed)}</span>
          <input
            type="range"
            className="range-slider"
            min={0}
            max={totalDuration}
            value={elapsed}
            onChange={(e) => handleSeek(Number(e.target.value))}
            disabled={isRetrieving}
          />
          <span>{formatTime(totalDuration)}</span>
        </div>
      </div>

      <div className="player-options">
        <div className="song-rating" aria-label="Rate this song from 0 to 5 stars">
          <span className="song-rating-label">Your rating: {currentRating === null ? 'Not rated' : `${currentRating}/5`}</span>
          <div className="song-rating-buttons">
            <button type="button" className={`rating-zero ${currentRating === 0 ? 'selected' : ''}`}
              onClick={() => rateTrack(currentTrack, 0)} disabled={ratingSaving}
              aria-label="Rate 0 out of 5 stars" aria-pressed={currentRating === 0}>0</button>
            {[1, 2, 3, 4, 5].map(stars => (
              <button type="button" key={stars} onClick={() => rateTrack(currentTrack, stars)}
                disabled={ratingSaving} aria-label={`Rate ${stars} out of 5 stars`}
                aria-pressed={currentRating === stars}>
                <Star size={18} fill={currentRating !== null && stars <= currentRating ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>
          {ratingError && <span className="song-rating-error" role="alert">{ratingError}</span>}
        </div>
        <div className="volume-control">
          <Volume2 size={18} />
          <input type="range" className="range-slider" min={0} max={100} value={volume}
            aria-label="Volume" onChange={(e) => setVolume(Number(e.target.value))} />
        </div>
      </div>
    </footer>
  );
}
