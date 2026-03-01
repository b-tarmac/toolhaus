"use client";

import { useSyncExternalStore } from "react";

const SESSION_KEY = "toolhaus_session_id";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID?.() ?? `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function subscribe() {
  return () => {};
}

function getServerSnapshot() {
  return "";
}

/**
 * Returns a session-persistent ID for anonymous usage tracking.
 * Stored in sessionStorage, generated on first use.
 */
export function useSessionId(): string {
  return useSyncExternalStore(subscribe, getSessionId, getServerSnapshot);
}
