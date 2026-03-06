export type UserRole = "player" | "parent" | "coach" | "recruiter";

export type PlayerPrivacy = "public" | "private";

export type TeamLevel = "rec" | "travel" | "club" | "school";

export type PlayerPosition =
  | "Goalkeeper"
  | "Center Back"
  | "Left Back"
  | "Right Back"
  | "Defensive Midfielder"
  | "Central Midfielder"
  | "Attacking Midfielder"
  | "Left Wing"
  | "Right Wing"
  | "Forward";

export type ClipTag =
  | "Goal"
  | "Assist"
  | "Shot"
  | "Save"
  | "Tackle"
  | "Interception"
  | "Dribble"
  | "Pass"
  | "Cross"
  | "Clearance"
  | "Set Piece"
  | "Defensive Play";

export interface UserBase {
  id: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string;
}

export interface Player extends UserBase {
  role: "player";
  gradYear: number;
  position: PlayerPosition;
  jerseyNumber: number;
  teamIds: string[];
  parentIds: string[];
  teammateIds: string[];
  privacy: PlayerPrivacy;
  bio: string;
}

export interface Parent extends UserBase {
  role: "parent";
  playerIds: string[];
}

export interface Coach extends UserBase {
  role: "coach";
  teamId?: string;
  schoolId?: string;
}

export interface Recruiter extends UserBase {
  role: "recruiter";
  organization: string;
  region: string;
}

export type User = Player | Parent | Coach | Recruiter;

export interface School {
  id: string;
  name: string;
  city: string;
  state: string;
}

export interface Team {
  id: string;
  name: string;
  level: TeamLevel;
  schoolId?: string;
  coachIds: string[];
  playerIds: string[];
}

export interface Tournament {
  id: string;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  gameIds: string[];
  createdByCoachId?: string;
}

export interface Game {
  id: string;
  tournamentId?: string;
  date: string;
  location: string;
  homeTeamId: string;
  awayTeamId: string;
  createdByCoachId?: string;
}

export interface Clip {
  id: string;
  playerId: string;
  title: string;
  videoUrl: string;
  posterUrl?: string;
  durationSec: number;
  tags: ClipTag[];
  notes: string;
  gameId?: string;
  tournamentId?: string;
  createdAt: string;
}

export interface SampleVideoOption {
  id: string;
  label: string;
  url: string;
  posterUrl: string;
}

export type TeamInviteStatus = "pending" | "accepted" | "declined";

export type TeamInviteResponderRole = "player" | "parent";

export interface TeamInvite {
  id: string;
  teamId: string;
  playerId: string;
  invitedByCoachId: string;
  status: TeamInviteStatus;
  createdAt: string;
  respondedAt?: string;
  respondedByRole?: TeamInviteResponderRole;
}

export interface AppData {
  users: User[];
  players: Player[];
  parents: Parent[];
  coaches: Coach[];
  recruiters: Recruiter[];
  schools: School[];
  teams: Team[];
  tournaments: Tournament[];
  games: Game[];
  clips: Clip[];
  teamInvites: TeamInvite[];
  sampleVideos: SampleVideoOption[];
}

export interface ClipUploadInput {
  playerId: string;
  title: string;
  videoFile: File;
  posterFile?: File;
  durationSec: number;
  tags: ClipTag[];
  notes: string;
  gameId?: string;
  tournamentId?: string;
}

export interface ClipUpdateInput {
  clipId: string;
  tags: ClipTag[];
  notes: string;
}

export interface TeamInviteResponseInput {
  inviteId: string;
  responderRole: TeamInviteResponderRole;
  responderId: string;
  accept: boolean;
}

export interface CoachGameInput {
  opponentTeamId: string;
  date: string;
  location: string;
  homeOrAway: "home" | "away";
  tournamentId?: string;
}

export interface CreateCoachTeamInput {
  name: string;
  level: TeamLevel;
  schoolId?: string;
}

export interface PlayerOnboardingInput {
  playerId: string;
  position: PlayerPosition;
  jerseyNumber: number;
  teamId: string;
  bio: string;
  avatarUrl: string;
}

export interface CoachTournamentInput {
  name: string;
  location: string;
  startDate: string;
  endDate: string;
}

export interface RecruiterFilters {
  position?: PlayerPosition;
  gradYear?: number;
  teamId?: string;
  tournamentId?: string;
}
