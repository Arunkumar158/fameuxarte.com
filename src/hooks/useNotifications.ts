/**
 * useNotifications.ts
 * React hook for the Fameuxarte Notification System V1.
 *
 * Features:
 * - Paginated notification fetching
 * - Unread count
 * - Supabase Realtime subscription for live updates
 * - Mark one / mark all as read
 * - Auto-cleanup on unmount
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  getUserNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
  type Notification,
} from '@/lib/notifications';
import { trackEvent } from '@/lib/analytics';

const PAGE_SIZE = 20;

interface UseNotificationsOptions {
  /** Auto-subscribe to realtime updates (default: true) */
  realtime?: boolean;
  /** Only fetch unread notifications (default: false) */
  unreadOnly?: boolean;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useNotifications(
  options: UseNotificationsOptions = {}
): UseNotificationsReturn {
  const { realtime = true, unreadOnly = false } = options;
  const { user } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // ------------------------------------------------------------------
  // Fetch helpers
  // ------------------------------------------------------------------

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    const count = await getUnreadNotificationCount();
    setUnreadCount(count);
  }, [user]);

  const fetchInitial = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const { data, count } = await getUserNotifications({
      limit: PAGE_SIZE,
      offset: 0,
      unreadOnly,
    });
    setNotifications(data);
    setTotalCount(count);
    setOffset(PAGE_SIZE);
    setIsLoading(false);
    await fetchUnreadCount();
  }, [user, unreadOnly, fetchUnreadCount]);

  // ------------------------------------------------------------------
  // Initial load & re-load on user change
  // ------------------------------------------------------------------
  useEffect(() => {
    fetchInitial();
  }, [fetchInitial]);

  // ------------------------------------------------------------------
  // Supabase Realtime subscription
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!user || !realtime) return;

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications((prev) => [newNotification, ...prev]);
          setTotalCount((c) => c + 1);
          setUnreadCount((c) => c + 1);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const updated = payload.new as Notification;
          setNotifications((prev) =>
            prev.map((n) => (n.id === updated.id ? updated : n))
          );
          // Recount unread from local state
          setUnreadCount((c) => {
            const wasUnread = !payload.old.read;
            const isNowRead = updated.read;
            if (wasUnread && isNowRead) return Math.max(0, c - 1);
            return c;
          });
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [user, realtime]);

  // ------------------------------------------------------------------
  // Actions
  // ------------------------------------------------------------------

  const loadMore = useCallback(async () => {
    if (!user || offset >= totalCount) return;
    const { data } = await getUserNotifications({
      limit: PAGE_SIZE,
      offset,
      unreadOnly,
    });
    setNotifications((prev) => [...prev, ...data]);
    setOffset((o) => o + PAGE_SIZE);
  }, [user, offset, totalCount, unreadOnly]);

  const markAsRead = useCallback(
    async (id: string) => {
      await markNotificationRead(id);
      trackEvent('notification_marked_read', { notification_id: id });
      // Optimistic update — realtime subscription will confirm
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, read: true, read_at: new Date().toISOString() } : n
        )
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    },
    []
  );

  const markAllAsRead = useCallback(async () => {
    await markAllNotificationsRead();
    trackEvent('notification_marked_all_read');
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true, read_at: n.read_at ?? new Date().toISOString() }))
    );
    setUnreadCount(0);
  }, []);

  const refetch = useCallback(async () => {
    await fetchInitial();
  }, [fetchInitial]);

  // ------------------------------------------------------------------
  // Derived
  // ------------------------------------------------------------------
  const hasMore = offset < totalCount;

  return {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    loadMore,
    markAsRead,
    markAllAsRead,
    refetch,
  };
}
