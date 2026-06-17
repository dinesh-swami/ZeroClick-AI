import { format, isToday } from 'date-fns';
import { Calendar, Sparkles, Check, Star } from 'lucide-react';
import React, { useState } from 'react';
import '@/styles/EmailItem.css';

interface Email {
  id: string;
  subject: string;
  body: string;
  from: string;
  date: string;
  priorityLevel: string | null;
  isRead: boolean;
}

export default function EmailItem({ email, isSelected }: { email: Email; isSelected?: boolean }) {
  const [isSummaryVisible, setIsSummaryVisible] = useState(true);

  // Extract name and initials
  const senderMatch = email.from.match(/^([^<]+)</);
  const senderName = senderMatch ? senderMatch[1].trim() : email.from;
  const initials =
    senderName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';

  // Format date
  const emailDate = new Date(email.date);
  const timeString = isToday(emailDate) ? format(emailDate, 'h:mm a') : format(emailDate, 'MMM d');

  // Preview logic
  const previewText = email.body.replace(/<[^>]*>/g, '').slice(0, 150);

  // Fake logo assignment for UI showcase based on sender name length
  const getAvatarStyle = () => {
    const len = senderName.length;
    if (len % 4 === 0) return { bg: 'zc-avatar-red', text: '' };
    if (len % 4 === 1) return { bg: 'zc-avatar-amber', text: '' };
    if (len % 4 === 2) return { bg: 'zc-avatar-green', text: '' };
    return { bg: 'zc-avatar-coal', text: '' };
  };
  const avatarStyle = getAvatarStyle();

  // Mock AI summary data specific to the request
  const isWebinar =
    senderName.toLowerCase().includes('scaler') || email.subject.toLowerCase().includes('webinar');
  const isInvite = email.subject.toLowerCase().includes('invite');
  const hasActionCard = isWebinar || isInvite || email.priorityLevel === 'URGENT';

  let mockSummary = '';
  let actionButton = 'Add to Calendar';
  let isAdded = false;

  if (isWebinar) {
    mockSummary =
      "Reminder for today's 4PM webinar on scaling strategies. Zoom link and session agenda included.";
  } else if (isInvite) {
    mockSummary =
      "You're invited to an exclusive event. Come mingle, share insights, and hear mini-pitches.";
    actionButton = 'Added to Calendar';
    isAdded = true;
  } else if (email.priorityLevel === 'URGENT') {
    mockSummary = 'This email requires your immediate attention regarding project blocking issues.';
  }

  return (
    <div
      className={`zc-email ${isSelected ? 'is-selected' : ''} ${
        email.isRead ? 'is-read' : 'is-unread'
      }`}
    >
      {/* Ambient fire reflection */}
      <span className="zc-email-glow" aria-hidden="true" />
      <span className="zc-email-bar" aria-hidden="true" />

      {/* Checkbox */}
      <div className="zc-email-check-wrap">
        <div
          className="zc-email-check"
          onClick={(e) => e.stopPropagation()}
          role="checkbox"
          aria-checked={!!isSelected}
        >
          {isSelected && <Check className="zc-email-check-icon" />}
        </div>
      </div>

      <div className="zc-email-main">
        {/* Top row: avatar + sender + time */}
        <div className="zc-email-top">
          <div className="zc-email-sender">
            <div className={`zc-email-avatar ${avatarStyle.bg}`}>
              <span className="zc-email-avatar-glow" />
              <span className="zc-email-avatar-text">{initials}</span>
            </div>
            <span className="zc-email-name">
              {senderName}
              {!email.isRead && <span className="zc-email-unread-dot" />}
            </span>
          </div>
          <span className="zc-email-time">{timeString}</span>
        </div>

        {/* Subject */}
        <p className="zc-email-subject">{email.subject}</p>

        {/* Preview */}
        <p className="zc-email-preview">{previewText}</p>

        {/* AI Summary card */}
        {hasActionCard && isSummaryVisible && (
          <div className="zc-email-summary-wrap">
            <div className="zc-email-summary">
              <span className="zc-email-summary-glow" />
              <Sparkles className="zc-email-summary-icon" />
              <p className="zc-email-summary-text">{mockSummary}</p>
            </div>
          </div>
        )}

        {/* Action buttons */}
        {hasActionCard && (
          <div className="zc-email-actions">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsSummaryVisible(!isSummaryVisible);
              }}
              className="zc-email-btn"
            >
              <Sparkles className="zc-email-btn-icon" />
              {isSummaryVisible ? 'Hide Summary' : 'View Summary'}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
              }}
              className={`zc-email-btn ${isAdded ? 'is-added' : ''}`}
            >
              {isAdded ? (
                <Check className="zc-email-btn-icon" />
              ) : (
                <Calendar className="zc-email-btn-icon" />
              )}
              {actionButton}
            </button>
          </div>
        )}
      </div>

      {/* Star button */}
      <button
        type="button"
        className="zc-email-star"
        onClick={(e) => e.stopPropagation()}
        aria-label="Star email"
      >
        <Star className="zc-email-star-icon" />
      </button>
    </div>
  );
}
