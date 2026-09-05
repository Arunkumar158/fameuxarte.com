/**
 * NotificationItem.tsx
 * Single notification row for both the panel and the full notifications page.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Truck,
  CheckCircle,
  CreditCard,
  AlertCircle,
  RotateCcw,
  MessageSquare,
  ShieldCheck,
  UserCheck,
  UserX,
  ShoppingBag,
  Banknote,
  Bell,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  type Notification,
  type NotificationIcon,
  getNotificationIcon,
  getNotificationUrl,
} from '@/lib/notifications';

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
  compact?: boolean;
}

const ICON_MAP: Record<NotificationIcon, React.FC<{ className?: string }>> = {
  'package': Package,
  'truck': Truck,
  'check-circle': CheckCircle,
  'credit-card': CreditCard,
  'alert-circle': AlertCircle,
  'rotate-ccw': RotateCcw,
  'message-square': MessageSquare,
  'shield-check': ShieldCheck,
  'user-check': UserCheck,
  'user-x': UserX,
  'shopping-bag': ShoppingBag,
  'banknote': Banknote,
  'bell': Bell,
};

const PRIORITY_COLORS: Record<string, string> = {
  normal:    'text-stone',
  important: 'text-amber-400',
  urgent:    'text-red-400',
};

const ICON_BG: Record<string, string> = {
  normal:    'bg-surface-3',
  important: 'bg-amber-400/10',
  urgent:    'bg-red-400/10',
};

const ICON_COLOR: Record<string, string> = {
  normal:    'text-gold',
  important: 'text-amber-400',
  urgent:    'text-red-400',
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onRead,
  compact = false,
}) => {
  const navigate = useNavigate();
  const iconKey = getNotificationIcon(notification.type);
  const IconComponent = ICON_MAP[iconKey] ?? Bell;
  const priority = notification.priority ?? 'normal';
  const url = getNotificationUrl(notification.type, notification.metadata);

  const handleClick = () => {
    if (!notification.read) {
      onRead(notification.id);
    }
    if (url) {
      navigate(url);
    }
  };

  const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
  });

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'w-full text-left flex items-start gap-3 rounded-[8px] transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50',
        compact ? 'px-3 py-2.5 hover:bg-surface-3' : 'px-4 py-3.5 hover:bg-surface-2',
        !notification.read && 'bg-gold/[0.04]'
      )}
      aria-label={`${notification.read ? '' : 'Unread: '}${notification.title}`}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex-shrink-0 flex items-center justify-center rounded-full',
          compact ? 'w-8 h-8' : 'w-9 h-9',
          ICON_BG[priority]
        )}
      >
        <IconComponent
          className={cn(
            compact ? 'w-3.5 h-3.5' : 'w-4 h-4',
            ICON_COLOR[priority]
          )}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              'text-[13px] font-medium leading-snug truncate',
              notification.read ? 'text-stone' : 'text-linen'
            )}
          >
            {notification.title}
          </p>
          {/* Unread dot */}
          {!notification.read && (
            <span
              className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-gold"
              aria-hidden="true"
            />
          )}
        </div>
        <p
          className={cn(
            'text-[12px] leading-relaxed mt-0.5',
            notification.read ? 'text-[#555]' : 'text-stone'
          )}
          style={{
            display: '-webkit-box',
            WebkitLineClamp: compact ? 1 : 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {notification.message}
        </p>
        <p
          className={cn(
            'text-[11px] mt-1',
            PRIORITY_COLORS[priority] === 'text-stone' ? 'text-[#555]' : PRIORITY_COLORS[priority]
          )}
        >
          {timeAgo}
        </p>
      </div>
    </button>
  );
};
