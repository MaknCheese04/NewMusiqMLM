import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../../src/styles/index.css';

export function AuthScreen() {
  const { login, register } = useAuth();
  const [authMode, setAuthMode] = useState('signin'); // 'signin' or 'register'
  const [role, setRole] = useState('listener'); // 'listener' or 'artist'
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [artistName, setArtistName] = useState('');
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
        const res = await register({ email, password, name, role, artistName });
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
        <a className="brand" href="#">
          <span className="brand-mark">◒</span>
          <span>soundwave</span>
        </a>

        <div className="auth-copy">
          <p className="eyebrow">YOUR MUSIC HOME</p>
          <h1>{isRegistering ? 'Make it yours' : 'Welcome back'}</h1>
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
            <label className="auth-label">
              Artist name <small>(optional)</small>
              <input
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                maxLength={48}
                placeholder="Stage or band name"
                disabled={isSubmitting}
              />
            </label>
          )}

          <button className="auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? 'Connecting to Supabase...'
              : isRegistering
                ? 'Create account'
                : 'Sign in'}
          </button>

          <p className="auth-switch">
            {isRegistering ? 'Already have an account?' : 'New to soundwave?'}{' '}
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
        <div className="auth-vinyl">
          <span>SW</span>
        </div>
        <div className="auth-orb one"></div>
        <div className="auth-orb two"></div>
        <p>
          Every listener has a sound.<br />
          <strong>Every artist has a stage.</strong>
        </p>
      </div>
    </section>
  );
}
