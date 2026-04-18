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

export function getOnboardingPathForRole(role: UserRole) {
  switch (role) {
    case "player":
      return "/onboarding/player";
    case "parent":
      return "/onboarding/parent";
    case "coach":
      return "/onboarding/coach";
    case "recruiter":
      return "/onboarding/recruiter";
    default:
      return "/";
  }
}

export function getAccountPathForRole(role: UserRole) {
  switch (role) {
    case "player":
      return "/player/account";
    case "parent":
      return "/parent/account";
    case "coach":
      return "/coach/account";
    case "recruiter":
      return "/recruiter/account";
    default:
      return "/";
  }
}

export function getDefaultPathForRole(role: UserRole, userId: string | undefined, data: AppData) {
  if (role === "player" && userId) {
    const player = data.players.find((entry) => entry.id === userId);
    if (player && (!player.teamIds.length || !player.bio.trim())) {
      return getOnboardingPathForRole(role);
    }
  }

  if (role === "parent" && userId) {
    const parent = data.parents.find((entry) => entry.id === userId);
    if (parent && parent.playerIds.length === 0) {
      return getOnboardingPathForRole(role);
    }
  }

  if (role === "coach" && userId) {
    const coach = data.coaches.find((entry) => entry.id === userId);
    if (coach && !coach.teamId) {
      return getOnboardingPathForRole(role);
    }
  }

  if (role === "recruiter" && userId) {
    const recruiter = data.recruiters.find((entry) => entry.id === userId);
    if (recruiter && (!recruiter.organization.trim() || !recruiter.region.trim())) {
      return getOnboardingPathForRole(role);
    }
  }

  return getHomePathForRole(role);
}
