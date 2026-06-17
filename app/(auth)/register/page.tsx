'use client';

import { useRouter } from 'next/dist/client/components/navigation';
import { useState } from 'react';
import '@/styles/sinup.css';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to register');
      }

      router.push('/login');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const router = useRouter();

  return (
    <div className="signup-page">
      <div className="signup-bg">
        <div className="smoke smoke-1"></div>
        <div className="smoke smoke-2"></div>
        <div className="smoke smoke-3"></div>
        <div className="fire-glow fire-glow-1"></div>
        <div className="fire-glow fire-glow-2"></div>
        <div className="embers">
          {Array.from({ length: 25 }).map((_, i) => (
            <span
              key={i}
              className={`ember ember-${i % 5}`}
              style={{
                left: `${(i * 4) % 100}%`,
                animationDelay: `${(i * 0.4) % 8}s`,
                animationDuration: `${6 + (i % 6)}s`,
              }}
            ></span>
          ))}
        </div>
      </div>

      <div className="signup-card">
        <div className="signup-header">
          <div className="flame-icon">
            <span className="flame-core"></span>
          </div>
          <h1 className="signup-title">Create an account</h1>
          <p className="signup-subtitle">Join to experience blazing fast email.</p>
        </div>

        <form onSubmit={handleRegister} className="signup-form">
          <div className="form-field">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <div className="form-error">{error}</div>}

          <button type="submit" disabled={loading} className="fire-btn">
            <span className="fire-btn-glow"></span>
            <span className="fire-btn-text">{loading ? 'Creating Account...' : 'Sign Up'}</span>
          </button>
        </form>

        <div className="divider">
          <span>Or continue with</span>
        </div>

        <button
          onClick={() => {
            window.location.href = '/api/auth/google';
          }}
          className="oauth-btn"
        >
          Continue with Google
        </button>
        <div className="auth-switch">
          <div className="auth-switch-line"></div>

          <p className="auth-switch-text">Already part of the ZeroClick?</p>

          <button
            type="button"
            onClick={() => {
              window.location.href = '/login';
            }}
            className="auth-switch-btn"
          >
            <svg
              className="auth-switch-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M19 12H5M5 12L11 6M5 12L11 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <span>Return to Login</span>
          </button>
        </div>
      </div>
    </div>
  );
}
