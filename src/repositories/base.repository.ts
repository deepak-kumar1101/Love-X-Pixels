import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export abstract class BaseRepository<T extends { id: string }> {
  protected collectionName: string;
  private cache: Map<string, T> = new Map();

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  /** Convert collectionName (e.g. winnerAnnouncements) to postgres snake_case (e.g. winner_announcements) */
  protected get tableName(): string {
    return this.collectionName.replace(/([A-Z])/g, "_$1").toLowerCase();
  }

  /** Read all documents with offline fallback and in-memory cache */
  async getAll(fallbackData: T[] = []): Promise<T[]> {
    if (!isSupabaseConfigured) {
      return fallbackData;
    }
    try {
      const { data, error } = await supabase.from(this.tableName).select("*");
      if (error || !data || data.length === 0) {
        return fallbackData;
      }
      const items = data.map((item) => {
        const obj = { id: item.id, ...item } as T;
        this.cache.set(item.id, obj);
        return obj;
      });
      return items;
    } catch (err) {
      console.warn(`[BaseRepository] Error fetching ${this.tableName}, using fallback:`, err);
      return fallbackData;
    }
  }

  /** Read document by ID */
  async getById(id: string): Promise<T | null> {
    if (this.cache.has(id)) {
      return this.cache.get(id)!;
    }
    if (!isSupabaseConfigured) {
      return null;
    }
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error || !data) return null;
      const item = { id: data.id, ...data } as T;
      this.cache.set(id, item);
      return item;
    } catch (err) {
      console.warn(`[BaseRepository] Error getting item ${id}:`, err);
      return null;
    }
  }

  /** Create new document */
  async add(item: Omit<T, "id">, customId?: string): Promise<string> {
    const generatedId = customId || crypto.randomUUID();
    const payload = { id: generatedId, ...item };

    if (isSupabaseConfigured) {
      const { error } = await supabase.from(this.tableName).insert(payload);
      if (error)
        console.warn(`[BaseRepository] Error inserting into ${this.tableName}:`, error.message);
    }

    const mockItem = payload as unknown as T;
    this.cache.set(generatedId, mockItem);
    return generatedId;
  }

  /** Update document */
  async update(id: string, data: Partial<Omit<T, "id">>): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from(this.tableName).update(data).eq("id", id);
      if (error)
        console.warn(`[BaseRepository] Error updating ${id} in ${this.tableName}:`, error.message);
    }
    if (this.cache.has(id)) {
      this.cache.set(id, { ...this.cache.get(id)!, ...data });
    }
  }

  /** Delete document */
  async delete(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from(this.tableName).delete().eq("id", id);
      if (error)
        console.warn(
          `[BaseRepository] Error deleting ${id} from ${this.tableName}:`,
          error.message,
        );
    }
    this.cache.delete(id);
  }

  /** Real-time Channel Listener for Supabase PostgreSQL */
  subscribe(fallbackData: T[], onNext: (data: T[]) => void): () => void {
    // Initial fetch
    this.getAll(fallbackData).then((data) => onNext(data));

    if (!isSupabaseConfigured) {
      return () => {};
    }

    const channel = supabase
      .channel(`public:${this.tableName}`)
      .on("postgres_changes", { event: "*", schema: "public", table: this.tableName }, async () => {
        const freshData = await this.getAll(fallbackData);
        onNext(freshData);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}
