import React from 'react';
import { useAudio } from '../../context/AudioContext';
import { Play, Pause, Loader2, Star } from 'lucide-react';

const quick = [
  ["Night drives", "linear-gradient(135deg,#2a235e,#ea7c9c)"],
  ["Indie essentials", "linear-gradient(135deg,#f4b076,#d6566e)"],
  ["Soft focus", "linear-gradient(135deg,#86d6cd,#4569a0)"],
  ["Daily mix 01", "linear-gradient(135deg,#6853d9,#f5a8c5)"],
  ["Coffee & chords", "linear-gradient(135deg,#e2bd7e,#987341)"],
  ["Late night jazz", "linear-gradient(135deg,#1c293d,#ba6684)"]
];

export function HomePage() {
  const {
    isPlaying, isRetrieving, retrievalStatus, togglePlay, playTrack, currentTrack,
    supabaseSongs, supabaseAlbums, isLoadingData, albumRatings, albumRatingTotals,
    albumRatingSaving, albumRatingError, getAlbumKey, rateAlbum
  } = useAudio();

  const displaySongs = supabaseSongs.length ? supabaseSongs : [
    { id: 1, title: "Let's Groove", artist: "Earth, Wind & Fire", album: "Raise!", art: "linear-gradient(135deg,#f8be70,#e37d6c)", duration: 224 },
    { id: 3, title: "Velvet Skies", artist: "Luna Vale", album: "Velvet Skies EP", art: "linear-gradient(135deg,#df789f,#f8c18e 55%,#493f7d)", duration: 224 },
    { id: 4, title: "After Hours", artist: "The Violets", album: "After Hours", art: "linear-gradient(135deg,#2b315c,#a589e8)", duration: 198 }
  ];
  const displayAlbums = supabaseAlbums.length
    ? supabaseAlbums.map((album, index) => ({ ...album, art: displaySongs[index % displaySongs.length]?.art }))
    : [...new Map(displaySongs.map(track => [
        `${track.album}:${track.artist}`,
        { name: track.album, artist: track.artist, art: track.art }
      ])).values()];

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">GOOD AFTERNOON</p>
          <h1>
            Find your next<br />
            <em>favorite sound.</em>
          </h1>
          <p className="subhead">Music that moves with your moment.</p>
          <button className="btn-play-hero" onClick={togglePlay} disabled={isRetrieving}>
            {isRetrieving ? (
              <>
                <Loader2 className="animate-spin" size={18} color="#ffffff" /> Retrieving MP3...
              </>
            ) : isPlaying ? (
              <>
                <Pause size={18} fill="#ffffff" /> Pause
              </>
            ) : (
              <>
                <Play size={18} fill="#ffffff" /> Play something
              </>
            )}
          </button>
        </div>
      </section>

      <section className="section-container">
        <div className="section-header">
          <h2>Jump back in</h2>
        </div>
        <div className="quick-grid">
          {quick.map(([name, art], idx) => (
            <button
              key={idx}
              className="quick-card"
              onClick={() => playTrack({ id: idx + 1, title: name, artist: "Curated Playlist", album: "Playlist", art, duration: 210 })}
            >
              <div className="quick-art" style={{ background: art }}></div>
              <span>{name}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="section-container">
        <div className="section-header">
          <div>
            <h2>Songs from Supabase Storage & Database</h2>
            <p>{retrievalStatus || (isLoadingData ? 'Loading relational schema...' : 'Click play to download & stream from Supabase Storage bucket "songs" (<song_id>.mp3)')}</p>
          </div>
          <button className="contact-link">Show all</button>
        </div>
        <div className="cards-grid">
          {displaySongs.map((track, idx) => {
            const isSelected = currentTrack.id === track.id || currentTrack.title === track.title;
            const isCurrentlyRetrieving = isRetrieving && isSelected;

            return (
              <article
                key={track.id || idx}
                className="card"
                onClick={() => playTrack(track)}
              >
                <div className="card-cover" style={{ background: track.art }}>
                  <div className="card-play-btn" style={{ opacity: isCurrentlyRetrieving ? 1 : undefined, transform: isCurrentlyRetrieving ? 'translateY(0)' : undefined }}>
                    {isCurrentlyRetrieving ? (
                      <Loader2 className="animate-spin" size={20} color="#ffffff" />
                    ) : isPlaying && isSelected ? (
                      <Pause size={20} fill="#ffffff" />
                    ) : (
                      <Play size={20} fill="#ffffff" style={{ marginLeft: '2px' }} />
                    )}
                  </div>
                </div>
                <h3>{track.title}</h3>
                <p>{track.artist} · <em>{track.album}</em></p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section-container">
        <div className="section-header">
          <div>
            <h2>Albums</h2>
            <p>Rate a whole album and see what listeners think.</p>
            {albumRatingError && <p className="album-rating-error" role="alert">{albumRatingError}</p>}
          </div>
        </div>
        <div className="cards-grid">
          {displayAlbums.map(album => {
            const albumKey = getAlbumKey(album);
            const yourRating = albumRatings[albumKey] ?? null;
            const totals = albumRatingTotals[albumKey];
            const isSaving = albumRatingSaving === albumKey;
            return (
              <article className="card album-card" key={albumKey}>
                <div className="card-cover" style={{ background: album.art }} />
                <h3>{album.name}</h3>
                <p>{album.artist || 'Album'}</p>
                <div className="album-rating-controls" aria-label={`Rate ${album.name} from 0 to 5 stars`}>
                  <button type="button" className={yourRating === 0 ? 'selected' : ''}
                    onClick={() => rateAlbum(album, 0)} disabled={Boolean(albumRatingSaving)}
                    aria-label={`Rate ${album.name} 0 out of 5 stars`} aria-pressed={yourRating === 0}>0</button>
                  {[1, 2, 3, 4, 5].map(stars => (
                    <button type="button" key={stars} onClick={() => rateAlbum(album, stars)}
                      disabled={Boolean(albumRatingSaving)} aria-label={`Rate ${album.name} ${stars} out of 5 stars`}
                      aria-pressed={yourRating === stars}>
                      <Star size={19} fill={yourRating !== null && stars <= yourRating ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
                <p className="album-rating-summary">
                  {isSaving ? 'Saving…' : yourRating === null ? 'Rate to see the listener average' :
                    totals?.rating_count ? `Your rating: ${yourRating}/5 · Average: ${(totals.rating_sum / totals.rating_count).toFixed(1)}/5 (${totals.rating_count} ${totals.rating_count === 1 ? 'listener' : 'listeners'})`
                      : `Your rating: ${yourRating}/5 · Loading average…`}
                </p>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
