/**
 * Firebase has been fully removed — all collections now persist to Supabase.
 *
 * This module re-exports the Supabase-based helpers under their original
 * names so that any route/component still importing from "@/lib/firebase"
 * continues to work without any changes needed at call sites.
 */

export { isSupabaseConfigured as isFirebaseConfigured } from "./supabase";
export {
  subscribeToTable as subscribeToCollection,
  uploadStorageFile,
  deleteStorageFile,
} from "./supabase";

// ─── Firestore-style CRUD shims backed by Supabase ───────────────────────────
import { supabase, isSupabaseConfigured } from "./supabase";

type StoreRecord = Record<string, unknown> & { id: string };

/** Add a document — proxies to Supabase insert */
export async function addFirestoreDoc<T extends StoreRecord>(
  collectionName: string,
  data: T,
): Promise<string> {
  const tableName = toTableName(collectionName);
  const id = (data.id as string) || crypto.randomUUID();
  const payload = { id, ...data };

  if (isSupabaseConfigured) {
    const { error } = await supabase.from(tableName).insert(payload);
    if (error) console.warn(`[Supabase] Insert error on ${tableName}:`, error.message);
  }

  return id;
}

/** Update a document — proxies to Supabase update */
export async function updateFirestoreDoc<T>(
  collectionName: string,
  id: string,
  data: Partial<T>,
): Promise<void> {
  if (!isSupabaseConfigured) return;
  const tableName = toTableName(collectionName);
  const { error } = await supabase
    .from(tableName)
    .update(data as Record<string, unknown>)
    .eq("id", id);
  if (error) console.warn(`[Supabase] Update error on ${tableName}:`, error.message);
}

/** Delete a document — proxies to Supabase delete */
export async function deleteFirestoreDoc(collectionName: string, id: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  const tableName = toTableName(collectionName);
  const { error } = await supabase.from(tableName).delete().eq("id", id);
  if (error) console.warn(`[Supabase] Delete error on ${tableName}:`, error.message);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
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
};

function toTableName(collectionName: string): string {
  return collectionToTableMap[collectionName] ?? collectionName.replace(/([A-Z])/g, "_$1").toLowerCase();
}

// Re-export null Firebase instances so any import of { auth, db, storage } doesn't crash
export { app, auth, db, storage, analytics, appCheck } from "./firebase/config";
