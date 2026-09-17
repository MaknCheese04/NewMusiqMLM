import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Heart, Volume2, Loader2, Star, CircleOff, ChevronUp, ChevronDown, MessageCircle } from 'lucide-react';

function parseLyrics(lyrics) {
  if (!lyrics?.trim()) return [];
  return lyrics.split(/\r?\n/).filter(Boolean).map((line, index) => {
    const match = line.match(/^\[(\d+):(\d{2})(?:\.(\d+))?\]\s*(.*)$/);
    return match ? { time: Number(match[1]) * 60 + Number(match[2]) + Number(`0.${match[3] || 0}`), text: match[4], index }
      : { time: null, text: line, index };
  });
}

export function Player() {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentSaving, setCommentSaving] = useState(false);
  const [commentError, setCommentError] = useState('');
  const touchStart = useRef(null);
  const lyricsListRef = useRef(null);
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
    toggleLike,
    getTrackKey
  } = useAudio();
  const trackKey = getTrackKey(currentTrack);
  const lyricLines = useMemo(() => parseLyrics(currentTrack.lyrics), [currentTrack.lyrics]);
  const activeLyric = lyricLines.reduce((active, line, index) => line.time !== null && line.time <= elapsed ? index : active, -1);

  useEffect(() => {
    if (expanded && activeLyric >= 0) {
      lyricsListRef.current?.children[activeLyric]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [activeLyric, expanded]);

  useEffect(() => { setComment(''); }, [trackKey]);

  useEffect(() => {
    if (!expanded || !user?.id) return;
    let active = true;
    setComments([]);
    setCommentsLoading(true);
    setCommentError('');
    supabase.from('song_comments').select('comment_id, user_id, body, created_at')
      .eq('track_key', trackKey).order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        setCommentsLoading(false);
        if (error) setCommentError('Could not load comments.');
        else setComments(data || []);
      });
    return () => { active = false; };
  }, [expanded, trackKey, user?.id]);

  const postComment = async (event) => {
    event.preventDefault();
    const body = comment.trim();
    if (!body || !user?.id || commentSaving) return;
    setCommentSaving(true);
    setCommentError('');
    const { data, error } = await supabase.from('song_comments').insert({
      track_key: trackKey, song_id: trackKey.startsWith('song:') ? currentTrack.id : null,
      user_id: user.id, body
    }).select('comment_id, user_id, body, created_at').single();
    setCommentSaving(false);
    if (error) setCommentError('Could not post your comment. Please try again.');
    else { setComments(previous => [data, ...previous]); setComment(''); }
  };

  const onTouchEnd = (event) => {
    if (touchStart.current === null) return;
    const distance = event.changedTouches[0].clientY - touchStart.current;
    if (distance < -50) setExpanded(true);
    if (distance > 50) setExpanded(false);
    touchStart.current = null;
  };

  const formatTime = (sec) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isLiked = savedSongs.some(s => s.title === currentTrack.title);
  const totalDuration = duration || 224;

  return (
    <>
    {expanded && <div className="player-panel-backdrop" onClick={() => setExpanded(false)} aria-hidden="true" />}
    <div className={`player-surface ${expanded ? 'open' : ''}`}>
    <section className={`player-panel ${expanded ? 'open' : ''}`} aria-label="Now playing details" aria-hidden={!expanded}>
      <div className="player-panel-header">
        <div><span className="eyebrow">NOW PLAYING</span><h2>{currentTrack.title}</h2><p>{currentTrack.artist}</p></div>
        <button type="button" onClick={() => setExpanded(false)} aria-label="Close song details"><ChevronDown size={24} /></button>
      </div>
      <div className="player-panel-columns">
        <section className="player-detail-column" aria-label="Song comments">
          <h3><MessageCircle size={19} /> Comments <span>{comments.length}</span></h3>
          <form className="comment-form" onSubmit={postComment}>
            <label htmlFor="song-comment">Join the conversation</label>
            <textarea id="song-comment" value={comment} onChange={event => setComment(event.target.value)} maxLength={500} placeholder="What do you think of this song?" />
            <button type="submit" disabled={!comment.trim() || commentSaving}>{commentSaving ? 'Posting…' : 'Post comment'}</button>
          </form>
          {commentError && <p className="player-detail-error" role="alert">{commentError}</p>}
          <div className="comments-list" aria-live="polite">
            {commentsLoading ? <p className="player-detail-empty">Loading comments…</p> : comments.length ? comments.map(item => (
              <article className="song-comment" key={item.comment_id}>
                <div><strong>{item.user_id === user?.id ? 'You' : 'Listener'}</strong><time dateTime={item.created_at}>{new Date(item.created_at).toLocaleDateString()}</time></div>
                <p>{item.body}</p>
              </article>
            )) : <p className="player-detail-empty">No comments yet. Be the first to share a thought.</p>}
          </div>
        </section>
        <section className="player-detail-column" aria-label="Song lyrics">
          <h3>Lyrics</h3>
          <div className="lyrics-list" ref={lyricsListRef}>
            {lyricLines.length ? lyricLines.map((line, index) => (
              <p key={line.index} className={index === activeLyric ? 'active' : ''}>{line.text || '\u00a0'}</p>
            )) : <p className="player-detail-empty">Lyrics are not available for this song yet.</p>}
          </div>
        </section>
      </div>
    </section>
    <footer className="player-bar" onTouchStart={event => { touchStart.current = event.touches[0].clientY; }} onTouchEnd={onTouchEnd}>
      <button type="button" className="player-expand" onClick={() => setExpanded(value => !value)} aria-label={expanded ? 'Close song details' : 'Slide up for comments and lyrics'} aria-expanded={expanded}><ChevronUp size={18} /><span>Comments & lyrics</span></button>
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
          <span className="song-rating-label" role="status">{currentRating === null ? 'Not rated' : `${currentRating}/5`}</span>
          <div className="song-rating-buttons">
            <button type="button" className={`rating-zero ${currentRating === 0 ? 'selected' : ''}`}
              onClick={() => rateTrack(currentTrack, 0)} disabled={ratingSaving}
              aria-label="Rate 0 out of 5 stars" aria-pressed={currentRating === 0}><CircleOff size={17} /></button>
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
    </div>
    </>
  );
}
