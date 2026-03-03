import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    notificationService, 
    type Notification 
} from '../../api/notificationService';
import PageHeader from './PageHeader';
import { Button } from '../../ui/Button';
import { Skeleton } from '../../ui/Skeleton';
import { ShadowCard } from '../../ui/ShadowCard';
import { useSSE } from '../../hooks/useSSE';
import { Bell, CheckCheck, Filter, AlertCircle, MessageSquare, Calendar } from 'lucide-react';

interface NotificationItemProps {
    notification: Notification;
    onMarkAsRead: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkAsRead }) => {
    const isRead = notification.isRead;
    const navigate = useNavigate();

    const getIcon = () => {
        switch (notification.type) {
            case 'chat_message':
                return <MessageSquare className="h-5 w-5 text-blue-500" />;
            case 'meeting_scheduled':
            case 'meeting_updated':
                return <Calendar className="h-5 w-5 text-purple-500" />;
            case 'error':
            case 'meeting_canceled':
                return <AlertCircle className="h-5 w-5 text-red-500" />;
            default:
                return <Bell className="h-5 w-5 text-gray-500" />;
        }
    };

    const handleClick = () => {
        if (!isRead) {
            onMarkAsRead(notification.id);
        }
        if (notification.redirectUrl) {
            navigate(notification.redirectUrl);
        }
    };

    return (
        <ShadowCard 
            className={`p-4 mb-4 border border-gray-100 rounded-2xl transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer ${
                isRead ? 'bg-white' : 'bg-primary/5 border-primary/20'
            }`}
            onClick={handleClick}
        >
            <div className="flex gap-4">
                <div
                    className={`mt-1 rounded-2xl shadow-sm flex items-center justify-center ${
                        isRead ? 'bg-gray-50' : 'bg-white'
                    }`}
                    style={{ height: 72, width: 32 }}
                >
                    {getIcon()}
                </div>
                <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                            <h4 className={`font-semibold text-sm text-gray-900 ${isRead ? 'opacity-80' : ''}`}>
                                {notification.title}
                            </h4>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-gray-100 text-gray-500">
                                    {notification.type.replace(/_/g, ' ')}
                                </span>
                                {!isRead && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-primary text-white">
                                        New
                                    </span>
                                )}
                            </div>
                        </div>
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                            {new Date(notification.createdAt).toLocaleString()}
                        </span>
                    </div>
                    <p className={`text-sm leading-relaxed text-gray-600 ${isRead ? 'opacity-70' : ''}`}>
                        {notification.content}
                    </p>
                    <div className="flex items-center gap-4 pt-1">
                        {notification.ctaUrl && (
                            <button 
                                className="text-[11px] font-semibold text-primary uppercase tracking-widest hover:underline"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(notification.ctaUrl!, '_blank');
                                }}
                            >
                                View details
                            </button>
                        )}
                        {isRead && (
                            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                                Read
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </ShadowCard>
    );
};

export default function Notifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [showUnreadOnly, setShowUnreadOnly] = useState<boolean>(false);

    const { notifications: sseNotifications } = useSSE();

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const response = await notificationService.fetchNotifications({
                page: currentPage,
                limit: 10,
                isRead: showUnreadOnly ? false : undefined,
            });
            setNotifications(response.items);
            setTotalPages(response.meta.totalPages);
        } catch (err) {
            console.error('Error fetching notifications:', err);
        } finally {
            setLoading(false);
        }
    }, [currentPage, showUnreadOnly]);

    const fetchUnreadCount = useCallback(async () => {
        try {
            const response = await notificationService.fetchUnreadCount();
            setUnreadCount(response.count);
        } catch (err) {
            console.error('Error fetching unread count:', err);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        fetchUnreadCount();
    }, [fetchNotifications, fetchUnreadCount]);

    useEffect(() => {
        if (sseNotifications.length > 0) {
            fetchNotifications();
            fetchUnreadCount();
        }
    }, [sseNotifications, fetchNotifications, fetchUnreadCount]);

    const handleMarkAsRead = async (id: string) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications((prev) =>
                prev.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif))
            );
            fetchUnreadCount();
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    };

    const handleMarkAllAsRead = async () => {
        if (unreadCount === 0) return;
        try {
            await notificationService.markAllAsRead();
            setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Error marking all as read:', err);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader 
                title="Notifications"
                icon={Bell}
                description={
                    unreadCount > 0 
                        ? `You have ${unreadCount} unread notifications.` 
                        : 'You’re all caught up. We’ll keep you posted here.'
                }
            />

            <ShadowCard className="flex flex-col md:flex-row items-center justify-between gap-3 p-4 border border-gray-100 rounded-2xl bg-white">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-200">
                        <Bell className="h-4 w-4 text-primary" />
                        <span className="text-[11px] font-semibold text-gray-700 uppercase tracking-widest">
                            {unreadCount} Unread
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <Button 
                            variant={showUnreadOnly ? 'default' : 'ghost'} 
                            size="sm"
                            onClick={() => {
                                setShowUnreadOnly(true);
                                setCurrentPage(1);
                            }}
                            className="rounded-2xl px-4"
                        >
                            <Filter className="h-4 w-4 mr-2" />
                            Unread
                        </Button>
                        <Button 
                            variant={!showUnreadOnly ? 'default' : 'ghost'} 
                            size="sm"
                            onClick={() => {
                                setShowUnreadOnly(false);
                                setCurrentPage(1);
                            }}
                            className="rounded-2xl px-4"
                        >
                            All
                        </Button>
                    </div>
                </div>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleMarkAllAsRead}
                    disabled={unreadCount === 0}
                    className="text-primary hover:text-primary hover:bg-primary/10 rounded-2xl px-4"
                >
                    <CheckCheck className="h-4 w-4 mr-2" />
                    Mark all as read
                </Button>
            </ShadowCard>

            <div className="min-h-[400px]">
                {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="mb-4">
                            <Skeleton className="h-24 w-full rounded-2xl" />
                        </div>
                    ))
                ) : notifications.length > 0 ? (
                    notifications.map((notif) => (
                        <NotificationItem 
                            key={notif.id} 
                            notification={notif} 
                            onMarkAsRead={handleMarkAsRead}
                        />
                    ))
                ) : (
                    <ShadowCard className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-gray-200 bg-gray-50/60 rounded-3xl">
                        <div className="bg-white p-4 rounded-2xl shadow-sm mb-4">
                            <Bell className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No notifications yet</h3>
                        <p className="text-gray-500 max-w-xs mx-auto mt-1 text-sm">
                            When you receive alerts or updates from your team, they’ll appear here.
                        </p>
                    </ShadowCard>
                )}
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 pt-4">
                    <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1 || loading}
                        className="rounded-2xl px-5"
                    >
                        Previous
                    </Button>
                    <span className="text-sm font-bold text-gray-500">
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages || loading}
                        className="rounded-2xl px-5"
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}
