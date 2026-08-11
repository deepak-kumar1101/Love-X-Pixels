import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore, type DocumentData } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { supabase, isSupabaseConfigured } from "./supabase";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
};

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (err) {
    console.warn("Firebase initialization warning (using fallback mode):", err);
  }
}

export { app, auth, db, storage };

/** Mapping collection names to Supabase table names */
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

type StoreRecord = Record<string, unknown> & { id: string };
type SubscriberCallback = (items: StoreRecord[]) => void;

/** In-memory reactive store and listener registry */
const listeners = new Map<string, Set<SubscriberCallback>>();
const memoryStore = new Map<string, StoreRecord[]>();

function getTableName(collectionName: string): string {
  return collectionToTableMap[collectionName] || collectionName.toLowerCase();
}

function loadLocalStore(collectionName: string): StoreRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`lp_store_${collectionName}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // Ignore parse errors
  }
  return [];
}

function saveLocalStore(collectionName: string, items: StoreRecord[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`lp_store_${collectionName}`, JSON.stringify(items));
  } catch (e) {
    // Ignore quota errors
  }
}

function notifySubscribers(collectionName: string, items: StoreRecord[]) {
  memoryStore.set(collectionName, items);
  saveLocalStore(collectionName, items);
  const set = listeners.get(collectionName);
  if (set) {
    set.forEach((cb) => cb(items));
  }
}

/**
 * High-resiliency snapshot & real-time subscriber.
 * Integrates Supabase Realtime + LocalStorage Reactive Cache.
 */
export function subscribeToCollection<T extends { id: string }>(
  collectionName: string,
  fallbackData: T[],
  onData: (items: T[]) => void,
): () => void {
  if (!listeners.has(collectionName)) {
    listeners.set(collectionName, new Set());
  }
  const genericCallback = onData as unknown as SubscriberCallback;
  listeners.get(collectionName)!.add(genericCallback);

  const tableName = getTableName(collectionName);
  const localItems = loadLocalStore(collectionName) as unknown as T[];
  const initialCombined = localItems.length > 0 ? localItems : fallbackData;
  memoryStore.set(collectionName, initialCombined as unknown as StoreRecord[]);
  onData(initialCombined);

  // Fetch latest from Supabase if configured
  if (isSupabaseConfigured) {
    supabase
      .from(tableName)
      .select("*")
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          notifySubscribers(collectionName, data as unknown as StoreRecord[]);
        }
      })
      .catch(() => {});

    // Realtime channel
    const channel = supabase
      .channel(`public:${tableName}`)
      .on("postgres_changes", { event: "*", schema: "public", table: tableName }, async () => {
        const { data } = await supabase.from(tableName).select("*");
        if (data && data.length > 0) {
          notifySubscribers(collectionName, data as unknown as StoreRecord[]);
        }
      })
      .subscribe();

    return () => {
      listeners.get(collectionName)?.delete(genericCallback);
      supabase.removeChannel(channel);
    };
  }

  return () => {
    listeners.get(collectionName)?.delete(genericCallback);
  };
}

/** Real-time Document Add */
export async function addFirestoreDoc<T extends DocumentData>(
  collectionName: string,
  data: T,
): Promise<string> {
  const newId =
    (data.id as string) || `doc_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const newItem = { id: newId, ...data } as StoreRecord;

  const existing = memoryStore.get(collectionName) || loadLocalStore(collectionName);
  const updated = [newItem, ...existing.filter((item) => item.id !== newId)];
  notifySubscribers(collectionName, updated);

  if (isSupabaseConfigured) {
    const tableName = getTableName(collectionName);
    try {
      await supabase.from(tableName).insert(newItem);
    } catch (err) {
      console.warn(`[Supabase Async Insert] Table ${tableName} insert notice:`, err);
    }
  }

  return newId;
}

/** Real-time Document Update */
export async function updateFirestoreDoc<T extends DocumentData>(
  collectionName: string,
  id: string,
  data: Partial<T>,
): Promise<void> {
  const existing = memoryStore.get(collectionName) || loadLocalStore(collectionName);
  const updated = existing.map((item) => (item.id === id ? { ...item, ...data } : item));
  notifySubscribers(collectionName, updated);

  if (isSupabaseConfigured) {
    const tableName = getTableName(collectionName);
    try {
      await supabase.from(tableName).update(data).eq("id", id);
    } catch (err) {
      console.warn(`[Supabase Async Update] Table ${tableName} update notice:`, err);
    }
  }
}

/** Real-time Document Delete */
export async function deleteFirestoreDoc(collectionName: string, id: string): Promise<void> {
  const existing = memoryStore.get(collectionName) || loadLocalStore(collectionName);
  const updated = existing.filter((item) => item.id !== id);
  notifySubscribers(collectionName, updated);

  if (isSupabaseConfigured) {
    const tableName = getTableName(collectionName);
    try {
      await supabase.from(tableName).delete().eq("id", id);
    } catch (err) {
      console.warn(`[Supabase Async Delete] Table ${tableName} delete notice:`, err);
    }
  }
}
