import { redirect } from 'next/navigation';
import { getRefreshTokenCookie, verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Mail, Calendar, CheckCircle2 } from 'lucide-react';
import '@/styles/onbording.css';
export default async function OnboardingPage() {
  const refreshToken = await getRefreshTokenCookie();
  if (!refreshToken) redirect('/login');

  const payload = verifyToken(refreshToken);
  if (!payload) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user) redirect('/login');
  // if (!user.emailVerifiedAt) redirect('/verify-email');

  return (
    <div className="onboarding-page">
      {/* Background layers */}
      <div className="onboarding-bg">
        <div className="smoke smoke-1" />
        <div className="smoke smoke-2" />
        <div className="smoke smoke-3" />
        <div className="fire-glow fire-glow-1" />
        <div className="fire-glow fire-glow-2" />
        <div className="embers">
          {Array.from({ length: 18 }).map((_, i) => (
            <span
              key={i}
              className={`ember ember-${i % 6}`}
              style={{ left: `${(i * 5.5) % 100}%`, animationDelay: `${(i * 0.7) % 9}s` }}
            />
          ))}
        </div>
        <div className="vignette" />
      </div>

      <div className="onboarding-shell">
        <header className="onboarding-header">
          <div className="flame-badge">
            <span className="flame-core" />
            <span className="flame-icon">🔥</span>
          </div>
          <h1 className="onboarding-title">Connect your accounts</h1>
          <p className="onboarding-subtitle">
            ZeroClick needs to connect to your providers to sync your data.
          </p>
        </header>

        <section className="onboarding-content">
          {/* Calendar Card */}
          <article className="onboarding-card">
            <div className="card-glow card-glow-calendar" />
            <div className="card-icon card-icon-calendar">
              <Calendar className="h-8 w-8" />
            </div>
            <div className="card-body">
              <h3 className="card-title">Connect Calendar</h3>
              <p className="card-description">See your schedule alongside your emails</p>
            </div>

            <div className="card-action">
              {user.calendarConnected ? (
                <div className="connected-pill">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Connected</span>
                </div>
              ) : (
                <>
                  <a href="/api/auth/connect/calendar" className="secondary-btn">
                    <span>Connect Calendar</span>
                    <span className="optional-tag">Optional</span>
                  </a>
                  <button className="skip-btn">Skip for now</button>
                </>
              )}
            </div>
          </article>
          {/* Gmail Card */}
          <article className="onboarding-card">
            <div className="card-glow card-glow-gmail" />
            <div className="card-icon card-icon-gmail">
              <Mail className="h-8 w-8" />
            </div>
            <div className="card-body">
              <h3 className="card-title">Connect Gmail</h3>
              <p className="card-description">
                ZeroClick needs access to read, send, and manage your emails
              </p>
            </div>

            <div className="card-action">
              {user.gmailConnected ? (
                <div className="connected-pill">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Connected</span>
                </div>
              ) : (
                <a href="/api/auth/connect/gmail" className="fire-btn">
                  <span className="fire-btn-glow" />
                  <span className="fire-btn-label">Connect Gmail</span>
                </a>
              )}
            </div>
          </article>
        </section>

        <footer className="onboarding-footer">
          {user.gmailConnected ? (
            <Link href="/inbox" className="fire-btn fire-btn-lg">
              <span className="fire-btn-glow" />
              <span className="fire-btn-label">
                Continue to ZeroClick
                <span className="arrow">→</span>
              </span>
            </Link>
          ) : (
            <button disabled className="fire-btn fire-btn-lg fire-btn-disabled">
              <span className="fire-btn-label">
                Continue to ZeroClick
                <span className="arrow">→</span>
              </span>
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
