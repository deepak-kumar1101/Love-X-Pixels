import { createClient } from "@supabase/supabase-js";

// Retrieve environment variables and sanitize base project URL
const rawUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
const SUPABASE_URL = rawUrl.replace(/\/auth\/v1\/callback\/?$/, "").replace(/\/$/, "");
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured =
  Boolean(import.meta.env.VITE_SUPABASE_URL) && Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY);

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/** Real-time subscription helper for Supabase PostgreSQL tables */
export function subscribeToTable<T>(
  table: string,
  fallbackData: T[],
  onData: (data: T[]) => void,
): () => void {
  // Fetch initial dataset
  supabase
    .from(table)
    .select("*")
    .then(
      ({ data, error }) => {
        if (error || !data || data.length === 0) {
          onData(fallbackData);
        } else {
          onData(data as unknown as T[]);
        }
      },
      () => {
        onData(fallbackData);
      },
    );

  // Subscribe to real-time changes
  const channel = supabase
    .channel(`public:${table}`)
    .on("postgres_changes", { event: "*", schema: "public", table }, async () => {
      const { data } = await supabase.from(table).select("*");
      if (data && data.length > 0) {
        onData(data as unknown as T[]);
      }
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/** Storage File Upload helper for Supabase Storage */
export async function uploadStorageFile(bucket: string, path: string, file: File): Promise<string> {
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
  });

  if (error) {
    console.warn(`[Supabase Storage] Upload error:`, error.message);
    throw error;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/** Storage File Deletion helper */
export async function deleteStorageFile(bucket: string, path: string): Promise<void> {
  await supabase.storage.from(bucket).remove([path]);
}
