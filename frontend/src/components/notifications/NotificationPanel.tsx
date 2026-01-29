'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Trash2,
  Info,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
} from 'lucide-react';
import {
  useNotifications,
  type Notification,
  type NotificationType,
} from '@/contexts/NotificationContext';

const TYPE_CONFIG: Record<
  NotificationType,
  { icon: typeof Info; color: string; bg: string }
> = {
  info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50' },
  success: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  warning: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
  error: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
};

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function NotificationItem({
  notification,
  onMarkRead,
  onRemove,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const config = TYPE_CONFIG[notification.type];
  const Icon = config.icon;

  return (
    <div
      className={`flex items-start gap-3 p-3 border-b border-slate-100 transition-colors ${
        notification.read ? 'bg-white' : 'bg-slate-50'
      }`}
    >
      <div className={`p-1.5 rounded-lg ${config.bg} mt-0.5`}>
        <Icon className={`w-4 h-4 ${config.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`text-sm font-medium ${notification.read ? 'text-slate-600' : 'text-slate-900'}`}>
            {notification.title}
          </p>
          {!notification.read && (
            <div className="w-2 h-2 bg-violet-600 rounded-full flex-shrink-0" />
          )}
        </div>
        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
          {notification.message}
        </p>
        <p className="text-xs text-slate-400 mt-1">{formatTimeAgo(notification.timestamp)}</p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        {!notification.read && (
          <button
            onClick={() => onMarkRead(notification.id)}
            className="p-1 text-slate-400 hover:text-violet-600 rounded transition-colors"
            title="Mark as read"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={() => onRemove(notification.id)}
          className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors"
          title="Remove"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export function NotificationPanel() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  } = useNotifications();

  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-bold text-white bg-violet-600 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel dropdown */}
      {open && (
        <div className="absolute right-0 top-12 w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
            <h3 className="text-sm font-semibold text-slate-900">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 text-xs font-normal text-slate-500">
                  ({unreadCount} unread)
                </span>
              )}
            </h3>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="p-1.5 text-slate-400 hover:text-violet-600 rounded-lg transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                  title="Clear all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Notification list */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No notifications yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  You&apos;ll see alerts about evaluations, score changes, and system events here
                </p>
              </div>
            ) : (
              notifications.map(n => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onMarkRead={markAsRead}
                  onRemove={removeNotification}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
