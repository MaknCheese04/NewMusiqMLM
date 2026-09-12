import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { safeStorage } from '../lib/safeStorage';
import { useAuth } from './AuthContext';

const AudioContext = createContext();

const defaultArts = [
  "linear-gradient(135deg,#df789f,#f8c18e 55%,#493f7d)",
  "linear-gradient(135deg,#2b315c,#a589e8)",
  "linear-gradient(135deg,#7bc3c0,#d2e189)",
  "linear-gradient(135deg,#e5ae5a,#8e456d)",
  "linear-gradient(135deg,#315878,#cc6c80)",
  "linear-gradient(135deg,#f8be70,#e37d6c)"
];

export function AudioProvider({ children }) {
  const { user } = useAuth();
  const [supabaseSongs, setSupabaseSongs] = useState([]);
  const [supabaseArtists, setSupabaseArtists] = useState([]);
  const [supabaseAlbums, setSupabaseAlbums] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [currentTrack, setCurrentTrack] = useState({
    id: 1,
    title: "Let's Groove",
    artist: "Earth, Wind & Fire",
    album: "Raise!",
    art: defaultArts[0],
    duration: 224
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [isRetrieving, setIsRetrieving] = useState(false);
  const [retrievalStatus, setRetrievalStatus] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(224);
  const [volume, setVolume] = useState(70);

  const audioRef = useRef(new Audio());
  const activeBlobUrlRef = useRef(null);

  const [savedSongs, setSavedSongs] = useState(() => {
    const saved = safeStorage.getItem('soundwave-saved-songs');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [artistReleases, setArtistReleases] = useState([]);
  const [songRatings, setSongRatings] = useState({});
  const [ratingSaving, setRatingSaving] = useState(false);
  const [ratingError, setRatingError] = useState('');
  const [albumRatings, setAlbumRatings] = useState({});
  const [albumRatingTotals, setAlbumRatingTotals] = useState({});
  const [albumRatingSaving, setAlbumRatingSaving] = useState(null);
  const [albumRatingError, setAlbumRatingError] = useState('');

  const getAlbumKey = (album) => album.album_id != null
    ? `album:${album.album_id}`
    : `demo-album:${album.name}:${album.artist || ''}`;

  useEffect(() => {
    if (!user?.id) {
      setAlbumRatings({});
      setAlbumRatingTotals({});
      return;
    }

    let active = true;
    async function loadAlbumRatings() {
      const [own, totals] = await Promise.all([
        supabase.from('album_ratings').select('album_key, rating').eq('user_id', user.id),
        supabase.from('album_rating_totals').select('album_key, rating_count, rating_sum')
      ]);
      if (!active) return;
      if (own.error || totals.error) {
        setAlbumRatingError('Could not load album ratings.');
        return;
      }
      setAlbumRatings(Object.fromEntries((own.data || []).map(row => [row.album_key, row.rating])));
      setAlbumRatingTotals(Object.fromEntries((totals.data || []).map(row => [row.album_key, row])));
    }
    loadAlbumRatings();
    return () => { active = false; };
  }, [user?.id]);

  const rateAlbum = async (album, rating) => {
    if (!user?.id || !Number.isInteger(rating) || rating < 0 || rating > 5 || albumRatingSaving) return;
    const albumKey = getAlbumKey(album);
    const previousRating = albumRatings[albumKey];
    setAlbumRatingError('');
    setAlbumRatingSaving(albumKey);
    setAlbumRatings(prev => ({ ...prev, [albumKey]: rating }));

    const { error } = await supabase.from('album_ratings').upsert({
      user_id: user.id,
      album_key: albumKey,
      album_id: album.album_id ?? null,
      rating,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,album_key' });

    if (error) {
      setAlbumRatings(prev => {
        const next = { ...prev };
        if (previousRating === undefined) delete next[albumKey];
        else next[albumKey] = previousRating;
        return next;
      });
      setAlbumRatingError('Could not save your album rating. Please try again.');
    } else {
      const { data, error: totalsError } = await supabase.from('album_rating_totals')
        .select('album_key, rating_count, rating_sum').eq('album_key', albumKey).single();
      if (totalsError) setAlbumRatingError('Rating saved, but the average could not be loaded.');
      else setAlbumRatingTotals(prev => ({ ...prev, [albumKey]: data }));
    }
    setAlbumRatingSaving(null);
  };

  const getTrackKey = (track) => {
    const catalogSong = supabaseSongs.some(song => song.id === track.id && song.title === track.title);
    return catalogSong ? `song:${track.id}` : `demo:${track.title}:${track.artist}`;
  };

  useEffect(() => {
    if (!user?.id) {
      setSongRatings({});
      return;
    }

    let active = true;
    supabase.from('song_ratings').select('track_key, rating').eq('user_id', user.id)
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          setRatingError('Could not load your ratings.');
          return;
        }
        setSongRatings(Object.fromEntries((data || []).map(row => [row.track_key, row.rating])));
      });

    return () => { active = false; };
  }, [user?.id]);

  const rateTrack = async (track, rating) => {
    if (!user?.id || !Number.isInteger(rating) || rating < 0 || rating > 5 || ratingSaving) return;
    const trackKey = getTrackKey(track);
    const previousRating = songRatings[trackKey];
    const songId = trackKey.startsWith('song:') ? track.id : null;

    setRatingError('');
    setRatingSaving(true);
    setSongRatings(prev => ({ ...prev, [trackKey]: rating }));

    const { error } = await supabase.from('song_ratings').upsert({
      user_id: user.id,
      track_key: trackKey,
      song_id: songId,
      rating,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,track_key' });

    if (error) {
      setSongRatings(prev => {
        const next = { ...prev };
        if (previousRating === undefined) delete next[trackKey];
        else next[trackKey] = previousRating;
        return next;
      });
      setRatingError('Could not save your rating. Please try again.');
    }
    setRatingSaving(false);
  };

  // Fetch initial relational data dynamically from Supabase database tables
  useEffect(() => {
    async function fetchSupabaseData() {
      setIsLoadingData(true);
      try {
        const { data: songsData, error: songsErr } = await supabase
          .from('songs')
          .select(`
            song_id,
            name,
            created_at,
            song_artists (
              artists ( artist_id, name )
            ),
            album_songs (
              albums ( album_id, name )
            )
          `);

        if (!songsErr && songsData?.length) {
          const formattedSongs = songsData.map((s, idx) => {
            const artistName = s.song_artists?.[0]?.artists?.name || "Independent Artist";
            const albumName = s.album_songs?.[0]?.albums?.name || "Single";
            return {
              id: s.song_id,
              title: s.name,
              artist: artistName,
              album: albumName,
              art: defaultArts[idx % defaultArts.length],
              duration: 210 + (idx * 12) % 60
            };
          });
          setSupabaseSongs(formattedSongs);
          if (formattedSongs.length > 0) {
            setCurrentTrack(formattedSongs[0]);
          }
        }

        const { data: artistsData } = await supabase.from('artists').select('*');
        if (artistsData?.length) setSupabaseArtists(artistsData);

        const { data: albumsData } = await supabase.from('albums').select('*');
        if (albumsData?.length) setSupabaseAlbums(albumsData);

        const { data: playlistsData } = await supabase.from('playlists').select('*');
        if (playlistsData?.length) {
          setPlaylists(playlistsData.map(p => ({ name: p.name, id: p.playlist_id })));
        } else {
          setPlaylists([
            { name: "Night drives" },
            { name: "Feel good friday" },
            { name: "Focus flow" },
            { name: "New discoveries" }
          ]);
        }
      } catch (err) {
        console.warn('Error querying Supabase tables:', err);
      } finally {
        setIsLoadingData(false);
      }
    }

    fetchSupabaseData();
  }, []);

  // HTML5 audio event handlers
  useEffect(() => {
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setElapsed(Math.floor(audio.currentTime));
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(Math.floor(audio.duration));
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      playNext();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [supabaseSongs, currentTrack]);

  // Volume sync
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Retrieve audio file from Supabase Storage bucket "songs" by `<song_id>.mp3`
  const retrieveAndPlay = async (track) => {
    const songId = track.id || 1;
    const fileName = `${songId}.mp3`;
    
    setIsRetrieving(true);
    setRetrievalStatus(`Downloading ${fileName} from Supabase Storage bucket "songs"...`);
    setIsPlaying(false);

    try {
      // If track has a direct Blob URL (e.g. from session upload), use it directly
      let audioUrl = track.url || null;

      if (!audioUrl) {
        // 1. Download file from Supabase Storage bucket 'songs'
        const { data: fileBlob, error: downloadErr } = await supabase
          .storage
          .from('songs')
          .download(fileName);

        if (downloadErr || !fileBlob) {
          console.warn(`File ${fileName} not found in Supabase storage bucket 'songs'. Creating fallback audio stream.`);
          // Create synthetic audio fallback stream if file is missing in storage bucket
          audioUrl = createSyntheticAudioUrl();
        } else {
          // 2. Retrieval fully complete! Revoke previous blob URL if needed and create new Object URL
          if (activeBlobUrlRef.current) {
            URL.revokeObjectURL(activeBlobUrlRef.current);
          }
          audioUrl = URL.createObjectURL(fileBlob);
          activeBlobUrlRef.current = audioUrl;
        }
      }

      setRetrievalStatus(`Retrieval complete for ${fileName}. Loading audio buffer...`);

      // 3. Set audio element source and wait for full buffer ready
      const audio = audioRef.current;
      audio.src = audioUrl;
      
      await new Promise((resolve) => {
        const onCanPlay = () => {
          audio.removeEventListener('canplaythrough', onCanPlay);
          audio.removeEventListener('error', onCanPlay);
          resolve();
        };
        audio.addEventListener('canplaythrough', onCanPlay);
        audio.addEventListener('error', onCanPlay);
        audio.load();
      });

      // 4. Play song automatically after retrieval & buffering is 100% complete
      await audio.play();
      setIsPlaying(true);
      setRetrievalStatus('');
    } catch (err) {
      console.error('Error during audio retrieval & playback:', err);
      setRetrievalStatus('Failed to play audio file.');
    } finally {
      setIsRetrieving(false);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (audioRef.current.src) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => retrieveAndPlay(currentTrack));
      } else {
        retrieveAndPlay(currentTrack);
      }
    }
  };

  const playTrack = (track) => {
    setCurrentTrack(track);
    setElapsed(0);
    retrieveAndPlay(track);
  };

  const playNext = () => {
    if (!supabaseSongs.length) return;
    const currentIndex = supabaseSongs.findIndex(t => t.id === currentTrack.id || t.title === currentTrack.title);
    const nextIndex = (currentIndex + 1) % supabaseSongs.length;
    playTrack(supabaseSongs[nextIndex]);
  };

  const playPrevious = () => {
    if (!supabaseSongs.length) return;
    const currentIndex = supabaseSongs.findIndex(t => t.id === currentTrack.id || t.title === currentTrack.title);
    const prevIndex = (currentIndex - 1 + supabaseSongs.length) % supabaseSongs.length;
    playTrack(supabaseSongs[prevIndex]);
  };

  const handleSeek = (newTime) => {
    setElapsed(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const toggleLike = (track) => {
    const target = track || currentTrack;
    setSavedSongs(prev => {
      const exists = prev.some(s => s.title === target.title);
      if (exists) {
        return prev.filter(s => s.title !== target.title);
      } else {
        return [...prev, { title: target.title, artist: target.artist }];
      }
    });
  };

  const createPlaylist = async (name) => {
    if (!name?.trim()) return;
    const playlistName = name.trim();
    setPlaylists(prev => [...prev, { name: playlistName }]);

    try {
      await supabase.from('playlists').insert([{ name: playlistName }]);
    } catch (e) {
      console.warn('Error inserting playlist into Supabase:', e);
    }
  };

  const addRelease = async (release) => {
    setArtistReleases(prev => [release, ...prev]);
    setSupabaseSongs(prev => [release, ...prev]);

    try {
      const { data: newSong } = await supabase.from('songs').insert([{ name: release.title }]).select();
      const songId = newSong?.[0]?.song_id;

      const { data: newAlbum } = await supabase.from('albums').insert([{ name: release.album || 'Single' }]).select();
      const albumId = newAlbum?.[0]?.album_id;

      if (songId && albumId) {
        await supabase.from('album_songs').insert([{ song_id: songId, album_id: albumId }]);
      }

      const { data: artistData } = await supabase.from('artists').insert([{ name: release.artist }]).select();
      const artistId = artistData?.[0]?.artist_id;
      if (songId && artistId) {
        await supabase.from('song_artists').insert([{ song_id: songId, artist_id: artistId }]);
      }
    } catch (e) {
      console.warn('Error inserting release into Supabase:', e);
    }
  };

  return (
    <AudioContext.Provider value={{
      currentTrack,
      supabaseSongs,
      supabaseArtists,
      supabaseAlbums,
      isLoadingData,
      isPlaying,
      isRetrieving,
      retrievalStatus,
      elapsed,
      duration,
      volume,
      savedSongs,
      playlists,
      artistReleases,
      currentRating: songRatings[getTrackKey(currentTrack)] ?? null,
      ratingSaving,
      ratingError,
      rateTrack,
      albumRatings,
      albumRatingTotals,
      albumRatingSaving,
      albumRatingError,
      getAlbumKey,
      rateAlbum,
      togglePlay,
      playTrack,
      playNext,
      playPrevious,
      handleSeek,
      setVolume,
      toggleLike,
      createPlaylist,
      addRelease
    }}>
      {children}
    </AudioContext.Provider>
  );
}

// Helper: Generates a smooth audio tone buffer for synthetic fallback
function createSyntheticAudioUrl() {
  const sampleRate = 44100;
  const numChannels = 1;
  const numSamples = sampleRate * 12; // 12 seconds preview
  const buffer = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const freq = 220 + Math.sin(t * 2) * 40;
    buffer[i] = Math.sin(2 * Math.PI * freq * t) * 0.15;
  }

  const wavBuffer = createWavBuffer(buffer, sampleRate, numChannels);
  const blob = new Blob([wavBuffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

function createWavBuffer(samples, sampleRate, numChannels) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    offset += 2;
  }

  return buffer;
}

export function useAudio() {
  return useContext(AudioContext);
}
