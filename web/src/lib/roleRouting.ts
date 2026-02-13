import type { UserRole } from "@/types/domain";

export function getHomePathForRole(role: UserRole) {
  switch (role) {
    case "player":
      return "/player";
    case "parent":
      return "/parent";
    case "coach":
      return "/coach";
    case "recruiter":
      return "/recruiter";
    default:
      return "/";
  }
}
