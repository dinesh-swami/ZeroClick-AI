'use client';

import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import '../styles/mainpage.css';

export default function LandingPage() {
  const { user, isLoading } = useAuth();

  return (
    <div className="hero-page">
      {/* Full-bleed background layer (100%) */}
      <div className="hero-bg-full" />

      {/* Framed background layer (90%, rounded, sits like a frame) */}
      <div className="hero-frame-wrapper">
        <div className="hero-bg-framed" />

        {/* Drifting smoke wisps for fire/smoke atmosphere */}
        <div className="hero-smoke" aria-hidden="true">
          <span className="smoke-wisp s1" />
          <span className="smoke-wisp s2" />
          <span className="smoke-wisp s3" />
          <span className="smoke-wisp s4" />
        </div>

        {/* Ambient floating ember particles for extra interactivity */}
        <div className="hero-particles" aria-hidden="true">
          <span className="particle p1" />
          <span className="particle p2" />
          <span className="particle p3" />
          <span className="particle p4" />
          <span className="particle p5" />
          <span className="particle p6" />
          <span className="particle p7" />
          <span className="particle p8" />
          <span className="particle p9" />
          <span className="particle p10" />
        </div>

        <div className="hero-content">
          <h1 className="hero-title">
            <span className="hero-title-line hero-title-silver">ZeroClick AI for</span>
            <span className="hero-title-line hero-title-accent">Everyone</span>
          </h1>

          <p className="hero-subtitle">
            You can connect you email and calendar and it will give you experience ever made.
            Powered by Corsair, integrated with everything you need.
          </p>

          <div className="hero-cta">
            {isLoading ? (
              <div className="hero-loading">
                <span className="hero-dot" />
                <span className="hero-dot" />
                <span className="hero-dot" />
              </div>
            ) : user ? (
              <Link href="/inbox" className="hero-btn hero-btn-primary">
                <span className="hero-btn-glow" aria-hidden="true" />
                <span className="hero-btn-label">Go to Inbox</span>
                <span className="hero-btn-arrow" aria-hidden="true">
                  &rarr;
                </span>
              </Link>
            ) : (
              <div className="hero-cta-group">
                <Link href="/login" className="hero-btn hero-btn-primary">
                  <span className="hero-btn-glow" aria-hidden="true" />
                  <span className="hero-btn-label">Log In</span>
                  <span className="hero-btn-arrow" aria-hidden="true">
                    &rarr;
                  </span>
                </Link>
                <Link href="/register" className="hero-btn hero-btn-secondary">
                  <span className="hero-btn-label">Sign Up</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
