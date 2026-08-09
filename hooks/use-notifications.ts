"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  NOTIFICATION_STREAM_URL,
  notificationsApi,
} from "@/lib/api/notifications";
import { TUNNEL_HEADERS } from "@/lib/tunnel-headers";
import { useAuthStore } from "@/store/auth-store";

const KEY = ["notifications"] as const;
const UNREAD_KEY = ["notifications", "unread-count"] as const;

/**
 * How often the badge refetches on its own.
 *
 * This is the actual delivery guarantee, not a fallback. The stream below only
 * shortens the wait: the API is reached through a public tunnel whose behaviour
 * with long-lived connections is unverified, so a missed push must cost latency
 * and nothing else.
 */
const POLL_MS = 45_000;

export function useUnreadCount() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: UNREAD_KEY,
    queryFn: () => notificationsApi.unreadCount(),
    enabled: !!accessToken,
    refetchInterval: POLL_MS,
    // A tab left open in the background is exactly where a missed order sits, so
    // keep counting even when it is not focused.
    refetchIntervalInBackground: true,
    staleTime: 0,
  });
}

export function useNotifications(enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: KEY,
    queryFn: () => notificationsApi.list(1, 20),
    enabled: enabled && !!accessToken,
    refetchInterval: POLL_MS,
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notificationsApi.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: UNREAD_KEY });
    },
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: UNREAD_KEY });
    },
  });
}

/**
 * Opens the SSE stream and invalidates on each nudge, so a new order shows up
 * without waiting out the poll interval.
 *
 * The event carries no payload: it only says "something changed", and the
 * queries above remain the single source of truth for what the bell shows.
 * Every failure path here is silent by design - if the stream never connects,
 * or the tunnel buffers it into uselessness, the polling above still delivers.
 */
export function useNotificationStream() {
  const qc = useQueryClient();
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (!accessToken) return;

    // fetch + ReadableStream rather than EventSource: EventSource cannot set an
    // Authorization header, and the alternative is putting a bearer token in a
    // query string where it lands in every access log. The chat client already
    // streams this way, so this is the house pattern rather than a new one.
    const controller = new AbortController();

    const run = async () => {
      let res: Response;
      try {
        res = await fetch(NOTIFICATION_STREAM_URL, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            ...TUNNEL_HEADERS,
          },
          signal: controller.signal,
        });
      } catch {
        return; // no stream; the polling above still delivers
      }
      if (!res.ok || !res.body) return;

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let sep: number;
          while ((sep = buffer.indexOf("\n\n")) !== -1) {
            const block = buffer.slice(0, sep);
            buffer = buffer.slice(sep + 2);
            // The event carries no payload - it only says "something changed",
            // so the queries stay the single source of truth for the bell.
            if (block.includes("event:notification") || block.includes("event: notification")) {
              qc.invalidateQueries({ queryKey: KEY });
              qc.invalidateQueries({ queryKey: UNREAD_KEY });
            }
          }
        }
      } catch {
        // Aborted on unmount, or the tunnel dropped it. Either way the poll
        // interval is the guarantee, so there is nothing to recover.
      }
    };

    void run();
    return () => controller.abort();
  }, [accessToken, qc]);
}
