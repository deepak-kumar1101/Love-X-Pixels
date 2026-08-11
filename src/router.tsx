import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

function DefaultErrorScreen({ error, reset }: { error: Error; reset?: () => void }) {
  console.error("[LovePixels ErrorBoundary]", error);
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 text-foreground">
      <div className="max-w-md w-full rounded-3xl border border-rose-500/30 bg-card/80 p-8 shadow-2xl backdrop-blur-xl text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif text-2xl font-bold tracking-tight">Something went wrong</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            An unexpected application error occurred. You can retry or return to the homepage.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {reset && (
            <button
              onClick={() => reset()}
              className="flex-1 inline-flex items-center justify-center space-x-2 rounded-xl bg-rose-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-rose-600 transition-all"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Try Again</span>
            </button>
          )}
          <a
            href="/"
            className="flex-1 inline-flex items-center justify-center space-x-2 rounded-xl border border-border bg-accent/30 px-4 py-2.5 text-xs font-bold text-foreground hover:bg-accent/50 transition-all"
          >
            <Home className="h-4 w-4" />
            <span>Return Home</span>
          </a>
        </div>
      </div>
    </div>
  );
}

function DefaultNotFoundScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 text-foreground">
      <div className="max-w-md w-full rounded-3xl border border-border bg-card/80 p-8 shadow-2xl backdrop-blur-xl text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent text-primary font-serif font-bold text-2xl">
          404
        </div>
        <div className="space-y-2">
          <h2 className="font-serif text-2xl font-bold tracking-tight">Page Not Found</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>
        <a
          href="/"
          className="inline-flex items-center justify-center space-x-2 rounded-xl bg-rose-500 px-6 py-2.5 text-xs font-bold text-white hover:bg-rose-600 transition-all"
        >
          <Home className="h-4 w-4" />
          <span>Return Home</span>
        </a>
      </div>
    </div>
  );
}

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: DefaultErrorScreen,
    defaultNotFoundComponent: DefaultNotFoundScreen,
  });

  return router;
};
