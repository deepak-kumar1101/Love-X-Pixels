/**
 * Firebase compatibility shims backed by Supabase + Instant Local & Realtime Persistence Engine.
 *
 * This module ensures:
 * 1. Image uploads never fail with "Bucket not found" (graceful Data URL fallback).
 * 2. Adding/editing events, staff, winners, gallery, partners, and reviews instantly updates
 *    the UI and persists locally as well as syncing with Supabase.
 */

import { supabase, isSupabaseConfigured, uploadStorageFile, deleteStorageFile } from "./supabase";

export { isSupabaseConfigured as isFirebaseConfigured, uploadStorageFile, deleteStorageFile };

type StoreRecord = Record<string, unknown> & { id: string };

const collectionToTableMap: Record<string, string> = {
  staff: "staff",
  events: "events",
  payouts: "payouts",
  gallery: "gallery",
  partners: "partners",
  reviews: "reviews",
  announcements: "announcements",
  rewardClaims: "reward_claims",
  winnerAnnouncements: "winner_announcements",
  visitorLogs: "visitor_logs",
  auditLogs: "audit_logs",
  settings: "settings",
  partnerRequests: "partner_requests",
};

export function toTableName(collectionName: string): string {
  return collectionToTableMap[collectionName] ?? collectionName.replace(/([A-Z])/g, "_$1").toLowerCase();
}

// ─── Realtime & LocalStorage Persistence Engine ─────────────────────────────

type Listener<T> = (data: T[]) => void;
const activeListeners = new Map<string, Set<Listener<any>>>();
const memoryStore = new Map<string, StoreRecord[]>();

// Track active Supabase realtime channels — ONE per collection to avoid
// the "cannot add postgres_changes callbacks after subscribe()" error
const activeChannels = new Map<string, ReturnType<typeof supabase.channel>>();

function getLocalStorageKey(collectionName: string): string {
  return `lovepixels_db_${collectionName}`;
}

export function loadLocalItems<T extends StoreRecord>(collectionName: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(getLocalStorageKey(collectionName));
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn(`[LocalStore] Read error on ${collectionName}:`, err);
  }
  return [];
}

export function saveLocalItems<T extends StoreRecord>(collectionName: string, items: T[]): void {
  memoryStore.set(collectionName, items);
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getLocalStorageKey(collectionName), JSON.stringify(items));
  } catch (err) {
    console.warn(`[LocalStore] Write error on ${collectionName}:`, err);
  }
}

export function getCollectionItems<T extends StoreRecord>(collectionName: string, fallbackData: T[] = []): T[] {
  if (memoryStore.has(collectionName)) {
    const mem = memoryStore.get(collectionName) as T[];
    if (mem && mem.length > 0) return mem;
  }

  const stored = loadLocalItems<T>(collectionName);
  if (stored && stored.length > 0) {
    memoryStore.set(collectionName, stored);
    return stored;
  }

  return fallbackData;
}

function notifySubscribers<T extends StoreRecord>(collectionName: string, currentItems: T[]) {
  const listeners = activeListeners.get(collectionName);
  if (listeners) {
    listeners.forEach((cb) => {
      try {
        cb(currentItems);
      } catch (err) {
        console.warn(`[LocalStore] Listener error on ${collectionName}:`, err);
      }
    });
  }
}

/**
 * Subscribe to collection updates (combines fallback data, local user additions & Supabase real-time dataset)
 */
export function subscribeToCollection<T extends StoreRecord>(
  collectionName: string,
  fallbackData: T[],
  onData: (data: T[]) => void,
): () => void {
  const tableName = toTableName(collectionName);

  // Register this listener
  if (!activeListeners.has(collectionName)) {
    activeListeners.set(collectionName, new Set());
  }
  activeListeners.get(collectionName)!.add(onData);

  // 1. Instantly deliver current items (local user additions + fallbackData)
  const initialItems = getCollectionItems<T>(collectionName, fallbackData);
  onData(initialItems);

  // 2. Fetch remote Supabase dataset if configured (only runs in browser)
  if (isSupabaseConfigured && typeof window !== "undefined") {
    // Fire-and-forget fetch for initial remote data
    supabase
      .from(tableName)
      .select("*")
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const remoteItems = data as unknown as T[];
          const localUserItems = loadLocalItems<T>(collectionName);

          const mergedMap = new Map<string, T>();
          fallbackData.forEach((item) => mergedMap.set(item.id, item));
          localUserItems.forEach((item) => mergedMap.set(item.id, item));
          remoteItems.forEach((item) => mergedMap.set(item.id, item));

          const mergedList = Array.from(mergedMap.values());
          saveLocalItems(collectionName, mergedList);
          notifySubscribers(collectionName, mergedList);
        }
      })
      .catch(() => {/* silent — no Supabase tables is fine */});

    // Only create ONE realtime channel per collection — reuse if already exists
    if (!activeChannels.has(collectionName)) {
      try {
        const channel = supabase
          .channel(`tsr_${tableName}`)
          .on("postgres_changes", { event: "*", schema: "public", table: tableName }, async () => {
            try {
              const { data } = await supabase.from(tableName).select("*");
              if (data && data.length > 0) {
                const remoteItems = data as unknown as T[];
                const localUserItems = loadLocalItems<T>(collectionName);
                const mergedMap = new Map<string, T>();

                localUserItems.forEach((item) => mergedMap.set(item.id, item));
                remoteItems.forEach((item) => mergedMap.set(item.id, item));

                const mergedList = Array.from(mergedMap.values());
                saveLocalItems(collectionName, mergedList);
                notifySubscribers(collectionName, mergedList);
              }
            } catch {/* silent */}
          })
          .subscribe();
        activeChannels.set(collectionName, channel);
      } catch (err) {
        console.warn(`[Supabase] Channel setup error for ${collectionName}:`, err);
      }
    }
  }

  // Return unsubscribe function — only removes this listener; channel stays alive for other subscribers
  return () => {
    activeListeners.get(collectionName)?.delete(onData);

    // Clean up channel only when no listeners remain
    if (activeListeners.get(collectionName)?.size === 0) {
      const ch = activeChannels.get(collectionName);
      if (ch) {
        supabase.removeChannel(ch).catch(() => {});
        activeChannels.delete(collectionName);
      }
    }
  };
}

/** Add a document — updates local storage + memory + notifies subscribers + proxies to Supabase */
export async function addFirestoreDoc<T extends StoreRecord>(
  collectionName: string,
  data: T,
): Promise<string> {
  const tableName = toTableName(collectionName);
  const id = (data.id as string) || crypto.randomUUID();
  const payload = { ...data, id };

  // 1. Instantly update local store and notify subscribers
  const existing = getCollectionItems<T>(collectionName, []);
  const updated = [payload as T, ...existing.filter((item) => item.id !== id)];
  saveLocalItems(collectionName, updated);
  notifySubscribers(collectionName, updated);

  // 2. Insert into Supabase in background
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from(tableName).insert(payload);
      if (error) {
        console.warn(`[Supabase] Insert notice on ${tableName}:`, error.message);
      }
    } catch {/* silent */}
  }

  return id;
}

/** Update a document — updates local storage + memory + notifies subscribers + proxies to Supabase */
export async function updateFirestoreDoc<T extends StoreRecord>(
  collectionName: string,
  id: string,
  data: Partial<T>,
): Promise<void> {
  const tableName = toTableName(collectionName);

  // 1. Instantly update local store and notify subscribers (with UPSERT support)
  const existing = getCollectionItems<T>(collectionName, []);
  const foundIndex = existing.findIndex((item) => item.id === id);
  let updated: T[];
  if (foundIndex >= 0) {
    updated = existing.map((item) => (item.id === id ? ({ ...item, ...data } as T) : item));
  } else {
    updated = [{ id, ...data } as unknown as T, ...existing];
  }
  saveLocalItems(collectionName, updated);
  notifySubscribers(collectionName, updated);

  // 2. Update Supabase in background
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from(tableName)
        .update(data as Record<string, unknown>)
        .eq("id", id);
      if (error) {
        console.warn(`[Supabase] Update notice on ${tableName}:`, error.message);
      }
    } catch {/* silent */}
  }
}

/** Delete a document — updates local storage + memory + notifies subscribers + proxies to Supabase */
export async function deleteFirestoreDoc(collectionName: string, id: string): Promise<void> {
  const tableName = toTableName(collectionName);

  // 1. Instantly update local store and notify subscribers
  const existing = getCollectionItems(collectionName, []);
  const updated = existing.filter((item) => item.id !== id);
  saveLocalItems(collectionName, updated);
  notifySubscribers(collectionName, updated);

  // 2. Delete from Supabase in background
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from(tableName).delete().eq("id", id);
      if (error) {
        console.warn(`[Supabase] Delete notice on ${tableName}:`, error.message);
      }
    } catch {/* silent */}
  }
}

// Re-export null Firebase instances so any import of { auth, db, storage } doesn't crash
export { app, auth, db, storage, analytics, appCheck } from "./firebase/config";
