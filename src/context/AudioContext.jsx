import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const AudioContext = createContext();

const initialTracks = [
  { title: "Velvet Skies", artist: "Luna Vale", art: "linear-gradient(135deg,#df789f,#f8c18e 55%,#493f7d)", duration: 224 },
  { title: "After Hours", artist: "The Violets", art: "linear-gradient(135deg,#2b315c,#a589e8)", duration: 198 },
  { title: "Open Road", artist: "Milo Sun", art: "linear-gradient(135deg,#7bc3c0,#d2e189)", duration: 210 },
  { title: "Gold Dust", artist: "June Harper", art: "linear-gradient(135deg,#e5ae5a,#8e456d)", duration: 240 },
  { title: "Blue Motel", artist: "Neon Coast", art: "linear-gradient(135deg,#315878,#cc6c80)", duration: 205 }
];

export function AudioProvider({ children }) {
  const [currentTrack, setCurrentTrack] = useState(initialTracks[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [volume, setVolume] = useState(70);
  const audioRef = useRef(null);

  const [savedSongs, setSavedSongs] = useState(() => {
    const saved = localStorage.getItem('soundwave-saved-songs');
    return saved ? JSON.parse(saved) : [];
  });

  const [playlists, setPlaylists] = useState(() => {
    const saved = localStorage.getItem('soundwave-playlists');
    return saved ? JSON.parse(saved) : [
      { name: "Night drives", songs: [] },
      { name: "Feel good friday", songs: [] },
      { name: "Focus flow", songs: [] },
      { name: "New discoveries", songs: [] }
    ];
  });

  const [artistReleases, setArtistReleases] = useState([]);

  useEffect(() => {
    localStorage.setItem('soundwave-saved-songs', JSON.stringify(savedSongs));
  }, [savedSongs]);

  useEffect(() => {
    localStorage.setItem('soundwave-playlists', JSON.stringify(playlists));
  }, [playlists]);

  // Audio timer simulation for built-in or HTML5 audio playback
  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setElapsed(prev => (prev + 1) % (currentTrack.duration || 224));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, currentTrack]);

  const togglePlay = () => {
    setIsPlaying(prev => !prev);
  };

  const playTrack = (track) => {
    setCurrentTrack(track);
    setElapsed(0);
    setIsPlaying(true);
  };

  const playNext = () => {
    const currentIndex = initialTracks.findIndex(t => t.title === currentTrack.title);
    const nextIndex = (currentIndex + 1) % initialTracks.length;
    playTrack(initialTracks[nextIndex]);
  };

  const playPrevious = () => {
    const currentIndex = initialTracks.findIndex(t => t.title === currentTrack.title);
    const prevIndex = (currentIndex - 1 + initialTracks.length) % initialTracks.length;
    playTrack(initialTracks[prevIndex]);
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

  const createPlaylist = (name) => {
    if (!name?.trim()) return;
    setPlaylists(prev => [...prev, { name: name.trim(), songs: [] }]);
  };

  const addRelease = (release) => {
    setArtistReleases(prev => [release, ...prev]);
  };

  return (
    <AudioContext.Provider value={{
      currentTrack,
      isPlaying,
      elapsed,
      volume,
      savedSongs,
      playlists,
      artistReleases,
      togglePlay,
      playTrack,
      playNext,
      playPrevious,
      setElapsed,
      setVolume,
      toggleLike,
      createPlaylist,
      addRelease
    }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  return useContext(AudioContext);
}
