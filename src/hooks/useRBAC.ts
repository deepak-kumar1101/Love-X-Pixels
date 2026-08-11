import { useRBACContext } from "@/contexts/RBACContext";

export function useRBAC() {
  return useRBACContext();
}
