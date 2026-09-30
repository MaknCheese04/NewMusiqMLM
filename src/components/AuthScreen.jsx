import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export function AuthScreen() {
  const { login, register } = useAuth();
  const [authMode, setAuthMode] = useState('signin'); // 'signin' or 'register'
  const [role, setRole] = useState('listener'); // 'listener' or 'artist'
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [artistName, setArtistName] = useState('');
  const [hometown, setHometown] = useState('');
  const [address, setAddress] = useState({ street: '', city: '', region: '', postalCode: '', country: '' });
  const [claimArtistId, setClaimArtistId] = useState('');
  const [evidence, setEvidence] = useState('');
  const [artists, setArtists] = useState([]);
  const [artistLoadError, setArtistLoadError] = useState(false);
  useEffect(() => {
    if (authMode !== 'register' || role !== 'artist') return;
    let active = true;
    supabase.from('artists').select('artist_id,name').order('name').then(({ data, error }) => {
      if (active) { setArtists(data || []); setArtistLoadError(Boolean(error)); }
    });
    return () => { active = false; };
  }, [authMode, role]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    setIsSubmitting(true);

    try {
      if (authMode === 'register') {
        const res = await register({ email, password, name, role, artistName, hometown, address, claimArtistId, evidence });
        if (res?.user && !res?.session) {
          setInfoMessage('Account created! Please check your email to confirm your account.');
        }
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isRegistering = authMode === 'register';

  return (
    <section className="auth-screen" aria-label="Account access">
      <div className="auth-panel">
        <a className="brand auth-brand" href="#" aria-label="NewMusiq home">
          <span className="auth-brand-title">NewMusiq
            <svg className="auth-title-wave" viewBox="0 0 460 52" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0 27C23 4 45 49 68 27S113 4 136 27s45 23 68 0 45-23 68 0 45 23 68 0 45-23 68 0 45 23 68 0" />
            </svg>
          </span>
        </a>

        <div className="auth-copy">
          <p className="eyebrow">YOUR MUSIC HOME</p>
          <h1>{isRegistering ? 'Make it yours' : 'yo bro'}</h1>
          <p>
            {isRegistering
              ? role === 'artist'
                ? 'Set up your artist home and share your sound.'
                : 'Build a music home made for your taste.'
              : 'Sign in to continue listening where you left off.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} autoComplete="on">
          {isRegistering && (
            <div className="role-picker">
              <button
                type="button"
                className={role === 'listener' ? 'selected' : ''}
                onClick={() => setRole('listener')}
              >
                I'm here to listen
              </button>
              <button
                type="button"
                className={role === 'artist' ? 'selected' : ''}
                onClick={() => setRole('artist')}
              >
                I'm an artist
              </button>
            </div>
          )}
          {isRegistering && <p className="signup-plan">{role === 'artist'
            ? 'Artist membership: first 3 months free, then $10 USD/month.'
            : 'Listener membership: first month free, then $5 USD/month.'}
            <small> Start your subscription after creating your account. Creating an account does not start a trial or charge you.</small>
          </p>}

          {isRegistering && (
            <label className="auth-label">
              Display name <small>(optional)</small>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={32}
                placeholder="Alex Rivera"
                disabled={isSubmitting}
              />
            </label>
          )}

          <label className="auth-label">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              disabled={isSubmitting}
            />
          </label>

          <label className="auth-label">
            Password
            <input
              type="password"
              minLength={6}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
            />
          </label>

          {isRegistering && role === 'artist' && (
            <>
            <label className="auth-label">
              Artist or band name
              <input
                required
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                maxLength={48}
                placeholder="Stage or band name"
                disabled={isSubmitting}
              />
            </label>
            <label className="auth-label">Connect to an artist page
              <select value={claimArtistId} onChange={event => {
                setClaimArtistId(event.target.value);
                const artist = artists.find(item => String(item.artist_id) === event.target.value);
                if (artist) setArtistName(artist.name);
              }} disabled={isSubmitting}>
                <option value="">Request a new artist page</option>
                {artists.map(artist => <option key={artist.artist_id} value={artist.artist_id}>{artist.name}</option>)}
              </select>
            </label>
            {artistLoadError && <p role="alert">Existing artist pages could not load. Please try again before requesting a new page.</p>}
            <label className="auth-label">Official website or artist profile
              <input type="url" required pattern="https://.*" maxLength={1000} value={evidence}
                onChange={event => setEvidence(event.target.value)} placeholder="https://your-official-artist-page.com" disabled={isSubmitting} />
            </label>
            <p className="onboarding-note">After confirming your email, complete ID verification and a page-ownership review in Artist access. Your page becomes editable after both checks pass.</p>
            {import.meta.env.VITE_ARTIST_IDENTITY_ENABLED !== 'true' && <p className="onboarding-note">ID verification is not active yet. You can create an account and request access now.</p>}
            </>
          )}

          {isRegistering && <>
            <label className="auth-label">Public hometown / place of origin <small>(optional)</small>
              <input value={hometown} onChange={event => setHometown(event.target.value)} maxLength={200}
                placeholder="City, state or region, country" disabled={isSubmitting} />
            </label>
            <details className="private-address"><summary>Add a private mailing address (optional)</summary>
              <p>This address is private and never appears on your artist page or map.</p>
              {Object.entries({street:'Street address',city:'City',region:'State / region',postalCode:'Postal code',country:'Country'}).map(([key,label]) => (
                <label className="auth-label" key={key}>{label}<input value={address[key]} maxLength={200} disabled={isSubmitting}
                  autoComplete={{street:'street-address',city:'address-level2',region:'address-level1',postalCode:'postal-code',country:'country-name'}[key]}
                  onChange={event => setAddress(previous => ({...previous,[key]:event.target.value}))} /></label>
              ))}
            </details>
          </>}

          <button className="auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? 'Please wait…'
              : isRegistering
                ? 'Create account'
                : 'Sign in'}
          </button>

          <p className="auth-switch">
            {isRegistering ? 'Already have an account?' : 'New to NewMusiq?'}{' '}
            <button
              type="button"
              onClick={() => {
                setAuthMode(isRegistering ? 'signin' : 'register');
                setError('');
                setInfoMessage('');
              }}
            >
              {isRegistering ? 'Sign in' : 'Create an account'}
            </button>
          </p>

          {infoMessage && <p style={{ color: '#4d9b78', textAlign: 'center', fontSize: '13px', marginTop: '12px' }}>{infoMessage}</p>}
          {error && <p className="auth-error">{error}</p>}
        </form>
      </div>

      <div className="auth-art">
        <div className="auth-vinyl gold"><span>GOLD</span></div>
        <div className="auth-vinyl platinum"><span>PLATINUM</span></div>
        <div className="auth-vinyl diamond"><span>DIAMOND</span></div>
        <p>
              New Music Everyday
        </p>
      </div>
    </section>
  );
}
