import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  type DocumentData,
  type QueryConstraint,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/config";
import { withRetry, parseFirebaseError, type AppError } from "@/lib/firebase/error-handler";

export abstract class BaseRepository<T extends { id: string }> {
  protected collectionName: string;
  private cache: Map<string, T> = new Map();

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  /** Read all documents with offline fallback and in-memory cache */
  async getAll(fallbackData: T[] = []): Promise<T[]> {
    if (!db || !isFirebaseConfigured) {
      return fallbackData;
    }
    try {
      return await withRetry(async () => {
        const colRef = collection(db!, this.collectionName);
        const snapshot = await getDocs(colRef);
        if (snapshot.empty) return fallbackData;

        const items: T[] = snapshot.docs.map((docSnap) => {
          const item = { id: docSnap.id, ...(docSnap.data() as Omit<T, "id">) } as T;
          this.cache.set(docSnap.id, item);
          return item;
        });
        return items;
      });
    } catch (err) {
      console.warn(`[BaseRepository] Error fetching ${this.collectionName}, using fallback:`, err);
      return fallbackData;
    }
  }

  /** Read document by ID */
  async getById(id: string): Promise<T | null> {
    if (this.cache.has(id)) {
      return this.cache.get(id)!;
    }
    if (!db || !isFirebaseConfigured) {
      return null;
    }
    try {
      return await withRetry(async () => {
        const docRef = doc(db!, this.collectionName, id);
        const snapshot = await getDoc(docRef);
        if (!snapshot.exists()) return null;

        const item = { id: snapshot.id, ...(snapshot.data() as Omit<T, "id">) } as T;
        this.cache.set(id, item);
        return item;
      });
    } catch (err) {
      throw parseFirebaseError(err);
    }
  }

  /** Create new document */
  async add(item: Omit<T, "id">, customId?: string): Promise<string> {
    if (!db || !isFirebaseConfigured) {
      const generatedId = customId || "demo-" + Date.now();
      const mockItem = { id: generatedId, ...item } as unknown as T;
      this.cache.set(generatedId, mockItem);
      return generatedId;
    }
    try {
      return await withRetry(async () => {
        if (customId) {
          const docRef = doc(db!, this.collectionName, customId);
          await setDoc(docRef, item as DocumentData);
          this.cache.set(customId, { id: customId, ...item } as unknown as T);
          return customId;
        } else {
          const colRef = collection(db!, this.collectionName);
          const docRef = await addDoc(colRef, item as DocumentData);
          this.cache.set(docRef.id, { id: docRef.id, ...item } as unknown as T);
          return docRef.id;
        }
      });
    } catch (err) {
      throw parseFirebaseError(err);
    }
  }

  /** Update document */
  async update(id: string, data: Partial<Omit<T, "id">>): Promise<void> {
    if (!db || !isFirebaseConfigured) {
      if (this.cache.has(id)) {
        this.cache.set(id, { ...this.cache.get(id)!, ...data });
      }
      return;
    }
    try {
      await withRetry(async () => {
        const docRef = doc(db!, this.collectionName, id);
        await updateDoc(docRef, data as DocumentData);
        if (this.cache.has(id)) {
          this.cache.set(id, { ...this.cache.get(id)!, ...data });
        }
      });
    } catch (err) {
      throw parseFirebaseError(err);
    }
  }

  /** Delete document */
  async delete(id: string): Promise<void> {
    if (!db || !isFirebaseConfigured) {
      this.cache.delete(id);
      return;
    }
    try {
      await withRetry(async () => {
        const docRef = doc(db!, this.collectionName, id);
        await deleteDoc(docRef);
        this.cache.delete(id);
      });
    } catch (err) {
      throw parseFirebaseError(err);
    }
  }

  /** Firestore Realtime Snapshot Listener */
  subscribe(
    fallbackData: T[],
    onNext: (data: T[]) => void,
    onError?: (error: AppError) => void,
  ): () => void {
    if (!db || !isFirebaseConfigured) {
      onNext(fallbackData);
      return () => {};
    }

    try {
      const colRef = collection(db, this.collectionName);
      return onSnapshot(
        colRef,
        (snapshot) => {
          if (snapshot.empty) {
            onNext(fallbackData);
            return;
          }
          const items: T[] = snapshot.docs.map((docSnap) => {
            const item = { id: docSnap.id, ...(docSnap.data() as Omit<T, "id">) } as T;
            this.cache.set(docSnap.id, item);
            return item;
          });
          onNext(items);
        },
        (err) => {
          const parsed = parseFirebaseError(err);
          console.warn(
            `[BaseRepository] Listener warning for ${this.collectionName}:`,
            parsed.message,
          );
          if (onError) onError(parsed);
          onNext(fallbackData);
        },
      );
    } catch (err) {
      if (onError) onError(parseFirebaseError(err));
      onNext(fallbackData);
      return () => {};
    }
  }

  /** Query documents with filters */
  async queryWhere(
    field: string,
    op: "==" | "<" | "<=" | ">" | ">=" | "array-contains",
    value: unknown,
  ): Promise<T[]> {
    if (!db || !isFirebaseConfigured) return [];
    try {
      return await withRetry(async () => {
        const colRef = collection(db!, this.collectionName);
        const q = query(colRef, where(field, op, value));
        const snapshot = await getDocs(q);
        return snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<T, "id">),
        })) as T[];
      });
    } catch (err) {
      throw parseFirebaseError(err);
    }
  }
}
