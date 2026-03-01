import { apiGet, apiPatch } from '../config/base';
import { endPoints } from '../config/endPoint';

/**
 * Converts backend notification redirect/cta URLs to Platform Portal routes.
 * Ensures returned path always starts with "/" so React Router navigate() works.
 */
export function getPortalRedirectUrl(url?: string | null): string | null {
    if (!url || typeof url !== 'string') return null;
    const trimmed = url.trim();
    if (!trimmed) return null;

    // Strip portal prefix if present (e.g. /platform/... or /client/...)
    const cleaned = trimmed.replace(/^\/(partner|platform|client)\/?/, '');
    const withLeadingSlash = cleaned.startsWith('/') ? cleaned : `/${cleaned}`;

    try {
        const dummyBase = 'http://localhost';
        const parsedUrl = new URL(withLeadingSlash, dummyBase);
        const path = parsedUrl.pathname;

        if (path === '/library') {
            return '/dashboard/global-library';
        }

        if (path.startsWith('/dashboard')) {
            return withLeadingSlash;
        }

        // Map backend paths to Platform Portal routes (backend often sends /compliance/:id, etc.)
        const complianceMatch = path.match(/^\/compliance\/([^/]+)\/?$/);
        if (complianceMatch) {
            return `/dashboard/compliance/${complianceMatch[1]}/edit`;
        }
        if (path === '/compliance' || path === '/compliance/') {
            return '/dashboard/compliance';
        }

        const noticeMatch = path.match(/^\/notice-management\/([^/]+)\/?$/);
        if (noticeMatch) {
            return `/dashboard/notice-management/${noticeMatch[1]}/edit`;
        }

        const engagementMatch = path.match(/^\/engagements?\/([^/]+)\/?$/);
        if (engagementMatch) {
            return `/dashboard/engagements`;
        }

        // Generic: prefix with /dashboard for paths like /something/...
        if (path.startsWith('/')) {
            return `/dashboard${path}`;
        }

        return `/dashboard/${path}`;
    } catch {
        return withLeadingSlash.startsWith('/') ? withLeadingSlash : `/${withLeadingSlash}`;
    }
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
                redirectUrl: getPortalRedirectUrl(notif.redirectUrl ?? notif.ctaUrl ?? null)
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
            const count = typeof data?.count === 'number' ? data.count : (data?.data?.count ?? 0);
            return { count };
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
