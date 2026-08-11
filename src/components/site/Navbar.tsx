import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import {
  Menu,
  X,
  LogIn,
  LogOut,
  ShieldCheck,
  User as UserIcon,
  Search,
  Bell,
  Sun,
  Moon,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Magnetic } from "@/components/motion/Magnetic";
import { useAuth } from "@/hooks/useAuth";
import { useRBAC } from "@/hooks/useRBAC";
import { LoginModal } from "./LoginModal";
import { GlobalSearchModal } from "./GlobalSearchModal";
import { NotificationDrawer } from "./NotificationDrawer";

export const navLinks = [
  { to: "/", label: "Home" },
  { to: "/community", label: "Community" },
  { to: "/staff", label: "Staff" },
  { to: "/events", label: "Events" },
  { to: "/partners", label: "Partners" },
  { to: "/payouts", label: "Payouts" },
  { to: "/gallery", label: "Gallery" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const { user, userProfile, logout } = useAuth();
  const { isAdmin } = useRBAC();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // Check initial dark mode state
    if (document.documentElement.classList.contains("dark")) {
      setIsDarkMode(true);
    }
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleTheme = () => {
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    }
  };

  return (
    <>
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      <div className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6">
        <motion.nav
          initial={{ y: -24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className={`mx-auto grid w-full max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-4xl px-5 py-3 transition-all duration-500 md:flex md:justify-between ${
            scrolled ? "glass-strong" : "glass"
          }`}
        >
          <Link to="/" className="flex min-w-0 items-center gap-2.5">
            <span
              aria-hidden
              className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[var(--shadow-soft)]"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
                <path d="M12 21s-7.5-4.6-9.3-9A5.3 5.3 0 0 1 12 6.6 5.3 5.3 0 0 1 21.3 12c-1.8 4.4-9.3 9-9.3 9Z" />
              </svg>
            </span>
            <span className="truncate font-display text-lg tracking-tight">LovePixels</span>
          </Link>

          <ul className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  activeOptions={{ exact: link.to === "/" }}
                  activeProps={{ className: "bg-accent text-accent-foreground" }}
                  className="rounded-full px-3.5 py-2 text-sm text-muted-foreground transition-colors duration-300 hover:bg-accent/60 hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              title={
                isDarkMode
                  ? "Switch to Soft Rose Pink Theme"
                  : "Switch to Deep Midnight Obsidian Theme"
              }
              className="rounded-full p-2 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
            >
              {isDarkMode ? (
                <Sun className="h-4.5 w-4.5 text-amber-400" />
              ) : (
                <Moon className="h-4.5 w-4.5 text-purple-500" />
              )}
            </button>

            <button
              onClick={() => setIsSearchOpen(true)}
              title="Search (Cmd+K)"
              className="rounded-full p-2 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500"
            >
              <Search className="h-4.5 w-4.5" />
            </button>

            <button
              onClick={() => setIsNotificationsOpen(true)}
              title="Notifications"
              className="relative rounded-full p-2 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500"
            >
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute right-1 top-1 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
              </span>
            </button>

            {user ? (
              <div className="flex items-center space-x-2">
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="hidden items-center space-x-1 rounded-full bg-rose-500/15 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-500/25 dark:text-rose-400 md:inline-flex"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Admin Panel</span>
                  </Link>
                )}
                <div className="flex items-center space-x-2 rounded-full border border-border/80 bg-card/80 px-3 py-1 text-xs font-semibold text-foreground">
                  <UserIcon className="h-3.5 w-3.5 text-rose-500" />
                  <span className="max-w-[100px] truncate">
                    {userProfile?.displayName || user.email?.split("@")[0]}
                  </span>
                </div>
                <button
                  onClick={() => logout()}
                  title="Sign Out"
                  className="rounded-full p-2 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Magnetic className="hidden md:inline-flex" strength={0.22}>
                <button
                  type="button"
                  onClick={() => setIsLoginModalOpen(true)}
                  className="inline-flex items-center space-x-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-5 py-2 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition-all duration-300 hover:scale-[1.03] active:scale-95"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </button>
              </Magnetic>
            )}

            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-border/70 bg-card/70 text-foreground md:hidden"
            >
              {open ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
            </button>
          </div>
        </motion.nav>

        <AnimatePresence>
          {open ? (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="glass-strong mx-auto mt-3 w-full max-w-6xl rounded-3xl p-3 md:hidden"
            >
              <ul className="grid gap-1">
                {navLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      activeOptions={{ exact: link.to === "/" }}
                      activeProps={{ className: "bg-accent text-accent-foreground" }}
                      onClick={() => setOpen(false)}
                      className="block rounded-2xl px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              {user ? (
                <div className="mt-2 space-y-2 pt-2">
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-center space-x-2 rounded-2xl bg-rose-500/15 py-3 text-sm font-semibold text-rose-500"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      <span>Admin Panel</span>
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setOpen(false);
                    }}
                    className="w-full rounded-2xl border border-border bg-card py-3 text-sm font-semibold text-foreground"
                  >
                    Logout ({user.email})
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setIsLoginModalOpen(true);
                  }}
                  className="mt-2 block w-full rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-4 py-3 text-center text-sm font-semibold text-white"
                >
                  Login
                </button>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </>
  );
}
