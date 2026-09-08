/**
 * Notifications.tsx (Collector)
 * Full-page notification center — replaces the "Coming Soon" stub.
 *
 * Features:
 * - All / Unread tabs
 * - Paginated (load more)
 * - Per-item icon, title, message, timestamp, unread state, deep-link
 * - Mark all as read
 * - Premium empty state
 */

import React, { useState } from 'react';
import { Bell, Check, Loader2, RefreshCcw } from 'lucide-react';
import { isToday, isYesterday, format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import { type Notification } from '@/lib/notifications';
import { trackEvent } from '@/lib/analytics';
import { cn } from '@/lib/utils';

type Tab = 'all' | 'unread';

type Group = { label: string; items: Notification[] };

function groupByDate(notifications: Notification[]): Group[] {
  const today: Notification[] = [];
  const yesterday: Notification[] = [];
  const byDate: Record<string, Notification[]> = {};

  for (const n of notifications) {
    const d = new Date(n.created_at);
    if (isToday(d))     today.push(n);
    else if (isYesterday(d)) yesterday.push(n);
    else {
      const key = format(d, 'MMMM d, yyyy');
      if (!byDate[key]) byDate[key] = [];
      byDate[key].push(n);
    }
  }

  const groups: Group[] = [];
  if (today.length)     groups.push({ label: 'Today',     items: today });
  if (yesterday.length) groups.push({ label: 'Yesterday', items: yesterday });
  for (const [label, items] of Object.entries(byDate)) {
    groups.push({ label, items });
  }
  return groups;
}

const NotificationsPage: React.FC = () => {
  const [tab, setTab] = useState<Tab>('all');

  const all = useNotifications({ realtime: true, unreadOnly: false });
  const unreadHook = useNotifications({ realtime: false, unreadOnly: true });

  const active = tab === 'all' ? all : unreadHook;
  const { notifications, unreadCount, isLoading, hasMore, loadMore, markAsRead, markAllAsRead, refetch } = active;

  const groups = groupByDate(notifications);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-[28px] font-medium text-linen tracking-tight">
          Notifications
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            className="p-2 rounded-full text-stone hover:text-linen hover:bg-surface-3 transition-colors"
            aria-label="Refresh notifications"
            title="Refresh"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="text-stone border-border-subtle hover:bg-surface-2 hover:text-linen rounded-full text-[12px] h-8"
              onClick={() => {
                markAllAsRead();
                trackEvent('notification_marked_all_read', { source: 'notifications_page' });
              }}
            >
              <Check className="w-3 h-3 mr-1.5" />
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border-faint">
        {(['all', 'unread'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2.5 text-[13px] font-medium transition-colors relative',
              tab === t
                ? 'text-linen'
                : 'text-stone hover:text-linen'
            )}
          >
            {t === 'all' ? 'All' : 'Unread'}
            {t === 'unread' && unreadCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-gold text-obsidian text-[9px] font-bold min-w-[16px] h-4 px-1">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
            {tab === t && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-stone animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 mb-5 rounded-full bg-surface-2 border border-border-subtle flex items-center justify-center">
            <Bell className="w-7 h-7 text-stone opacity-40" />
          </div>
          <h2 className="text-[18px] font-medium text-linen mb-2">
            {tab === 'unread' ? 'No unread notifications' : "You're all caught up"}
          </h2>
          <p className="text-stone text-[13px] max-w-sm">
            {tab === 'unread'
              ? 'All your notifications have been read. Switch to All to see your history.'
              : 'Important updates about your orders, certificates, and account will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="px-1 pb-2 text-[11px] font-medium uppercase tracking-wider text-[#555]">
                {group.label}
              </p>
              <div className="rounded-[10px] border border-border-faint bg-surface-1 overflow-hidden divide-y divide-border-faint">
                {group.items.map((n) => (
                  <NotificationItem
                    key={n.id}
                    notification={n}
                    onRead={(id) => {
                      markAsRead(id);
                      trackEvent('notification_clicked', {
                        notification_id: id,
                        type: n.type,
                        source: 'notifications_page',
                      });
                    }}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Load more */}
          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                size="sm"
                className="text-stone border-border-subtle hover:bg-surface-2 hover:text-linen rounded-full text-[12px]"
                onClick={loadMore}
              >
                Load more
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
