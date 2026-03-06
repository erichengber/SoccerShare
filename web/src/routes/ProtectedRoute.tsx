import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { getHomePathForRole } from "@/lib/roleRouting";
import type { UserRole } from "@/types/domain";

interface ProtectedRouteProps {
  allow: UserRole[];
}

export function ProtectedRoute({ allow }: ProtectedRouteProps) {
  const { user, selectedRole, selectedUserId } = useAuthStore();

  if (!user) {
    return <Navigate replace to="/" />;
  }

  if (!selectedRole || !selectedUserId) {
    return <Navigate replace to="/login" />;
  }

  if (!allow.includes(selectedRole)) {
    return <Navigate replace to={getHomePathForRole(selectedRole)} />;
  }

  if (selectedRole === "player") {
    const onboardingPath = "/onboarding/player";
    const onboardingComplete = isOnboardingComplete(selectedUserId);

    if (!onboardingComplete && location.pathname !== onboardingPath) {
      return <Navigate replace to={onboardingPath} />;
    }

    if (onboardingComplete && location.pathname === onboardingPath) {
      return <Navigate replace to={getHomePathForRole(selectedRole)} />;
    }
  }

  return <Outlet />;
}
