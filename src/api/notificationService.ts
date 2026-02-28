import { apiGet, apiPatch } from '../config/base';
import { endPoints } from '../config/endPoint';

export function getPortalRedirectUrl(url?: string | null): string | null {
    if (!url) return null;
    const cleaned = url.replace(/^\/(partner|platform|client)/, '');
    try {
        const dummyBase = 'http://localhost';
        const parsedUrl = new URL(cleaned, dummyBase);
        const path = parsedUrl.pathname;

        if (path === '/library') {
            return cleaned.replace('/library', '/dashboard/global-library');
        }

        if (path.startsWith('/dashboard')) return cleaned;

        if (path.startsWith('/')) {
            return `/dashboard${cleaned}`;
        }
    } catch (e) {
        return cleaned;
    }
    return cleaned;
}

export interface Notification {
    id: string;
    userId: string;
    role: string;
    type: string;
    title: string;
    content: string;
    redirectUrl: string | null;
    ctaUrl: string | null;
    isRead: boolean;
    createdAt: string;
    channels: string[];
    emailStatus: string | null;
}

export interface NotificationPreference {
    emailEnabled: boolean;
    inAppEnabled: boolean;
    pushEnabled: boolean;
    soundEnabled: boolean;
}

export interface FetchNotificationsResponse {
    items: Notification[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export const notificationService = {
    fetchNotifications: async (filters?: { page?: number; limit?: number; isRead?: boolean }) => {
        try {
            const response = await apiGet<any>(endPoints.NOTIFICATION.BASE, filters);
            const rawData = response?.data ?? response;
            const rawItems = Array.isArray(rawData) ? rawData : (rawData?.items ?? []);
            const mappedItems = rawItems.map((notif: Notification) => ({
                ...notif,
                redirectUrl: getPortalRedirectUrl(notif.redirectUrl ?? null)
            }));

            return {
                items: mappedItems,
                meta: rawData?.meta ?? response?.meta ?? { total: 0, page: 1, limit: 10, totalPages: 0 }
            } as FetchNotificationsResponse;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    },

    fetchUnreadCount: async () => {
        try {
            const response = await apiGet<any>(endPoints.NOTIFICATION.UNREAD_COUNT);
            const data = response?.data ?? response;
            return { count: data?.count ?? 0 };
        } catch (error) {
            console.error('Error fetching unread count:', error);
            throw error;
        }
    },

    markAsRead: async (id: string) => {
        try {
            return await apiPatch(endPoints.NOTIFICATION.MARK_READ(id));
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    },

    markAllAsRead: async () => {
        try {
            return await apiPatch(endPoints.NOTIFICATION.MARK_ALL_READ);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    },

    getPreferences: async () => {
        try {
            return await apiGet<any>(endPoints.NOTIFICATION.PREFERENCES);
        } catch (error) {
            console.error('Error fetching notification preferences:', error);
            throw error;
        }
    },

    updatePreferences: async (data: any) => {
        try {
            return await apiPatch(endPoints.NOTIFICATION.PREFERENCES, data);
        } catch (error) {
            console.error('Error updating notification preferences:', error);
            throw error;
        }
    }
};
