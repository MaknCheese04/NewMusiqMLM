import React from 'react';
import { useAudio } from '../context/AudioContext';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Heart, Volume2 } from 'lucide-react';

export function Player() {
  const {
    currentTrack,
    isPlaying,
    elapsed,
    volume,
    savedSongs,
    togglePlay,
    playNext,
    playPrevious,
    setElapsed,
    setVolume,
    toggleLike
  } = useAudio();

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isLiked = savedSongs.some(s => s.title === currentTrack.title);
  const totalDuration = currentTrack.duration || 224;

  return (
    <footer className="player-bar">
      <div className="now-playing">
        <div
          className="now-playing-thumb"
          style={{ background: currentTrack.art || 'linear-gradient(135deg,#7264e9,#e990b5)' }}
        ></div>
        <div className="now-playing-info">
          <strong>{currentTrack.title || 'Velvet Skies'}</strong>
          <small>{currentTrack.artist || 'Luna Vale'}</small>
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
          <button className="btn-main-play" onClick={togglePlay} aria-label={isPlaying ? "Pause" : "Play"}>
            {isPlaying ? <Pause size={18} fill="#ffffff" /> : <Play size={18} fill="#ffffff" style={{ marginLeft: '2px' }} />}
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
            onChange={(e) => setElapsed(Number(e.target.value))}
          />
          <span>{formatTime(totalDuration)}</span>
        </div>
      </div>

      <div className="player-options">
        <Volume2 size={18} />
        <input
          type="range"
          className="range-slider"
          style={{ width: '100px' }}
          min={0}
          max={100}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
        />
      </div>
    </footer>
  );
}
