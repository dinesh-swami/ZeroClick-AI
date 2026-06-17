import { getRefreshTokenCookie, verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { DisconnectButton } from '@/components/DisconnectButton';
import { Settings, Mail, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';
import '@/styles/setting.css';

export default async function SettingsPage() {
  const refreshToken = await getRefreshTokenCookie();
  if (!refreshToken) redirect('/login');

  const payload = verifyToken(refreshToken);
  if (!payload) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user) redirect('/login');

  return (
    <div className="settings-shell">
      {/* Ambient Fire + Smoke layers */}
      <div className="settings-glow" aria-hidden="true" />
      <div className="settings-smoke" aria-hidden="true" />
      <div className="settings-embers" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>

      <div className="settings-container">
        {/* Header */}
        <header className="settings-header">
          <div className="settings-header-title">
            <Settings className="settings-header-icon" />
            <h1>Settings</h1>
          </div>
          <p>Manage your connected accounts and preferences.</p>
        </header>

        {/* Integrations Section */}
        <section className="settings-panel">
          <div className="settings-panel-header">
            <h2>Integrations</h2>
            <p>Connect your external accounts to sync data seamlessly via Corsair.</p>
          </div>

          <div className="integration-list">
            {/* Gmail Integration */}
            <div className="integration-card">
              <div className="integration-left">
                <div className="integration-icon fire">
                  <Mail />
                </div>
                <div className="integration-info">
                  <div className="integration-title-row">
                    <span className="integration-title">Gmail</span>
                    {user.gmailConnected && (
                      <span className="connected-badge">
                        <CheckCircle2 /> Connected
                      </span>
                    )}
                  </div>
                  <p className="integration-desc">
                    Sync your inbox and manage your emails securely.
                  </p>
                </div>
              </div>

              <div>
                {user.gmailConnected ? (
                  <DisconnectButton integration="gmail" label="Disconnect Gmail" />
                ) : (
                  <a href="/api/auth/connect/gmail" className="btn-fire">
                    Connect
                  </a>
                )}
              </div>
            </div>

            {/* Google Calendar Integration */}
            <div className="integration-card">
              <div className="integration-left">
                <div className="integration-icon calendar">
                  <CalendarIcon />
                </div>
                <div className="integration-info">
                  <div className="integration-title-row">
                    <span className="integration-title">Google Calendar</span>
                    {user.calendarConnected && (
                      <span className="connected-badge">
                        <CheckCircle2 /> Connected
                      </span>
                    )}
                  </div>
                  <p className="integration-desc">
                    See your schedule alongside your emails and plan ahead.
                  </p>
                </div>
              </div>

              <div>
                {user.calendarConnected ? (
                  <DisconnectButton integration="calendar" label="Disconnect Calendar" />
                ) : (
                  <a href="/api/auth/connect/calendar" className="btn-fire">
                    Connect
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
