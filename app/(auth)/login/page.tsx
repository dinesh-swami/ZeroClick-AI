'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import '@/styles/sinup.css';
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/inbox';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to login');
      }

      // Success, redirect to requested redirect param or inbox
      router.push(redirect);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Construct Google OAuth login URL with redirect parameter
  const googleAuthUrl = `/api/auth/google?redirect=${encodeURIComponent(redirect)}`;

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

          <h1 className="signup-title">Welcome Back</h1>
          <p className="signup-subtitle">Sign in to access your inbox.</p>
        </div>

        <form onSubmit={handleLogin} className="signup-form">
          <div className="form-field">
            <label className="form-label">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="you@example.com"
            />
          </div>

          <div className="form-field">
            <label className="form-label">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="••••••••"
            />
          </div>

          {error && <div className="form-error">{error}</div>}

          <button type="submit" disabled={loading} className="fire-btn">
            <span className="fire-btn-glow"></span>
            <span className="fire-btn-text">{loading ? 'Signing In...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="divider">
          <span>Or continue with</span>
        </div>

        <button
          type="button"
          onClick={() => {
            window.location.href = googleAuthUrl;
          }}
          className="oauth-btn"
        >
          Continue with Google
        </button>
        <div className="auth-switch">
          <div className="auth-switch-line"></div>

          <p className="auth-switch-text">New to ZeroClick?</p>

          <button
            type="button"
            onClick={() => {
              window.location.href = '/register';
            }}
            className="auth-switch-btn"
          >
            <span>Create Account</span>
            <svg
              className="auth-switch-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M5 12H19M19 12L13 6M19 12L13 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function LoginFallback() {
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
            />
          ))}
        </div>
      </div>

      <div className="signup-card login-fallback-card">
        <div className="signup-header">
          <div className="flame-icon skeleton-flame">
            <span className="flame-core"></span>
          </div>

          <div className="skeleton skeleton-title"></div>
          <div className="skeleton skeleton-subtitle"></div>
        </div>

        <div className="signup-form">
          <div className="form-field">
            <div className="skeleton skeleton-label"></div>
            <div className="skeleton skeleton-input"></div>
          </div>

          <div className="form-field">
            <div className="skeleton skeleton-label"></div>
            <div className="skeleton skeleton-input"></div>
          </div>

          <div className="skeleton skeleton-button"></div>
        </div>

        <div className="divider">
          <span>Loading...</span>
        </div>

        <div className="skeleton skeleton-oauth"></div>
      </div>
    </div>
  );
}
export default function Login() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
