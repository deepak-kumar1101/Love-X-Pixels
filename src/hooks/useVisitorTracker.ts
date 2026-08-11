import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { useAuth } from "./useAuth";
import { VisitorService } from "@/services/visitor.service";

export function useVisitorTracker(): void {
  const routerState = useRouterState();
  const { user } = useAuth();
  const pathname = routerState.location.pathname;

  useEffect(() => {
    VisitorService.trackVisit(pathname, user?.uid);
  }, [pathname, user?.uid]);
}
