import type { AppData, UserRole } from "@/types/domain";

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

export function getDefaultPathForRole(role: UserRole, userId: string | undefined, data: AppData) {
  if (role === "coach" && userId) {
    const coach = data.coaches.find((entry) => entry.id === userId);
    if (coach && !coach.teamId) {
      return "/onboarding/coach";
    }
  }

  return getHomePathForRole(role);
}
