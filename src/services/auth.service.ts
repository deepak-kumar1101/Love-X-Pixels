import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { UserProfile } from "@/models/user.model";
import type { UserRole } from "@/models/rbac.model";
import type { User } from "@supabase/supabase-js";

/** Helper to detect if a Discord user is an Admin (e.g. nyx_str, w.arch, or admin email) */
export function isTargetAdminUser(user: User, username?: string, email?: string): boolean {
  const adminHandles = [
    "nyx_str",
    "w.arch",
    "naitikpatelmadv9725@gmail.com",
    "admin@lovepixels.com",
    (import.meta.env.VITE_ADMIN_EMAIL || "").toLowerCase().trim(),
  ].filter(Boolean);

  const meta = user.user_metadata || {};
  const metaName = (
    (meta["preferred_username"] as string | undefined) ||
    (meta["full_name"] as string | undefined) ||
    (meta["name"] as string | undefined) ||
    ""
  ).toLowerCase();
  const userEmail = (email || user.email || "").toLowerCase();
  const uname = (username || "").toLowerCase();

  return adminHandles.some(
    (handle) =>
      handle.length > 0 &&
      (metaName.includes(handle) || userEmail.includes(handle) || uname.includes(handle)),
  );
}

export class AuthService {
  /** Restore session listener */
  static onAuthChange(
    onUser: (user: User | null, profile: UserProfile | null) => void,
  ): () => void {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const user = session?.user || null;
      if (!user) {
        onUser(null, null);
        return;
      }

      try {
        // Fetch or create user profile in Supabase profiles table
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        const isAdmin = isTargetAdminUser(user, existingProfile?.username, existingProfile?.email);

        let profile: UserProfile;

        if (existingProfile) {
          const currentRoles: string[] = existingProfile.roles || ["Member"];
          if (isAdmin && !currentRoles.includes("Admin")) {
            currentRoles.push("Owner", "Admin");
            await supabase
              .from("profiles")
              .update({ roles: Array.from(new Set(currentRoles)) })
              .eq("id", user.id);
          }

          const userMeta = user.user_metadata || {};
          profile = {
            id: user.id,
            uid: user.id,
            displayName: existingProfile.display_name || "Discord Member",
            username: existingProfile.username || `discord_${user.id.slice(0, 6)}`,
            email: user.email || "",
            avatar: existingProfile.avatar_url || (userMeta["avatar_url"] as string | undefined),
            joinedAt: existingProfile.created_at,
            lastLogin: new Date().toISOString(),
            roles: (isAdmin
              ? Array.from(new Set([...currentRoles, "Owner", "Admin", "Member"]))
              : currentRoles) as UserRole[],
            isVerified: true,
            isBanned: existingProfile.is_banned || false,
            isMuted: false,
            createdAt: existingProfile.created_at,
            updatedAt: new Date().toISOString(),
          };
        } else {
          const userMeta = user.user_metadata || {};
          const metaNameStr =
            (userMeta["full_name"] as string | undefined) ||
            (userMeta["name"] as string | undefined) ||
            user.email?.split("@")[0] ||
            "Discord Member";
          const metaPreferredUsernameStr =
            (userMeta["preferred_username"] as string | undefined) ||
            user.email?.split("@")[0] ||
            `discord_${user.id.slice(0, 6)}`;

          profile = {
            id: user.id,
            uid: user.id,
            displayName: metaNameStr,
            username: metaPreferredUsernameStr.toLowerCase(),
            email: user.email || "",
            avatar: (userMeta["avatar_url"] as string | undefined) || undefined,
            joinedAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            roles: (isAdmin ? ["Owner", "Admin", "Member"] : ["Member"]) as UserRole[],
            isVerified: true,
            isBanned: false,
            isMuted: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          await supabase.from("profiles").upsert({
            id: user.id,
            display_name: profile.displayName,
            username: profile.username,
            email: profile.email,
            avatar_url: profile.avatar,
            roles: profile.roles,
          });
        }

        onUser(user, profile);
      } catch (err) {
        console.warn("[AuthService] Error fetching user profile:", err);
        onUser(user, null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }

  /** Supabase Discord OAuth 1-Click Sign In */
  static async signInWithDiscord(): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "discord",
        options: {
          redirectTo: window.location.origin,
          scopes: "identify email",
        },
      });

      if (error) {
        console.warn("[Supabase Auth] Discord OAuth Redirect Error:", error.message);
        throw error;
      }
    } else {
      // Local fallback mode for instant preview before Supabase keys are pasted in .env
      console.info("[Supabase Auth] Demo Mode: Simulating instant Discord Sign In.");
      const demoEmail = `discord_member_${Date.now().toString().slice(-4)}@lovepixels.com`;
      await supabase.auth.signUp({
        email: demoEmail,
        password: "demo_discord_secret_123",
        options: {
          data: {
            full_name: "nyx_str",
            preferred_username: "nyx_str",
            avatar_url: "https://cdn.discordapp.com/embed/avatars/0.png",
          },
        },
      });
      await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: "demo_discord_secret_123",
      });
    }
  }

  /** Sign Out */
  static async logout(): Promise<void> {
    await supabase.auth.signOut();
  }
}
