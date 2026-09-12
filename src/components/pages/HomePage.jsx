import React from 'react';
import { useAudio } from '../../context/AudioContext';
import { Play, Pause } from 'lucide-react';

const quick = [
  ["Night drives", "linear-gradient(135deg,#2a235e,#ea7c9c)"],
  ["Indie essentials", "linear-gradient(135deg,#f4b076,#d6566e)"],
  ["Soft focus", "linear-gradient(135deg,#86d6cd,#4569a0)"],
  ["Daily mix 01", "linear-gradient(135deg,#6853d9,#f5a8c5)"],
  ["Coffee & chords", "linear-gradient(135deg,#e2bd7e,#987341)"],
  ["Late night jazz", "linear-gradient(135deg,#1c293d,#ba6684)"]
];

const made = [
  ["Daylight", "An easy, uplifting mix", "linear-gradient(135deg,#f8be70,#e37d6c)"],
  ["Alt currents", "The best of alternative now", "linear-gradient(135deg,#1f345e,#59b3c2)"],
  ["Dream pop", "Float through the afternoon", "linear-gradient(135deg,#bb94e8,#ee92b5)"],
  ["Find your flow", "Electronic energy for you", "linear-gradient(135deg,#5dccb7,#2b6799)"],
  ["Soul kitchen", "Warm grooves, all day", "linear-gradient(135deg,#ec896c,#8b3c62)"]
];

const recent = [
  { title: "Velvet Skies", artist: "Luna Vale", art: "linear-gradient(135deg,#df789f,#f8c18e 55%,#493f7d)", duration: 224 },
  { title: "After Hours", artist: "The Violets", art: "linear-gradient(135deg,#2b315c,#a589e8)", duration: 198 },
  { title: "Open Road", artist: "Milo Sun", art: "linear-gradient(135deg,#7bc3c0,#d2e189)", duration: 210 },
  { title: "Gold Dust", artist: "June Harper", art: "linear-gradient(135deg,#e5ae5a,#8e456d)", duration: 240 },
  { title: "Blue Motel", artist: "Neon Coast", art: "linear-gradient(135deg,#315878,#cc6c80)", duration: 205 }
];

export function HomePage() {
  const { isPlaying, togglePlay, playTrack, currentTrack } = useAudio();

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
          <button className="btn-play-hero" onClick={togglePlay}>
            {isPlaying ? (
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
              onClick={() => playTrack({ title: name, artist: "Curated Playlist", art, duration: 210 })}
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
            <h2>Made for you</h2>
            <p>Fresh picks based on your listening.</p>
          </div>
          <button className="contact-link">Show all</button>
        </div>
        <div className="cards-grid">
          {made.map(([title, desc, art], idx) => (
            <article
              key={idx}
              className="card"
              onClick={() => playTrack({ title, artist: desc, art, duration: 200 })}
            >
              <div className="card-cover" style={{ background: art }}>
                <div className="card-play-btn">
                  <Play size={20} fill="#ffffff" style={{ marginLeft: '2px' }} />
                </div>
              </div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-container">
        <div className="section-header">
          <div>
            <h2>Recently played</h2>
            <p>Rediscover what you loved.</p>
          </div>
          <button className="contact-link">Show all</button>
        </div>
        <div className="cards-grid">
          {recent.map((track, idx) => (
            <article
              key={idx}
              className="card"
              onClick={() => playTrack(track)}
            >
              <div className="card-cover" style={{ background: track.art }}>
                <div className="card-play-btn">
                  {isPlaying && currentTrack.title === track.title ? (
                    <Pause size={20} fill="#ffffff" />
                  ) : (
                    <Play size={20} fill="#ffffff" style={{ marginLeft: '2px' }} />
                  )}
                </div>
              </div>
              <h3>{track.title}</h3>
              <p>{track.artist}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
