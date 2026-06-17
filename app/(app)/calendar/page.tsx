'use client';
import { useState, useMemo, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Plus, AlertCircle, CalendarDays } from 'lucide-react';
import CreateEventModal from '@/components/CreateEventModal';
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  subWeeks,
  addWeeks,
  isSameDay,
  isToday,
  addMinutes,
  differenceInMinutes,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  subDays,
  subMonths,
  addMonths,
} from 'date-fns';
import '@/styles/calendar.css';
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    console.error('[Calendar Fetcher] API error:', res.status, body);
    throw new Error(body.error || `API error: ${res.status}`);
  }
  return res.json();
};
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const CALENDAR_START_HOUR = 0;
export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [now, setNow] = useState(new Date());
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);
  const searchParams = useSearchParams();
  const router = useRouter();
  const editEventId = searchParams.get('editEventId');
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const dayStart = new Date(currentDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(currentDate);
  dayEnd.setHours(23, 59, 59, 999);
  const fetchStart =
    view === 'day'
      ? dayStart
      : view === 'week'
        ? weekStart
        : startOfWeek(monthStart, { weekStartsOn: 1 });
  const fetchEnd =
    view === 'day' ? dayEnd : view === 'week' ? weekEnd : endOfWeek(monthEnd, { weekStartsOn: 1 });
  const { data, error, isLoading, mutate } = useSWR(
    `/api/calendar?timeMin=${fetchStart.toISOString()}&timeMax=${fetchEnd.toISOString()}`,
    fetcher
  );
  const events = data?.events || [];
  const days = useMemo(() => {
    if (view === 'day') return [currentDate];
    if (view === 'week') {
      const d = [];
      for (let i = 0; i < 7; i++) {
        d.push(addDays(weekStart, i));
      }
      return d;
    }
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [view, currentDate, weekStart, monthStart, monthEnd]);
  const handlePrev = () => {
    if (view === 'day') setCurrentDate(subDays(currentDate, 1));
    else if (view === 'week') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subMonths(currentDate, 1));
  };
  const handleNext = () => {
    if (view === 'day') setCurrentDate(addDays(currentDate, 1));
    else if (view === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addMonths(currentDate, 1));
  };
  const handleToday = () => setCurrentDate(new Date());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const handleGridClick = (day: Date, hour: number) => {
    const start = new Date(day);
    start.setHours(hour, 0, 0, 0);
    const end = addMinutes(start, 30);
    setSelectedEvent({
      start: start.toISOString(),
      end: end.toISOString(),
    });
    setIsCreateModalOpen(true);
  };
  const handleEventClick = (event: any) => {
    setSelectedEvent({
      id: event.id,
      title: event.title || event.summary || '',
      start: event.start?.dateTime || event.start?.date || event.start || '',
      end: event.end?.dateTime || event.end?.date || event.end || '',
      description: event.description || '',
      attendees: event.attendees ? event.attendees.map((a: any) => a.email) : [],
      hangoutLink: event.hangoutLink || null,
    });
    setIsCreateModalOpen(true);
  };
  useEffect(() => {
    if (editEventId && events.length > 0) {
      const ev = events.find((e: any) => e.id === editEventId);
      if (ev) {
        handleEventClick(ev);
        router.replace('/calendar', { scroll: false });
      }
    }
  }, [editEventId, events, router]);
  const handleCreateNew = () => {
    setSelectedEvent(null);
    setIsCreateModalOpen(true);
  };
  const handleCreateSubmit = async (payload: {
    title: string;
    start: string;
    end: string;
    description: string;
    attendees: string[];
  }) => {
    const isEdit = !!selectedEvent?.id;
    const res = await fetch(isEdit ? '/api/calendar' : '/api/calendar/events', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        ...(isEdit ? { eventId: selectedEvent.id } : {}),
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to save event');
    }
    mutate();
  };
  const handleDeleteEvent = async (eventId: string) => {
    const res = await fetch(`/api/calendar?eventId=${eventId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to delete event');
    }
    mutate();
  };
  const nowMinutesFromStart = now.getHours() * 60 + now.getMinutes() - CALENDAR_START_HOUR * 60;
  const PIXELS_PER_HOUR = 80;
  const nowTopPx = (nowMinutesFromStart / 60) * PIXELS_PER_HOUR;
  useEffect(() => {
    if (scrollContainerRef.current) {
      const containerHeight = scrollContainerRef.current.clientHeight;
      const defaultScroll = 8 * PIXELS_PER_HOUR;
      scrollContainerRef.current.scrollTop = Math.max(
        0,
        nowTopPx > 0 && nowTopPx < 20 * PIXELS_PER_HOUR
          ? nowTopPx - containerHeight / 3
          : defaultScroll - 40
      );
    }
  }, []);
  return (
    <div className="cal-shell">
      {/* Ambient fire + smoke layers */}
      <div className="cal-glow" aria-hidden />
      <div className="cal-smoke" aria-hidden />
      <div className="cal-embers" aria-hidden>
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="cal-container">
        {/* Header */}
        <header className="cal-header">
          <div className="cal-header-left">
            <div className="cal-header-icon">
              <CalendarDays size={20} />
            </div>
            <div>
              <h1 className="cal-title">
                {view === 'day'
                  ? format(currentDate, 'MMMM d, yyyy')
                  : view === 'week'
                    ? `${format(weekStart, 'MMMM')} ${format(currentDate, 'yyyy')}`
                    : format(currentDate, 'MMMM yyyy')}
              </h1>
              <p className="cal-subtitle">Your scheduling command center</p>
            </div>
          </div>
          <div className="cal-header-right">
            {/* Pill view selector */}
            <div className="cal-pill-group" role="tablist">
              {(['month', 'week', 'day'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`cal-pill ${view === v ? 'is-active' : ''}`}
                >
                  {v}
                </button>
              ))}
            </div>
            {/* Navigation */}
            <div className="cal-nav-group">
              <button onClick={handlePrev} className="cal-icon-btn" aria-label="Previous">
                <ChevronLeft size={16} />
              </button>
              <button onClick={handleToday} className="cal-today-btn">
                Today
              </button>
              <button onClick={handleNext} className="cal-icon-btn" aria-label="Next">
                <ChevronRight size={16} />
              </button>
            </div>
            <button onClick={handleCreateNew} className="cal-add-btn">
              <Plus size={16} />
              <span>Add Event</span>
            </button>
          </div>
        </header>
        {error && (
          <div className="cal-alert cal-alert-error">
            <AlertCircle size={16} />
            <span>Failed to load calendar: {error.message || 'Unknown error'}</span>
          </div>
        )}
        {isLoading && (
          <div className="cal-alert cal-alert-loading">
            <span className="cal-loading-dot" />
            Loading your calendar...
          </div>
        )}
        {/* Main Panel */}
        <div className="cal-panel">
          {/* Days header */}
          <div className="cal-days-header">
            <div className="cal-time-spacer" />
            <div className="cal-days-row">
              {days.map((day, i) => {
                const isActive = view === 'day' ? true : isToday(day);
                return (
                  <button
                    key={i}
                    onClick={() => {
                      setView('day');
                      setCurrentDate(day);
                    }}
                    className={`cal-day-head ${isActive ? 'is-today' : ''}`}
                  >
                    <span className="cal-day-name">{format(day, 'EEEE')}</span>
                    <span className="cal-day-num">{format(day, 'd')}</span>
                  </button>
                );
              })}
            </div>
          </div>
          {/* Scrollable grid */}
          <div className="cal-grid-scroll" ref={scrollContainerRef}>
            {/* Time labels column */}
            <div className="cal-time-col">
              {HOURS.map((hour) => (
                <div key={hour} className="cal-time-cell">
                  {hour > 0 && (
                    <span className="cal-time-label">
                      {hour === 12 ? '12 pm' : hour > 12 ? `${hour - 12} pm` : `${hour} am`}
                    </span>
                  )}
                </div>
              ))}
            </div>
            {/* Day columns */}
            <div
              className="cal-days-grid"
              style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}
            >
              {/* Horizontal lines */}
              <div className="cal-h-lines" aria-hidden>
                {HOURS.map((hour) => (
                  <div key={hour} className="cal-h-line" />
                ))}
              </div>
              {days.map((day, i) => {
                const dayEvents = events.filter(
                  (e: any) => e.start && isSameDay(new Date(e.start), day)
                );
                return (
                  <div key={i} className={`cal-day-col ${isToday(day) ? 'is-today' : ''}`}>
                    {/* Background slots */}
                    <div className="cal-slots">
                      {HOURS.map((hour) => (
                        <div
                          key={hour}
                          className="cal-slot"
                          onClick={() => handleGridClick(day, hour)}
                        />
                      ))}
                    </div>
                    {/* Events */}
                    {dayEvents.map((event: any, idx: number) => {
                      const startD = new Date(event.start);
                      const isAllDay = event.start.length === 10;
                      let top = 0;
                      let height = PIXELS_PER_HOUR / 2;
                      if (!isAllDay) {
                        const endD = event.end ? new Date(event.end) : addMinutes(startD, 30);
                        const startMinutes =
                          startD.getHours() * 60 + startD.getMinutes() - CALENDAR_START_HOUR * 60;
                        const durationMinutes = Math.max(differenceInMinutes(endD, startD), 15);
                        top = (startMinutes / 60) * PIXELS_PER_HOUR;
                        height = (durationMinutes / 60) * PIXELS_PER_HOUR;
                      }
                      if (top + height < 0) return null;
                      return (
                        <div
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEventClick(event);
                          }}
                          className="cal-event"
                          style={{
                            top: `${Math.max(0, top)}px`,
                            height: `${top < 0 ? height + top : height}px`,
                            minHeight: '40px',
                          }}
                        >
                          <span className="cal-event-accent" aria-hidden />
                          {height >= 60 && (
                            <div className="cal-event-title">
                              {event.summary || event.title || 'Untitled Event'}
                            </div>
                          )}
                          <div className="cal-event-time">
                            {isAllDay
                              ? 'All Day'
                              : `${format(startD, 'h:mm a')} - ${format(event.end ? new Date(event.end) : addMinutes(startD, 30), 'h:mm a')}`}
                            {height < 60 &&
                              ` • ${event.summary || event.title || 'Untitled Event'}`}
                          </div>
                        </div>
                      );
                    })}
                    {/* Current time line */}
                    {isToday(day) && nowMinutesFromStart >= 0 && (
                      <div className="cal-now-line" style={{ top: `${nowTopPx}px` }}>
                        <span className="cal-now-dot" />
                        <span className="cal-now-bar" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      {isCreateModalOpen && (
        <CreateEventModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateSubmit}
          onDelete={handleDeleteEvent}
          initialEvent={selectedEvent}
        />
      )}
    </div>
  );
}
