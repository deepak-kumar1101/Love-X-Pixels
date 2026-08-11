import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  type Firestore,
  type DocumentData,
} from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

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

/**
 * High-resiliency snapshot listener.
 * Synchronizes with Firestore if available, otherwise passes initial fallback items.
 */
export function subscribeToCollection<T extends { id: string }>(
  collectionName: string,
  fallbackData: T[],
  onData: (items: T[]) => void,
): () => void {
  if (!db || !isFirebaseConfigured) {
    onData(fallbackData);
    return () => {};
  }

  try {
    const colRef = collection(db, collectionName);
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty) {
          onData(fallbackData);
          return;
        }
        const items: T[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<T, "id">),
        }));
        onData(items);
      },
      (error) => {
        console.warn(`Firestore snapshot error for ${collectionName}, falling back:`, error);
        onData(fallbackData);
      },
    );
    return unsubscribe;
  } catch (err) {
    console.warn(`Error connecting to collection ${collectionName}:`, err);
    onData(fallbackData);
    return () => {};
  }
}

/** Generic Document Add */
export async function addFirestoreDoc<T extends DocumentData>(
  collectionName: string,
  data: T,
): Promise<string> {
  if (!db || !isFirebaseConfigured) {
    console.info(`[Demo Mode] Simulated add to ${collectionName}:`, data);
    return "demo-" + Date.now();
  }
  const colRef = collection(db, collectionName);
  const docRef = await addDoc(colRef, data);
  return docRef.id;
}

/** Generic Document Update */
export async function updateFirestoreDoc<T extends DocumentData>(
  collectionName: string,
  id: string,
  data: Partial<T>,
): Promise<void> {
  if (!db || !isFirebaseConfigured) {
    console.info(`[Demo Mode] Simulated update to ${collectionName}/${id}:`, data);
    return;
  }
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, data as DocumentData);
}

/** Generic Document Delete */
export async function deleteFirestoreDoc(collectionName: string, id: string): Promise<void> {
  if (!db || !isFirebaseConfigured) {
    console.info(`[Demo Mode] Simulated delete from ${collectionName}/${id}`);
    return;
  }
  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
}
