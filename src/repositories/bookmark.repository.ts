import { BaseRepository } from "./base.repository";
import type { UserBookmark } from "@/models/gamification.model";

export class BookmarkRepository extends BaseRepository<UserBookmark> {
  constructor() {
    super("bookmarks");
  }

  async addBookmark(
    uid: string,
    targetCollection: UserBookmark["targetCollection"],
    targetId: string,
  ): Promise<string> {
    return this.add({
      uid,
      targetCollection,
      targetId,
      createdAt: new Date().toISOString(),
    });
  }

  async removeBookmark(id: string): Promise<void> {
    return this.delete(id);
  }
}

export const bookmarkRepository = new BookmarkRepository();
