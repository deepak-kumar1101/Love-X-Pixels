import React, { createContext, useContext, useMemo } from "react";
import { useAuthContext } from "./AuthContext";
import { RBACService } from "@/services/rbac.service";
import type { UserRole, PermissionAction } from "@/models/rbac.model";

interface RBACContextType {
  roles: UserRole[];
  highestRole: UserRole;
  hasPermission: (action: PermissionAction) => boolean;
  hasRole: (targetRole: UserRole) => boolean;
  isOwner: boolean;
  isAdmin: boolean;
  isModerator: boolean;
}

const RBACContext = createContext<RBACContextType | undefined>(undefined);

export const RBACProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile } = useAuthContext();

  const roles: UserRole[] = useMemo(() => {
    if (userProfile && userProfile.roles && userProfile.roles.length > 0) {
      return userProfile.roles;
    }
    return ["Guest"];
  }, [userProfile]);

  const highestRole = useMemo(() => RBACService.getHighestRole(roles), [roles]);

  const value: RBACContextType = useMemo(
    () => ({
      roles,
      highestRole,
      hasPermission: (action: PermissionAction) => RBACService.hasPermission(roles, action),
      hasRole: (targetRole: UserRole) => RBACService.hasRole(roles, targetRole),
      isOwner: roles.includes("Owner"),
      isAdmin: RBACService.hasRole(roles, "Admin"),
      isModerator: RBACService.hasRole(roles, "Moderator"),
    }),
    [roles, highestRole],
  );

  return <RBACContext.Provider value={value}>{children}</RBACContext.Provider>;
};

export const useRBACContext = (): RBACContextType => {
  const context = useContext(RBACContext);
  if (!context) {
    throw new Error("useRBACContext must be used within an RBACProvider");
  }
  return context;
};
