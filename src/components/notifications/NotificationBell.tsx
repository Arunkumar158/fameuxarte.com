/**
 * NotificationBell.tsx
 * Header bell icon with unread count badge and panel toggle.
 *
 * - Accessible: aria-label updates with unread count
 * - Premium/minimal: subtle gold dot, not a loud red badge
 * - Works in Navbar (public), CollectorLayout, and ArtistLayout headers
 */

import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationPanel } from './NotificationPanel';

interface NotificationBellProps {
  /** Tailwind classes applied to the button */
  className?: string;
  /** Icon size variant */
  size?: 'sm' | 'md';
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  className,
  size = 'md',
}) => {
  const [panelOpen, setPanelOpen] = useState(false);
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } =
    useNotifications({ realtime: true });

  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-[18px] h-[18px]';
  const btnSize = size === 'sm' ? 'h-8 w-8' : 'h-9 w-9 sm:h-10 sm:w-10';

  const ariaLabel =
    unreadCount > 0
      ? `Notifications, ${unreadCount} unread`
      : 'Notifications';

  return (
    <div className="relative">
      <button
        type="button"
        id="notification-bell-btn"
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={panelOpen}
        onClick={() => setPanelOpen((prev) => !prev)}
        className={cn(
          'relative flex items-center justify-center rounded-full',
          'text-white/70 hover:text-white',
          'transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50',
          btnSize,
          className
        )}
      >
        <Bell className={cn(iconSize, 'transition-transform duration-200 group-hover:scale-110')} />

        {/* Unread badge — subtle gold dot with count */}
        {unreadCount > 0 && (
          <span
            className={cn(
              'absolute -top-0.5 -right-0.5',
              'flex items-center justify-center',
              'rounded-full bg-gold text-obsidian font-bold',
              'border border-obsidian',
              unreadCount > 9
                ? 'min-w-[18px] h-[18px] text-[9px] px-1'
                : 'w-[16px] h-[16px] text-[9px]'
            )}
            aria-hidden="true"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {panelOpen && (
        <NotificationPanel
          notifications={notifications}
          unreadCount={unreadCount}
          isLoading={isLoading}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onClose={() => setPanelOpen(false)}
        />
      )}
    </div>
  );
};
