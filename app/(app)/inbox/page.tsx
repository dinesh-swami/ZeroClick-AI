'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import useSWRInfinite from 'swr/infinite';
import { useInView } from 'react-intersection-observer';
import EmailItem from '@/components/EmailItem';
import ReadingPane from '@/components/ReadingPane';
import CalendarSidebar from '@/components/CalendarSidebar';
import ComposeModal from '@/components/ComposeModal';
import ShortcutOverlay from '@/components/ShortcutOverlay';
import { Search, SlidersHorizontal, RefreshCw, Flame } from 'lucide-react';
import '@/styles/inbox.css';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function InboxPage() {
  const limit = 20;
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [replyTo, setReplyTo] = useState<{ to: string; subject: string } | null>(null);
  const [view, setView] = useState<'INBOX' | 'ARCHIVED' | 'SENT' | 'SPAM'>('INBOX');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [isShortcutOverlayOpen, setIsShortcutOverlayOpen] = useState(false);
  const [sortOption, setSortOption] = useState<'NEWEST' | 'OLDEST' | 'UNREAD_FIRST'>('NEWEST');
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const getKey = useCallback(
    (pageIndex: number, previousPageData: any) => {
      if (debouncedSearchQuery) {
        if (pageIndex > 0) return null;
        return `/api/emails/search?q=${encodeURIComponent(debouncedSearchQuery)}`;
      }
      if (previousPageData && !previousPageData.nextCursor) return null;
      if (pageIndex === 0) return `/api/emails?limit=${limit}&view=${view}`;
      return `/api/emails?cursor=${previousPageData.nextCursor}&limit=${limit}&view=${view}`;
    },
    [debouncedSearchQuery, limit, view]
  );

  const { data, error, size, setSize, isValidating, mutate } = useSWRInfinite(getKey, fetcher, {
    revalidateOnFocus: false,
  });

  const emails = data ? data.flatMap((page) => page.emails || []) : [];

  let displayEmails = [...emails];
  if (sortOption === 'OLDEST') {
    displayEmails.reverse();
  } else if (sortOption === 'UNREAD_FIRST') {
    displayEmails.sort((a: any, b: any) => {
      if (a.isRead === b.isRead) return new Date(b.date).getTime() - new Date(a.date).getTime();
      return a.isRead ? 1 : -1;
    });
  }

  const selectedEmail = emails.find((e: any) => e?.id === selectedEmailId) || null;

  const isLoadingInitialData = !data && !error;
  const isLoadingMore =
    isLoadingInitialData || (size > 0 && data && typeof data[size - 1] === 'undefined');
  const isEmpty = data?.[0]?.emails?.length === 0;
  const isReachingEnd = debouncedSearchQuery
    ? true
    : isEmpty ||
      (data && data[data.length - 1]?.emails?.length < limit) ||
      (data && !data[data.length - 1]?.nextCursor);

  const { ref } = useInView({
    threshold: 0,
    onChange: (inView) => {
      if (inView && !isValidating && !isReachingEnd && !debouncedSearchQuery) {
        setSize(size + 1);
      }
    },
  });

  useEffect(() => {
    if (debouncedSearchQuery) return;
    const eventSource = new EventSource('/api/sse');
    eventSource.onmessage = (event) => {
      try {
        const newEmail = JSON.parse(event.data);
        mutate((currentData: any) => {
          if (!currentData) return currentData;
          const newData = [...currentData];
          newData[0] = { ...newData[0], emails: [newEmail, ...newData[0].emails] };
          return newData;
        }, false);
      } catch (e) {
        console.error('Failed to parse SSE message', e);
      }
    };
    return () => eventSource.close();
  }, [mutate, debouncedSearchQuery]);

  const removeEmailOptimistically = async (id: string, action: 'archive' | 'delete') => {
    if (selectedEmailId === id) setSelectedEmailId(null);
    await mutate((currentData: any) => {
      if (!currentData) return currentData;
      return currentData.map((page: any) => ({
        ...page,
        emails: page.emails.filter((e: any) => e.id !== id),
      }));
    }, false);
    try {
      const res = await fetch(`/api/emails/${id}/${action}`, { method: 'POST' });
      if (!res.ok) throw new Error(`Failed to ${action}`);
    } catch (err) {
      console.error(`Rollback ${action}`, err);
      mutate();
    }
  };

  const handleArchive = useCallback(
    (id: string) => removeEmailOptimistically(id, 'archive'),
    [selectedEmailId, mutate]
  );
  const handleDelete = useCallback(
    (id: string) => removeEmailOptimistically(id, 'delete'),
    [selectedEmailId, mutate]
  );

  const handleReply = useCallback(
    (id: string) => {
      const email = emails.find((e: any) => e.id === id);
      if (email) {
        setReplyTo({ to: email.from, subject: email.subject });
        setIsComposeOpen(true);
      }
    },
    [emails]
  );

  const handleSend = async (payload: { to: string; subject: string; body: string }) => {
    await fetch('/api/emails/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      )
        return;
      switch (e.key) {
        case 'c':
          e.preventDefault();
          setReplyTo(null);
          setIsComposeOpen(true);
          break;
        case 'e':
          e.preventDefault();
          if (selectedEmailId) handleArchive(selectedEmailId);
          break;
        case 'r':
          e.preventDefault();
          if (selectedEmailId) handleReply(selectedEmailId);
          break;
        case '/':
          e.preventDefault();
          setTimeout(() => searchInputRef.current?.focus(), 0);
          break;
        case '?':
          e.preventDefault();
          setIsShortcutOverlayOpen((prev) => !prev);
          break;
        case 'Escape':
          e.preventDefault();
          setSelectedEmailId(null);
          break;
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [selectedEmailId, handleArchive, handleReply]);

  const tabs = [
    { id: 'INBOX', label: 'Primary' },
    { id: 'ARCHIVED', label: 'Archived' },
    { id: 'SENT', label: 'Sent' },
    { id: 'SPAM', label: 'Spam' },
  ] as const;

  return (
    <div className="zc-inbox-shell">
      {/* Ambient background layers */}
      <div className="zc-inbox-bg" aria-hidden="true">
        <div className="zc-inbox-smoke zc-inbox-smoke-1" />
        <div className="zc-inbox-smoke zc-inbox-smoke-2" />
        <div className="zc-inbox-smoke zc-inbox-smoke-3" />
        <div className="zc-inbox-fire-glow zc-inbox-fire-glow-1" />
        <div className="zc-inbox-fire-glow zc-inbox-fire-glow-2" />
        <div className="zc-inbox-vignette" />
        <div className="zc-inbox-embers">
          {Array.from({ length: 14 }).map((_, i) => (
            <span key={i} className={`zc-inbox-ember zc-inbox-ember-${i % 7}`} />
          ))}
        </div>
      </div>

      {/* Pane 2: Email List (Main Content) */}
      <main className="zc-inbox-main">
        <div className="zc-inbox-panel">
          <div className="zc-inbox-panel-glow" aria-hidden="true" />
          <div className="zc-inbox-panel-inner">
            {/* Header */}
            <header className="zc-inbox-header">
              <div className="zc-inbox-title-wrap">
                <h1 className="zc-inbox-title">Inbox</h1>
                <span className="zc-inbox-title-underline" aria-hidden="true" />
              </div>

              <div className="zc-inbox-header-controls">
                {/* Search */}
                <div className="zc-inbox-search">
                  <Search className="zc-inbox-search-icon" size={15} />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search something..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="zc-inbox-search-input"
                  />
                  <span className="zc-inbox-search-kbd">
                    <kbd>⌘</kbd>
                    <kbd>K</kbd>
                  </span>
                </div>

                {/* Filter / Sort */}
                <div className="zc-inbox-sort-wrap">
                  <button
                    onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                    className={`zc-inbox-icon-btn ${isSortMenuOpen ? 'is-active' : ''}`}
                    title="Sort"
                  >
                    <SlidersHorizontal size={15} />
                  </button>
                  {isSortMenuOpen && (
                    <div className="zc-inbox-sort-menu">
                      <div className="zc-inbox-sort-menu-label">Sort By</div>
                      {(
                        [
                          ['NEWEST', 'Newest First'],
                          ['OLDEST', 'Oldest First (Loaded)'],
                          ['UNREAD_FIRST', 'Unread First'],
                        ] as const
                      ).map(([id, label]) => (
                        <button
                          key={id}
                          onClick={() => {
                            setSortOption(id);
                            setIsSortMenuOpen(false);
                          }}
                          className={`zc-inbox-sort-item ${sortOption === id ? 'is-active' : ''}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => mutate()}
                  className="zc-inbox-icon-btn"
                  title="Refresh Emails"
                >
                  <RefreshCw size={15} />
                </button>

                {/* Compose */}
                <button onClick={() => setIsComposeOpen(true)} className="zc-inbox-compose">
                  <span className="zc-inbox-compose-glow" aria-hidden="true" />
                  <Flame size={15} className="zc-inbox-compose-icon" />
                  <span>Compose</span>
                </button>
              </div>
            </header>

            {/* Tabs */}
            <div className="zc-inbox-tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setView(tab.id);
                    setSelectedEmailId(null);
                  }}
                  className={`zc-inbox-tab ${view === tab.id ? 'is-active' : ''}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Email list */}
            <div className="zc-inbox-list">
              {isLoadingInitialData ? (
                <div className="zc-inbox-loading">
                  <span className="zc-inbox-loading-dot" />
                  <span className="zc-inbox-loading-dot" />
                  <span className="zc-inbox-loading-dot" />
                </div>
              ) : isEmpty ? (
                <div className="zc-inbox-empty">
                  <div className="zc-inbox-empty-ring" aria-hidden="true">
                    <Flame size={26} />
                  </div>
                  <p className="zc-inbox-empty-title">Inbox is quiet</p>
                  <p className="zc-inbox-empty-sub">No emails found in this view.</p>
                </div>
              ) : (
                displayEmails.map((email: any) => (
                  <div key={email.id} onClick={() => setSelectedEmailId(email.id)}>
                    <EmailItem email={email} isSelected={selectedEmailId === email.id} />
                  </div>
                ))
              )}

              <div ref={ref} className="zc-inbox-end-sentinel">
                {isLoadingMore && !isLoadingInitialData ? (
                  <div className="zc-inbox-loading">
                    <span className="zc-inbox-loading-dot" />
                    <span className="zc-inbox-loading-dot" />
                    <span className="zc-inbox-loading-dot" />
                  </div>
                ) : isReachingEnd && !isEmpty ? (
                  <p className="zc-inbox-end-text">No more emails</p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Right pane */}
      {selectedEmailId && selectedEmail ? (
        <ReadingPane
          email={selectedEmail}
          onArchive={handleArchive}
          onDelete={handleDelete}
          onReply={handleReply}
          onClose={() => setSelectedEmailId(null)}
        />
      ) : (
        <CalendarSidebar />
      )}

      {isComposeOpen && (
        <ComposeModal
          onClose={() => setIsComposeOpen(false)}
          onSend={handleSend}
          replyTo={replyTo}
        />
      )}
      {isShortcutOverlayOpen && <ShortcutOverlay onClose={() => setIsShortcutOverlayOpen(false)} />}
    </div>
  );
}
