/**
 * NotificationPanel.tsx
 * Popover notification panel — triggered by the bell icon.
 *
 * Design: Fameuxarte premium/minimal. Quiet, not social-media-noisy.
 * Groups notifications by Today / Yesterday / Earlier.
 * Each item: mark as read on click + deep-link navigation.
 */

import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, ArrowRight, Loader2 } from 'lucide-react';
import { isToday, isYesterday } from 'date-fns';
import { cn } from '@/lib/utils';
import { type Notification } from '@/lib/notifications';
import { NotificationItem } from './NotificationItem';
import { trackEvent } from '@/lib/analytics';

interface NotificationPanelProps {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClose: () => void;
}

type Group = { label: string; items: Notification[] };

function groupNotifications(notifications: Notification[]): Group[] {
  const today: Notification[] = [];
  const yesterday: Notification[] = [];
  const earlier: Notification[] = [];

  for (const n of notifications) {
    const d = new Date(n.created_at);
    if (isToday(d)) today.push(n);
    else if (isYesterday(d)) yesterday.push(n);
    else earlier.push(n);
  }

  const groups: Group[] = [];
  if (today.length)     groups.push({ label: 'Today',     items: today });
  if (yesterday.length) groups.push({ label: 'Yesterday', items: yesterday });
  if (earlier.length)   groups.push({ label: 'Earlier',   items: earlier });
  return groups;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  unreadCount,
  isLoading,
  onMarkAsRead,
  onMarkAllAsRead,
  onClose,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  // Focus trap — move focus into panel when it opens
  useEffect(() => {
    panelRef.current?.focus();
    trackEvent('notification_panel_opened', { unread_count: unreadCount });
  }, [unreadCount]);

  const groups = groupNotifications(notifications.slice(0, 10)); // Show max 10 in panel

  return (
    <div
      ref={panelRef}
      tabIndex={-1}
      role="dialog"
      aria-label="Notifications"
      aria-modal="false"
      className={cn(
        'absolute right-0 top-full mt-2 z-[200]',
        'w-[360px] max-w-[calc(100vw-16px)]',
        'rounded-[12px] border border-border-subtle',
        'bg-surface-1 shadow-2xl shadow-black/40',
        'flex flex-col overflow-hidden',
        'animate-in fade-in-0 slide-in-from-top-2 duration-200'
      )}
      style={{ maxHeight: 'min(520px, 80vh)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-faint flex-shrink-0">
        <h2 className="text-[13px] font-semibold text-linen tracking-wide">
          Notifications
        </h2>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => {
              onMarkAllAsRead();
              trackEvent('notification_marked_all_read');
            }}
            className="flex items-center gap-1.5 text-[11px] text-stone hover:text-gold transition-colors"
            aria-label="Mark all notifications as read"
          >
            <Check className="w-3 h-3" />
            Mark all read
          </button>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto" role="list" aria-label="Notification list">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 text-stone animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="w-12 h-12 rounded-full bg-surface-3 flex items-center justify-center mb-3">
              <Bell className="w-5 h-5 text-stone opacity-40" />
            </div>
            <p className="text-[13px] font-medium text-stone">You're all caught up</p>
            <p className="text-[11px] text-[#555] mt-1">
              Important updates will appear here.
            </p>
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.label} role="group" aria-label={group.label}>
              <p className="px-4 pt-3 pb-1 text-[10px] font-medium uppercase tracking-wider text-[#555]">
                {group.label}
              </p>
              {group.items.map((n) => (
                <div key={n.id} role="listitem">
                  <NotificationItem
                    notification={n}
                    onRead={(id) => {
                      onMarkAsRead(id);
                      trackEvent('notification_clicked', {
                        notification_id: id,
                        type: n.type,
                      });
                      onClose();
                    }}
                    compact
                  />
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="flex-shrink-0 border-t border-border-faint px-4 py-2.5">
          <Link
            to="/collector/notifications"
            onClick={onClose}
            className="flex items-center justify-center gap-1.5 text-[12px] text-stone hover:text-gold transition-colors w-full"
          >
            View all notifications
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}
    </div>
  );
};
