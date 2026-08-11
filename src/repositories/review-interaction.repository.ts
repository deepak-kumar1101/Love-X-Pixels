import { updateFirestoreDoc } from "@/lib/firebase";

export class ReviewInteractionRepository {
  /** Increment review likes count */
  static async likeReview(reviewId: string, currentLikes = 0): Promise<void> {
    return updateFirestoreDoc("reviews", reviewId, {
      likes: currentLikes + 1,
    });
  }

  /** Flag or report review for moderation */
  static async reportReview(reviewId: string): Promise<void> {
    return updateFirestoreDoc("reviews", reviewId, {
      isReported: true,
    });
  }
}
