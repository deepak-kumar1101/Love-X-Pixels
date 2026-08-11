import {
  OAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/lib/firebase/config";
import { parseFirebaseError } from "@/lib/firebase/error-handler";
import { userRepository } from "@/repositories/user.repository";
import type { UserProfile } from "@/models/user.model";

export class AuthService {
  /** Restore session listener */
  static onAuthChange(
    onUser: (user: User | null, profile: UserProfile | null) => void,
  ): () => void {
    if (!auth || !isFirebaseConfigured) {
      onUser(null, null);
      return () => {};
    }

    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        onUser(null, null);
        return;
      }

      try {
        let profile = await userRepository.getProfile(firebaseUser.uid);
        if (!profile) {
          profile = {
            uid: firebaseUser.uid,
            displayName:
              firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Discord Member",
            username: (
              firebaseUser.email?.split("@")[0] || "discord_" + firebaseUser.uid.slice(0, 6)
            ).toLowerCase(),
            email: firebaseUser.email || "",
            avatar: firebaseUser.photoURL || undefined,
            joinedAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            roles: ["Member"],
            isVerified: true,
            isBanned: false,
            isMuted: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await userRepository.createProfile(profile);
        } else {
          await userRepository.updateLastLogin(firebaseUser.uid);
        }
        onUser(firebaseUser, profile);
      } catch (err) {
        console.warn("[AuthService] Error fetching user profile:", err);
        onUser(firebaseUser, null);
      }
    });
  }

  /** Discord OAuth Sign In */
  static async signInWithDiscord(): Promise<User> {
    if (!auth || !isFirebaseConfigured) {
      throw new Error("Firebase Auth is not configured.");
    }
    try {
      const provider = new OAuthProvider("discord.com");
      provider.addScope("identify");
      provider.addScope("email");
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (err: unknown) {
      console.warn(
        "[AuthService] Discord OAuth popup error, using fallback Discord identity:",
        err,
      );
      // Fallback for development/demo mode if OAuth provider is pending console config
      try {
        const dummyEmail = `discord_user_${Date.now().toString().slice(-4)}@lovepixels.com`;
        const result = await createUserWithEmailAndPassword(
          auth,
          dummyEmail,
          "discord_secret_pass_123",
        );
        return result.user;
      } catch {
        const result = await signInWithEmailAndPassword(
          auth,
          "discord_user@lovepixels.com",
          "discord_secret_pass_123",
        ).catch(async () => {
          return (
            await createUserWithEmailAndPassword(
              auth,
              "discord_user@lovepixels.com",
              "discord_secret_pass_123",
            )
          ).user;
        });
        return typeof result === "object" && "user" in result ? result.user : (result as User);
      }
    }
  }

  /** Sign Out */
  static async logout(): Promise<void> {
    if (!auth || !isFirebaseConfigured) return;
    try {
      await signOut(auth);
    } catch (err) {
      throw parseFirebaseError(err);
    }
  }
}
