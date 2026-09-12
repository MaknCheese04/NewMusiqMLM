import React, { useEffect, useState } from 'react';
import { ArrowLeft, Play, Star, Disc3 } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import { supabase } from '../../lib/supabase';
import { getArtistColors, getArtistProfile } from '../../data/artistProfiles';

function ArtistArtwork({ name, colors, variant, imageUrl }) {
  const initials = name.split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div className={`artist-artwork artist-artwork-${variant}`}
      style={{ '--art-dark': colors[0], '--art-mid': colors[1], '--art-light': colors[2] }}>
      {imageUrl ? <img src={imageUrl} alt={`${name} artwork`} /> : (
        <>
          <span className="artist-artwork-orbit" aria-hidden="true" />
          <span className="artist-artwork-initials" aria-hidden="true">{initials}</span>
          <span className="artist-artwork-caption">{name}</span>
        </>
      )}
    </div>
  );
}

function SongList({ songs, totals, getTrackKey, playTrack, mode }) {
  return (
    <ol className="artist-song-list">
      {songs.length ? songs.map((song, index) => {
        const key = getTrackKey(song);
        const rating = totals[key];
        return (
          <li key={key}>
            <span className="artist-song-rank">{String(index + 1).padStart(2, '0')}</span>
            <button type="button" onClick={() => playTrack(song)} aria-label={`Play ${song.title}`}>
              <span className="artist-song-play"><Play size={15} fill="currentColor" /></span>
              <span className="artist-song-name">{song.title}<small>{song.album || 'Single'}</small></span>
            </button>
            <span className="artist-song-stat">
              {mode === 'rated'
                ? rating?.rating_count ? `${(rating.rating_sum / rating.rating_count).toFixed(1)} ★` : 'New'
                : `${Number(rating || 0).toLocaleString()} plays`}
            </span>
          </li>
        );
      }) : <li className="artist-list-empty">Songs will appear here when they are released.</li>}
    </ol>
  );
}

export function ArtistPage({ artistName, onBack }) {
  const {
    supabaseArtists, supabaseSongs, supabaseAlbums, songRatingTotals, songStreamTotals,
    albumRatingTotals, getTrackKey, getAlbumKey, playTrack
  } = useAudio();
  const [albumLinks, setAlbumLinks] = useState([]);
  const [selectedAlbumKey, setSelectedAlbumKey] = useState(null);

  const artist = supabaseArtists.find(item => item.name.toLowerCase() === artistName.toLowerCase());
  const profile = getArtistProfile(artistName);
  const colors = getArtistColors(artistName, profile);
  const tagline = artist?.tagline || profile?.tagline || 'A story told through sound.';
  const career = artist?.career || profile?.career;
  const personality = artist?.personality || profile?.personality;

  useEffect(() => {
    setSelectedAlbumKey(null);
    if (!artist?.artist_id) {
      setAlbumLinks([]);
      return;
    }
    let active = true;
    supabase.from('album_artists')
      .select('appearance, albums(album_id, name, release_year, cover_url)')
      .eq('artist_id', artist.artist_id)
      .then(({ data, error }) => {
        if (active) setAlbumLinks(error ? [] : (data || []));
      });
    return () => { active = false; };
  }, [artist?.artist_id, artistName]);

  const catalogSongs = supabaseSongs.filter(song => artist?.artist_id
    ? song.artistIds?.includes(artist.artist_id)
    : song.artist.toLowerCase() === artistName.toLowerCase());

  const songs = catalogSongs.length || artist ? catalogSongs : (profile?.songs || []).map((title, index) => ({
    title,
    artist: artistName,
    album: profile.albums[Math.min(Math.floor(index / 2), profile.albums.length - 1)][0],
    art: `linear-gradient(135deg, ${colors[0]}, ${colors[1]}, ${colors[2]})`,
    duration: 210
  }));

  const ratedSongs = [...songs].sort((a, b) => {
    const aTotal = songRatingTotals[getTrackKey(a)];
    const bTotal = songRatingTotals[getTrackKey(b)];
    const aScore = aTotal?.rating_count ? aTotal.rating_sum / aTotal.rating_count : -1;
    const bScore = bTotal?.rating_count ? bTotal.rating_sum / bTotal.rating_count : -1;
    return bScore - aScore || a.title.localeCompare(b.title);
  }).slice(0, 5);

  const streamedSongs = [...songs].sort((a, b) =>
    Number(songStreamTotals[getTrackKey(b)] || 0) - Number(songStreamTotals[getTrackKey(a)] || 0)
      || a.title.localeCompare(b.title)
  ).slice(0, 5);

  const linkedAlbums = albumLinks.filter(link => link.albums).map(link => ({
    ...link.albums,
    artist: artistName,
    appearance: link.appearance
  }));
  const inferredAlbums = [...new Map(catalogSongs
    .filter(song => song.albumId)
    .map(song => [song.albumId, {
      ...supabaseAlbums.find(album => album.album_id === song.albumId),
      album_id: song.albumId,
      name: song.album,
      release_year: song.releaseYear,
      artist: artistName,
      appearance: 'primary'
    }])).values()];
  const demoAlbums = (profile?.albums || []).map(([name, year]) => ({ name, release_year: year, artist: artistName, appearance: 'primary' }));
  const demoFeatures = (profile?.featuredAlbums || []).map(([name, mainArtist, year]) => ({ name, release_year: year, artist: mainArtist, appearance: 'featured' }));
  const primaryLinkedAlbums = linkedAlbums.filter(album => album.appearance === 'primary');
  const primaryAlbums = (primaryLinkedAlbums.length ? primaryLinkedAlbums
    : inferredAlbums.length ? inferredAlbums : artist ? [] : demoAlbums).sort((a, b) => {
    const aTotal = albumRatingTotals[getAlbumKey(a)];
    const bTotal = albumRatingTotals[getAlbumKey(b)];
    const aScore = aTotal?.rating_count ? aTotal.rating_sum / aTotal.rating_count : -1;
    const bScore = bTotal?.rating_count ? bTotal.rating_sum / bTotal.rating_count : -1;
    return bScore - aScore || (b.release_year || 0) - (a.release_year || 0);
  });
  const featuredAlbums = artist ? linkedAlbums.filter(album => album.appearance === 'featured') : demoFeatures;
  const allAlbums = [...primaryAlbums, ...featuredAlbums];
  const selectedAlbum = allAlbums.find(album => getAlbumKey(album) === selectedAlbumKey);
  const selectedSongs = selectedAlbum ? songs.filter(song =>
    selectedAlbum.album_id ? song.albumId === selectedAlbum.album_id : song.album === selectedAlbum.name
  ) : [];

  const cover = (album) => album.cover_url ? `url("${album.cover_url}")` :
    `linear-gradient(145deg, ${colors[0]}, ${colors[1]} 58%, ${colors[2]})`;

  return (
    <div className="artist-page" style={{ '--artist-dark': colors[0], '--artist-mid': colors[1], '--artist-light': colors[2] }}>
      <button className="artist-back" type="button" onClick={onBack}><ArrowLeft size={16} /> Back to music</button>
      <header className="artist-page-hero">
        <p className="eyebrow">ARTIST / SOUNDWAVE</p>
        <h1>{artistName}</h1>
        <p className="artist-tagline">{tagline}</p>
        <div className="artist-story">
          <p>{career || 'This artist’s career story is coming soon.'}</p>
          <p>{personality || 'More about the person behind the music is coming soon.'}</p>
        </div>
      </header>

      <section className="artist-feature artist-feature-rated" aria-labelledby="artist-top-rated">
        <div className="artist-feature-copy">
          <p className="eyebrow">THE LISTENERS’ CHOICE</p>
          <h2 id="artist-top-rated">Top 5 rated songs</h2>
          <SongList songs={ratedSongs} totals={songRatingTotals} getTrackKey={getTrackKey} playTrack={playTrack} mode="rated" />
        </div>
        <ArtistArtwork name={artistName} colors={colors} variant="portrait" imageUrl={artist?.portrait_url} />
      </section>

      <section className="artist-feature artist-feature-streamed" aria-labelledby="artist-top-streamed">
        <ArtistArtwork name={artistName} colors={colors} variant="studio" imageUrl={artist?.artwork_url} />
        <div className="artist-feature-copy">
          <p className="eyebrow">ON REPEAT</p>
          <h2 id="artist-top-streamed">Top 5 most streamed songs</h2>
          <SongList songs={streamedSongs} totals={songStreamTotals} getTrackKey={getTrackKey} playTrack={playTrack} mode="streamed" />
        </div>
      </section>

      <section className="artist-albums" aria-labelledby="artist-albums-heading">
        <p className="eyebrow">THE DISCOGRAPHY</p>
        <h2 id="artist-albums-heading">Albums</h2>
        <p>Ordered by listener rating, highest first.</p>
        <div className="artist-album-grid">
          {primaryAlbums.length ? primaryAlbums.map(album => {
            const total = albumRatingTotals[getAlbumKey(album)];
            return (
              <button className={`artist-album ${selectedAlbumKey === getAlbumKey(album) ? 'selected' : ''}`}
                type="button" key={getAlbumKey(album)} onClick={() => setSelectedAlbumKey(getAlbumKey(album))}>
                <span className="artist-album-cover" style={{ background: cover(album) }}><Disc3 size={32} /></span>
                <strong>{album.name}</strong>
                <span>{album.release_year || 'Year TBA'}</span>
                <small>{total?.rating_count ? <><Star size={12} fill="currentColor" /> {(total.rating_sum / total.rating_count).toFixed(1)}/5</> : 'Not rated yet'}</small>
              </button>
            );
          }) : <p>No albums listed yet.</p>}
        </div>
      </section>

      <section className="artist-albums artist-features" aria-labelledby="artist-features-heading">
        <p className="eyebrow">APPEARANCES</p>
        <h2 id="artist-features-heading">Featured on</h2>
        <div className="artist-album-grid">
          {featuredAlbums.length ? featuredAlbums.map(album => (
            <button className={`artist-album ${selectedAlbumKey === getAlbumKey(album) ? 'selected' : ''}`}
              type="button" key={getAlbumKey(album)} onClick={() => setSelectedAlbumKey(getAlbumKey(album))}>
              <span className="artist-album-cover" style={{ background: cover(album) }}><Disc3 size={32} /></span>
              <strong>{album.name}</strong>
              <span>{album.artist} · {album.release_year || 'Year TBA'}</span>
            </button>
          )) : <p>No featured albums listed yet.</p>}
        </div>
      </section>
      {selectedAlbum && (
        <section className="artist-album-detail" aria-label={`${selectedAlbum.name} tracks`}>
          <div><p className="eyebrow">SELECTED ALBUM</p><h3>{selectedAlbum.name}</h3><p>{selectedAlbum.release_year || 'Release year to be announced'}</p></div>
          <div className="artist-album-tracks">
            {selectedSongs.length ? selectedSongs.map(song => (
              <button type="button" key={getTrackKey(song)} onClick={() => playTrack(song)}><Play size={14} /> {song.title}</button>
            )) : <p>Tracks for this album have not been listed yet.</p>}
          </div>
        </section>
      )}
    </div>
  );
}
