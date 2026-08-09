/**
 * The notification bell.
 *
 * Polling is the delivery mechanism and the SSE stream is an accelerator on top
 * of it: the API is reached through a public tunnel whose behaviour with
 * long-lived streams is unverified, and a design where a buffered stream loses a
 * notification would defeat the point of having one.
 */
import { api, API_BASE_URL } from "../api";
import type { AppNotification, PageResponse } from "@/types/api";

export const notificationsApi = {
  list(page = 1, size = 20) {
    return api.get<PageResponse<AppNotification>>(
      `/api/notifications?page=${page}&size=${size}`,
    );
  },

  unreadCount() {
    return api.get<number>("/api/notifications/unread-count");
  },

  markRead(id: number) {
    return api.post<void>(`/api/notifications/${id}/read`);
  },

  markAllRead() {
    return api.post<number>("/api/notifications/read-all");
  },
};

export const NOTIFICATION_STREAM_URL = `${API_BASE_URL}/api/notifications/stream`;
