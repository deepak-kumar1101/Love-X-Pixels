import { Link } from "@tanstack/react-router";
import { navLinks } from "./Navbar";

export function Footer() {
  return (
    <footer className="px-5 pb-10 sm:px-8">
      <div className="glass mx-auto w-full max-w-6xl overflow-hidden rounded-4xl px-7 py-12 sm:px-12">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="min-w-0">
            <p className="font-display text-2xl">LovePixels</p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              A softly moderated community for people who like their internet quiet, kind and
              beautifully made.
            </p>
            {/* TODO(firebase): newsletter capture — wire this form to a Firebase function */}
            <form
              className="mt-7 grid grid-cols-[minmax(0,1fr)_auto] gap-2"
              onSubmit={(e) => e.preventDefault()}
            >
              <label htmlFor="footer-email" className="sr-only">
                Email address
              </label>
              <input
                id="footer-email"
                type="email"
                placeholder="your@email.com"
                className="min-w-0 rounded-full border border-border bg-card/80 px-5 py-3 text-sm outline-none transition-shadow placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-ring"
              />
              <button
                type="submit"
                className="shrink-0 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-transform duration-300 hover:scale-[1.03]"
              >
                Notify me
              </button>
            </form>
          </div>

          <nav aria-label="Footer">
            <p className="eyebrow mb-4">Explore</p>
            <ul className="grid gap-2.5">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="eyebrow mb-4">Elsewhere</p>
            <ul className="grid gap-2.5 text-sm text-muted-foreground">
              {/* TODO(firebase): social links from remote config */}
              {["Discord", "Instagram", "Pinterest", "Contact"].map((item) => (
                <li key={item}>
                  <a href="#" className="transition-colors hover:text-foreground">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border/70 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} LovePixels. Made softly.</p>
          <p>Privacy · Guidelines · Terms</p>
        </div>
      </div>
    </footer>
  );
}
