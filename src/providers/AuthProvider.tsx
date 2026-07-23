"use client";

import { useQuery } from "@tanstack/react-query";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

import type { PermissionKey } from "@/config/permissions";
import { hasAllPermissions, hasAnyPermission } from "@/core/permissions";
import { setQueryClinicId } from "@/lib/query-clinic-scope";
import { authQueries } from "@/modules/authentication/queries/auth.query";
import type { AuthContext } from "@/shared/auth";

type AuthProviderValue = {
  auth: AuthContext | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  /** True when the user has every listed permission in the active clinic. */
  can: (...permissions: PermissionKey[]) => boolean;
  /** True when the user has at least one listed permission. */
  canAny: (...permissions: PermissionKey[]) => boolean;
};

const AuthReactContext = createContext<AuthProviderValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
  /** Optional RSC-prefetched session for hydration. */
  initialSession?: AuthContext | null;
};

/**
 * Provides the current auth session to the client tree.
 * Route/layout permission gates belong in `PermissionProvider`.
 */
export function AuthProvider({
  children,
  initialSession = null,
}: AuthProviderProps) {
  // Seed clinic scope before the session query hashes its key (hydration).
  const didSeedClinicScope = useRef(false);
  if (!didSeedClinicScope.current) {
    setQueryClinicId(initialSession?.session.activeClinicId ?? null);
    didSeedClinicScope.current = true;
  }

  const query = useQuery({
    ...authQueries.session(),
    initialData: initialSession ?? undefined,
  });

  const auth = query.data ?? null;

  useEffect(() => {
    setQueryClinicId(auth?.session.activeClinicId ?? null);
  }, [auth?.session.activeClinicId]);

  const value = useMemo<AuthProviderValue>(
    () => ({
      auth,
      isLoading: query.isLoading && auth === null,
      isAuthenticated: auth !== null,
      can: (...permissions: PermissionKey[]) =>
        hasAllPermissions(auth?.permissions ?? [], permissions),
      canAny: (...permissions: PermissionKey[]) =>
        hasAnyPermission(auth?.permissions ?? [], permissions),
    }),
    [auth, query.isLoading],
  );

  return (
    <AuthReactContext.Provider value={value}>
      {children}
    </AuthReactContext.Provider>
  );
}

export function useAuth(): AuthProviderValue {
  const value = useContext(AuthReactContext);
  if (!value) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return value;
}
