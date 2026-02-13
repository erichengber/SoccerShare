import type { ClipTag, PlayerPosition, TeamLevel, UserRole } from "@/types/domain";

export const USER_ROLES: UserRole[] = ["player", "parent", "coach", "recruiter"];

export const CLIP_TAGS: ClipTag[] = [
  "Goal",
  "Assist",
  "Shot",
  "Save",
  "Tackle",
  "Interception",
  "Dribble",
  "Pass",
  "Cross",
  "Clearance",
  "Set Piece",
  "Defensive Play"
];

export const PLAYER_POSITIONS: PlayerPosition[] = [
  "Goalkeeper",
  "Center Back",
  "Left Back",
  "Right Back",
  "Defensive Midfielder",
  "Central Midfielder",
  "Attacking Midfielder",
  "Left Wing",
  "Right Wing",
  "Forward"
];

export const TEAM_LEVELS: TeamLevel[] = ["rec", "travel", "club", "school"];
