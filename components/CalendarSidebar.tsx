'use client';

import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import { Calendar, CalendarPlus } from 'lucide-react';
import { format, isToday, parseISO, startOfDay, endOfDay, differenceInMinutes } from 'date-fns';
import '@/styles/calendarSidebar.css';
const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface CalendarSidebarProps {
  isLoading?: boolean;
  showCurrentTime?: boolean;
  currentTime: Date;
  currentTimeDiff: number;
  pixelPerMinute: number;
  hours: number[];
  displayEvents: any[];
  getEventStyle: (event: any) => React.CSSProperties;
  getThemeColors: (colorId?: string) => string;
}

export default function CalendarSidebar() {
  // for formate ui
  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
  };

  // Fetch today's events
  const todayStart = startOfDay(new Date()).toISOString();
  const todayEnd = endOfDay(new Date()).toISOString();

  const { data, error, isLoading } = useSWR(
    `/api/calendar?timeMin=${encodeURIComponent(todayStart)}&timeMax=${encodeURIComponent(todayEnd)}`,
    fetcher
  );

  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // update every minute
    return () => clearInterval(timer);
  }, []);

  const events = data?.events || [];

  const displayEvents = events;

  // 24-hour timeline
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getEventStyle = (event: any) => {
    const start = new Date(event.start?.dateTime || event.start?.date || event.start);
    const end = new Date(event.end?.dateTime || event.end?.date || event.end);

    // Relative to midnight for our 24h timeline display
    const dayStart = new Date(start).setHours(0, 0, 0, 0);
    const topDiff = differenceInMinutes(start, dayStart);
    const duration = differenceInMinutes(end, start);

    const pixelPerMinute = 80 / 60; // 80px per hour block

    return {
      top: `${topDiff * pixelPerMinute}px`,
      height: `${duration * pixelPerMinute}px`,
    };
  };

  const getThemeColors = (colorId?: string) => {
    const id = colorId || '1';
    const googleColors: Record<string, string> = {
      '1': 'bg-[#CBE4FF] border-l-[#B4D7FF]',
      '2': 'bg-[#BCF0C8] border-l-[#A3E8B3]',
      '3': 'bg-[#E3D1FE] border-l-[#D4B9FD]',
      '4': 'bg-[#FFBBD7] border-l-[#FF9CBF]',
      '5': 'bg-[#FBE4A1] border-l-[#F8D87E]',
      '6': 'bg-[#FFE2D1] border-l-[#FFCFAE]',
      '7': 'bg-[#C2E0FF] border-l-[#99C8FF]',
      '8': 'bg-[#E2E8F0] border-l-[#CBD5E1]',
      '9': 'bg-[#C7D2FE] border-l-[#A5B4FC]',
      '10': 'bg-[#BBF7D0] border-l-[#86EFAC]',
      '11': 'bg-[#FECDD3] border-l-[#FDA4AF]',
    };
    return googleColors[id] || googleColors['1'];
  };

  // Current time indicator calculation
  const dayStartHour = new Date().setHours(0, 0, 0, 0);
  const currentTimeDiff = differenceInMinutes(currentTime, dayStartHour);
  const pixelPerMinute = 80 / 60;
  const showCurrentTime = currentTimeDiff >= 0 && currentTimeDiff <= 24 * 60;

  return (
    <aside className="zc-cal">
      {/* Ambient background layers */}
      <div className="zc-cal-bg" aria-hidden="true">
        <div className="zc-cal-smoke zc-cal-smoke-1" />
        <div className="zc-cal-smoke zc-cal-smoke-2" />
        <div className="zc-cal-fire-glow zc-cal-fire-top" />
        <div className="zc-cal-fire-glow zc-cal-fire-bottom" />
        <div className="zc-cal-ember zc-cal-ember-1" />
        <div className="zc-cal-ember zc-cal-ember-2" />
        <div className="zc-cal-ember zc-cal-ember-3" />
        <div className="zc-cal-ember zc-cal-ember-4" />
      </div>

      {/* Header */}
      <header className="zc-cal-header">
        <div className="zc-cal-header-inner">
          <div className="zc-cal-header-icon">
            <Calendar className="zc-cal-header-icon-svg" />
            <span className="zc-cal-header-icon-glow" />
          </div>
          <h2 className="zc-cal-header-title">Today's Calendar</h2>
          <span className="zc-cal-status" title="Live">
            <span className="zc-cal-status-dot" />
            <span className="zc-cal-status-ring" />
          </span>
        </div>
        <div className="zc-cal-header-date">{format(currentTime, 'd MMM')}</div>
      </header>

      {/* Timeline */}
      <div className="zc-cal-scroll">
        {isLoading && (
          <div className="zc-cal-loading">
            <span className="zc-cal-loading-dot" />
            <span className="zc-cal-loading-dot" />
            <span className="zc-cal-loading-dot" />
            <p>Loading events…</p>
          </div>
        )}

        {!isLoading && (
          <div className="zc-cal-timeline">
            {/* Hour rows */}
            {hours.map((hour) => (
              <div key={hour} className="zc-cal-hour-row">
                <div className="zc-cal-hour-label">{formatHour(hour)}</div>
                <div className="zc-cal-hour-line" />
              </div>
            ))}

            {/* Current time indicator */}
            {showCurrentTime && (
              <div
                className="zc-cal-now"
                style={{
                  top: `${currentTimeDiff * pixelPerMinute}px`,
                }}
              >
                <div className="zc-cal-now-pill">
                  <span className="zc-cal-now-pill-glow" />
                  <span className="zc-cal-now-pill-text">{format(currentTime, 'h.mm')}</span>
                </div>
                <div className="zc-cal-now-line">
                  <span className="zc-cal-now-line-glow" />
                </div>
              </div>
            )}

            {/* Event chips */}
            <div className="zc-cal-events">
              {displayEvents.map((event: any) => {
                const style = getEventStyle(event);
                const colorClass = getThemeColors(event.colorId);

                return (
                  <div
                    key={event.id}
                    onClick={() => router.push(`/calendar?editEventId=${event.id}`)}
                    className={`zc-cal-event ${colorClass}`}
                    style={style}
                  >
                    <span className="zc-cal-event-glow" />
                    <div className="zc-cal-event-bar" />
                    <div className="zc-cal-event-body">
                      <h3 className="zc-cal-event-title">
                        {event.title || event.summary || 'Untitled Event'}
                      </h3>
                      {event.description && (
                        <p className="zc-cal-event-desc">{event.description}</p>
                      )}
                      <div className="zc-cal-event-foot">
                        <p className="zc-cal-event-time">
                          {format(
                            new Date(event.start?.dateTime || event.start?.date || event.start),
                            'h:mm a'
                          )}{' '}
                          –{' '}
                          {format(
                            new Date(event.end?.dateTime || event.end?.date || event.end),
                            'h:mm a'
                          )}
                        </p>
                        {event.hangoutLink && (
                          <a
                            href={event.hangoutLink}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="zc-cal-event-join"
                          >
                            Join
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Floating action button */}
      <button
        type="button"
        onClick={() => router.push('/calendar')}
        className="zc-cal-fab"
        aria-label="Open calendar"
      >
        <span className="zc-cal-fab-ring" />
        <span className="zc-cal-fab-glow" />
        <CalendarPlus className="zc-cal-fab-icon" />
      </button>
    </aside>
  );
}
