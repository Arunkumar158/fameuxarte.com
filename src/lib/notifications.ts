/**
 * notifications.ts
 * Fameuxarte Notification Service — V1
 *
 * Central, typed notification service. All notification creation, reading,
 * and marking should go through this module. This makes it trivially easy
 * to add email, push, or AI notifications in V2 without touching callers.
 *
 * Field mapping note:
 *   DB column: `read`    (boolean) — NOT `is_read`
 *   DB column: `read_at` (timestamptz, nullable) — added in V1 migration
 *   DB column: `priority` (text: 'normal' | 'important' | 'urgent')
 */

import { supabase } from "@/integrations/supabase/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type NotificationType =
  // Customer
  | 'ORDER_CONFIRMED'
  | 'ORDER_SHIPPED'
  | 'ORDER_DELIVERED'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'REFUND_PROCESSED'
  | 'SUPPORT_REPLY'
  | 'SUPPORT_STATUS'
  | 'CERTIFICATE_READY'
  // Artist
  | 'ARTIST_APPLICATION_RECEIVED'
  | 'ARTIST_APPLICATION_APPROVED'
  | 'ARTIST_APPLICATION_REJECTED'
  | 'ARTIST_APPLICATION_SUSPENDED'
  | 'NEW_ORDER'
  | 'PAYMENT_RELEASED'
  // Artist & Customer (legacy lowercase — kept for backward compat)
  | 'new_order'
  | 'order_accepted'
  | 'order_shipped'
  | 'order_delivered'
  | 'order_cancelled'
  | 'payment_failed'
  | 'high_value_sale'
  // Support
  | 'support_update'
  | 'support_status'
  // Generic
  | string;

export type NotificationPriority = 'normal' | 'important' | 'urgent';

export interface NotificationMetadata {
  order_id?: string;
  order_item_id?: string;
  artwork_id?: string;
  ticket_id?: string;
  ticket_number?: string;
  certificate_id?: string;
  certificate_number?: string;
  artist_id?: string;
  url?: string;
  event_id?: string;      // for idempotency
  [key: string]: unknown;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  read_at: string | null;
  priority: NotificationPriority;
  metadata: NotificationMetadata | null;
  created_at: string;
}

export interface NotifyUserParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  metadata?: NotificationMetadata;
  /** @deprecated Use metadata.url for deep-linking instead */
  emailHtml?: string;
  emailTo?: string;
  emailSubject?: string;
}

export interface GetNotificationsParams {
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
}

// ---------------------------------------------------------------------------
// Core: Create a notification
// ---------------------------------------------------------------------------

/**
 * Create a notification for a single user.
 * This is the canonical function — all code should call this instead of
 * inserting directly into `supabase.from('notifications')`.
 */
export const notifyUser = async (params: NotifyUserParams): Promise<boolean> => {
  try {
    const { error: dbError } = await supabase.from('notifications').insert({
      user_id: params.userId,
      title: params.title,
      message: params.message,
      type: params.type,
      priority: params.priority ?? 'normal',
      metadata: params.metadata ?? {},
    });

    if (dbError) {
      console.error('[notifications] Insert failed:', dbError.message);
      return false;
    }

    // Optional email delivery (V2: move to Edge Function)
    if (params.emailHtml && params.emailTo && params.emailSubject) {
      const { error: emailError } = await supabase.functions.invoke('send-email', {
        body: {
          to: params.emailTo,
          subject: params.emailSubject,
          html: params.emailHtml,
        },
      });
      if (emailError) {
        console.error('[notifications] Email send failed:', emailError.message);
        // Don't return false — DB insert succeeded
      }
    }

    return true;
  } catch (err) {
    console.error('[notifications] notifyUser error:', err);
    return false;
  }
};

/**
 * Legacy alias — kept for backward compatibility with existing callers
 * (artist/OrderDetails.tsx uses sendNotification).
 */
export const sendNotification = async (params: {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  priority?: NotificationPriority;
  metadata?: NotificationMetadata;
  emailHtml?: string;
  emailTo?: string;
  emailSubject?: string;
}): Promise<boolean> => notifyUser(params);

// ---------------------------------------------------------------------------
// Read: Fetch notifications
// ---------------------------------------------------------------------------

/**
 * Fetch paginated notifications for the current authenticated user.
 */
export const getUserNotifications = async ({
  limit = 20,
  offset = 0,
  unreadOnly = false,
}: GetNotificationsParams = {}): Promise<{
  data: Notification[];
  count: number;
  error: string | null;
}> => {
  try {
    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (unreadOnly) {
      query = query.eq('read', false);
    }

    const { data, error, count } = await query;

    if (error) {
      return { data: [], count: 0, error: error.message };
    }

    return { data: (data as Notification[]) ?? [], count: count ?? 0, error: null };
  } catch (err: any) {
    return { data: [], count: 0, error: err?.message ?? 'Unknown error' };
  }
};

/**
 * Get the count of unread notifications for the current user.
 * Uses an efficient COUNT query (no data fetched).
 */
export const getUnreadNotificationCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('read', false);

    if (error) {
      console.error('[notifications] Unread count error:', error.message);
      return 0;
    }

    return count ?? 0;
  } catch {
    return 0;
  }
};

// ---------------------------------------------------------------------------
// Write: Mark as read
// ---------------------------------------------------------------------------

/**
 * Mark a single notification as read.
 * The DB trigger auto-sets `read_at = now()`.
 */
export const markNotificationRead = async (notificationId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .eq('read', false); // Only update if currently unread (avoid wasted writes)

    if (error) {
      console.error('[notifications] markNotificationRead error:', error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

/**
 * Mark ALL notifications as read for the current authenticated user.
 */
export const markAllNotificationsRead = async (): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('read', false);

    if (error) {
      console.error('[notifications] markAllNotificationsRead error:', error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

// ---------------------------------------------------------------------------
// Deep-link helper
// ---------------------------------------------------------------------------

/**
 * Derive the destination URL from a notification's type + metadata.
 * Returns null if no link is determinable.
 */
export const getNotificationUrl = (
  type: NotificationType,
  metadata?: NotificationMetadata | null
): string | null => {
  // Explicit URL in metadata always wins
  if (metadata?.url) return metadata.url as string;

  switch (type) {
    case 'ORDER_CONFIRMED':
    case 'ORDER_SHIPPED':
    case 'ORDER_DELIVERED':
    case 'PAYMENT_SUCCESS':
    case 'PAYMENT_FAILED':
    case 'order_accepted':
    case 'order_shipped':
    case 'order_delivered':
    case 'new_order':
    case 'payment_failed':
      if (metadata?.order_id) return `/collector/orders`;
      return '/collector/orders';

    case 'CERTIFICATE_READY':
      if (metadata?.certificate_id) return `/collector/certificates`;
      return '/collector/certificates';

    case 'SUPPORT_REPLY':
    case 'SUPPORT_STATUS':
    case 'support_update':
    case 'support_status':
      if (metadata?.ticket_id) return `/collector/support/${metadata.ticket_id}`;
      return '/collector/support';

    case 'ARTIST_APPLICATION_APPROVED':
    case 'ARTIST_APPLICATION_RECEIVED':
      return '/artist/verification';

    case 'ARTIST_APPLICATION_REJECTED':
    case 'ARTIST_APPLICATION_SUSPENDED':
      return '/artist/verification';

    case 'NEW_ORDER':
      if (metadata?.order_item_id) return `/artist/orders/${metadata.order_item_id}`;
      return '/artist/orders';

    case 'PAYMENT_RELEASED':
      return '/artist/orders';

    case 'REFUND_PROCESSED':
      return '/collector/orders';

    default:
      return '/collector/notifications';
  }
};

// ---------------------------------------------------------------------------
// Icon / visual helpers
// ---------------------------------------------------------------------------

export type NotificationIcon =
  | 'package'
  | 'truck'
  | 'check-circle'
  | 'credit-card'
  | 'alert-circle'
  | 'rotate-ccw'
  | 'message-square'
  | 'shield-check'
  | 'user-check'
  | 'user-x'
  | 'shopping-bag'
  | 'banknote'
  | 'bell';

export const getNotificationIcon = (type: NotificationType): NotificationIcon => {
  switch (type) {
    case 'ORDER_CONFIRMED':
    case 'new_order':
    case 'NEW_ORDER':
      return 'package';
    case 'ORDER_SHIPPED':
    case 'order_shipped':
      return 'truck';
    case 'ORDER_DELIVERED':
    case 'order_delivered':
    case 'order_accepted':
      return 'check-circle';
    case 'PAYMENT_SUCCESS':
      return 'credit-card';
    case 'PAYMENT_FAILED':
    case 'payment_failed':
      return 'alert-circle';
    case 'REFUND_PROCESSED':
      return 'rotate-ccw';
    case 'SUPPORT_REPLY':
    case 'SUPPORT_STATUS':
    case 'support_update':
    case 'support_status':
      return 'message-square';
    case 'CERTIFICATE_READY':
      return 'shield-check';
    case 'ARTIST_APPLICATION_APPROVED':
    case 'ARTIST_APPLICATION_RECEIVED':
      return 'user-check';
    case 'ARTIST_APPLICATION_REJECTED':
    case 'ARTIST_APPLICATION_SUSPENDED':
      return 'user-x';
    case 'PAYMENT_RELEASED':
    case 'high_value_sale':
      return 'banknote';
    case 'order_cancelled':
      return 'alert-circle';
    default:
      return 'bell';
  }
};
