import { Navigate, Outlet } from "react-router-dom";
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

  return <Outlet />;
}
