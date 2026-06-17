'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Inbox,
  Calendar,
  Bot,
  Settings,
  List,
  LogOut,
  LayoutGrid,
  Flame,
  Box,
  User,
  ChevronDown,
  Mic,
  type LucideIcon,
} from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import '@/styles/side.css';
export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [sidebarWidth, setSidebarWidth] = useState(220);

  const navigation: { name: string; href: string; icon: LucideIcon; badge?: string }[] = [
    { name: 'Inbox', href: '/inbox', icon: Inbox },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Voice Agent (Soon...)', href: '/digest', icon: Mic },
    { name: 'Agent', href: '/agent', icon: Bot },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  // Extract user initials
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <aside style={{ width: sidebarWidth }} className="zc-sidebar ">
      {/* Ambient fire/smoke layers */}
      <div className="zc-sidebar-bg  " aria-hidden="true">
        <div className="zc-smoke zc-smoke-1" />
        <div className="zc-smoke zc-smoke-2" />
        <div className="zc-smoke zc-smoke-3" />
        <div className="zc-fire-glow" />
        <div className="zc-fire-base" />
        <span className="zc-ember zc-ember-1" />
        <span className="zc-ember zc-ember-2" />
        <span className="zc-ember zc-ember-3" />
        <span className="zc-ember zc-ember-4" />
        <span className="zc-ember zc-ember-5" />
      </div>

      {/* Resize Handle */}
      <div
        className="zc-resize-handle"
        onMouseDown={(e) => {
          e.preventDefault();
          const startX = e.clientX;
          const startWidth = sidebarWidth;
          const onMouseMove = (moveEvent: MouseEvent) => {
            setSidebarWidth(
              Math.max(200, Math.min(400, startWidth + (moveEvent.clientX - startX)))
            );
          };
          const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.body.style.cursor = 'default';
          };
          document.addEventListener('mousemove', onMouseMove);
          document.addEventListener('mouseup', onMouseUp);
          document.body.style.cursor = 'col-resize';
        }}
      />

      {/* Brand */}
      <div className="zc-brand">
        <div className="zc-brand-icon">
          <Flame className="zc-brand-flame" />
          <span className="zc-brand-icon-glow" />
        </div>
        <span className="zc-brand-text">ZeroClick</span>
      </div>

      {/* Navigation */}
      <nav className="zc-nav">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`zc-nav-item ${isActive ? 'is-active' : ''}`}
            >
              {isActive && <span className="zc-nav-active-bar" />}
              <Icon className="zc-nav-icon" />
              <span className="zc-nav-label">{item.name}</span>
              {item.badge && <span className="zc-nav-badge">{item.badge}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Flame visual spacer (where the fire glow sits in the reference) */}
      <div className="zc-flame-spacer" aria-hidden="true" />

      {/* User card */}
      <div className="zc-user-card" onClick={logout} role="button" tabIndex={0}>
        <div className="zc-user-avatar">
          {initials}
          <span className="zc-user-avatar-glow" />
        </div>
        <div className="zc-user-info">
          <p className="zc-user-name">{user?.name || 'Cleans'}</p>
          <p className="zc-user-email">{user?.email || 'aali1100@gmail.com'}</p>
        </div>
        <ChevronDown className="zc-user-chevron" />
      </div>
    </aside>
  );
}
