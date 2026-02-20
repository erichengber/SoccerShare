import type {
  AppData,
  Clip,
  Coach,
  Parent,
  Player,
  Recruiter,
  SampleVideoOption,
  School,
  Team,
  TeamInvite,
  Tournament,
  User,
  UserRole,
  Game
} from "@/types/domain";

const sampleVideos: SampleVideoOption[] = [
  {
    id: "vid-1",
    label: "Big Goal Scored!",
    url: '/6077718-uhd_3840_2160_25fps.mp4',
    posterUrl: "/messi_thumbnail.jpeg"
  },
  {
    id: "vid-2",
    label: "Assist in Style",
    url: "/6078638-uhd_3840_2160_25fps.mp4",
    posterUrl: "/julie_ertz_thumbnail.jpeg"
  },
  {
    id: "vid-3",
    label: "Slide Tackle",
    url: "/12915089_1920_1080_60fps.mp4",
    posterUrl: "/neymar_thumbnail.jpeg"
  },
  {
    id: "vid-4",
    label: "Game Winning PK",
    url: "/6078638-uhd_3840_2160_25fps.mp4",
    posterUrl: "/ronaldo_thumbnail.jpeg"
  }
];

const schools: School[] = [
  { id: "school-1", name: "Lincoln High School", city: "St. Louis", state: "MO" },
  { id: "school-2", name: "Westview High School", city: "Chesterfield", state: "MO" }
];

const players: Player[] = [
  {
    id: "player-1",
    role: "player",
    firstName: "Alex",
    lastName: "Ramirez",
    email: "alex.ramirez@example.com",
    avatarUrl: "https://i.pravatar.cc/300?img=12",
    gradYear: 2027,
    position: "Forward",
    jerseyNumber: 9,
    teamIds: ["team-3", "team-4"],
    parentIds: ["parent-1", "parent-2"],
    teammateIds: ["player-2", "player-3", "player-8"],
    privacy: "public",
    bio: "Fast striker with strong off-ball runs and finishing in transition."
  },
  {
    id: "player-2",
    role: "player",
    firstName: "Mia",
    lastName: "Chen",
    email: "mia.chen@example.com",
    avatarUrl: "https://i.pravatar.cc/300?img=32",
    gradYear: 2028,
    position: "Central Midfielder",
    jerseyNumber: 8,
    teamIds: ["team-3", "team-4"],
    parentIds: ["parent-3"],
    teammateIds: ["player-1", "player-3", "player-8"],
    privacy: "public",
    bio: "Box-to-box midfielder who breaks lines with quick passes."
  },
  {
    id: "player-3",
    role: "player",
    firstName: "Noah",
    lastName: "Patel",
    email: "noah.patel@example.com",
    avatarUrl: "https://i.pravatar.cc/300?img=22",
    gradYear: 2027,
    position: "Goalkeeper",
    jerseyNumber: 1,
    teamIds: ["team-4"],
    parentIds: ["parent-2"],
    teammateIds: ["player-1", "player-2"],
    privacy: "private",
    bio: "Shot-stopper with strong distribution and communication."
  },
  {
    id: "player-4",
    role: "player",
    firstName: "Jordan",
    lastName: "Blake",
    email: "jordan.blake@example.com",
    avatarUrl: "https://i.pravatar.cc/300?img=45",
    gradYear: 2026,
    position: "Center Back",
    jerseyNumber: 4,
    teamIds: ["team-2", "team-5"],
    parentIds: ["parent-4"],
    teammateIds: ["player-5", "player-6", "player-9", "player-10"],
    privacy: "public",
    bio: "Composed defender who wins aerials and organizes the back line."
  },
  {
    id: "player-5",
    role: "player",
    firstName: "Sofia",
    lastName: "Torres",
    email: "sofia.torres@example.com",
    avatarUrl: "https://i.pravatar.cc/300?img=52",
    gradYear: 2028,
    position: "Right Wing",
    jerseyNumber: 11,
    teamIds: ["team-2", "team-5"],
    parentIds: ["parent-4"],
    teammateIds: ["player-4", "player-6", "player-9", "player-10"],
    privacy: "private",
    bio: "Direct winger with speed in 1v1 and quick recovery pressing."
  },
  {
    id: "player-6",
    role: "player",
    firstName: "Ethan",
    lastName: "Brooks",
    email: "ethan.brooks@example.com",
    avatarUrl: "https://i.pravatar.cc/300?img=65",
    gradYear: 2027,
    position: "Defensive Midfielder",
    jerseyNumber: 6,
    teamIds: ["team-2"],
    parentIds: ["parent-5"],
    teammateIds: ["player-4", "player-5", "player-10"],
    privacy: "public",
    bio: "Strong ball-winning midfielder with clean first touch."
  },
  {
    id: "player-7",
    role: "player",
    firstName: "Lily",
    lastName: "Johnson",
    email: "lily.johnson@example.com",
    avatarUrl: "https://i.pravatar.cc/300?img=37",
    gradYear: 2029,
    position: "Forward",
    jerseyNumber: 10,
    teamIds: ["team-1"],
    parentIds: ["parent-3"],
    teammateIds: ["player-8"],
    privacy: "public",
    bio: "Rec-level forward focused on timing runs in the box."
  },
  {
    id: "player-8",
    role: "player",
    firstName: "Diego",
    lastName: "Alvarez",
    email: "diego.alvarez@example.com",
    avatarUrl: "https://i.pravatar.cc/300?img=18",
    gradYear: 2028,
    position: "Left Back",
    jerseyNumber: 3,
    teamIds: ["team-1", "team-3"],
    parentIds: ["parent-1"],
    teammateIds: ["player-1", "player-2", "player-7"],
    privacy: "private",
    bio: "Overlapping outside back with accurate crosses."
  },
  {
    id: "player-9",
    role: "player",
    firstName: "Harper",
    lastName: "Kim",
    email: "harper.kim@example.com",
    avatarUrl: "https://i.pravatar.cc/300?img=56",
    gradYear: 2026,
    position: "Attacking Midfielder",
    jerseyNumber: 7,
    teamIds: ["team-5"],
    parentIds: ["parent-4"],
    teammateIds: ["player-4", "player-5"],
    privacy: "public",
    bio: "Creative chance-maker with vision and through balls."
  },
  {
    id: "player-10",
    role: "player",
    firstName: "Mason",
    lastName: "Reed",
    email: "mason.reed@example.com",
    avatarUrl: "https://i.pravatar.cc/300?img=67",
    gradYear: 2027,
    position: "Goalkeeper",
    jerseyNumber: 1,
    teamIds: ["team-2"],
    parentIds: ["parent-5"],
    teammateIds: ["player-4", "player-5", "player-6"],
    privacy: "public",
    bio: "Sweeper keeper with strong command of the penalty area."
  }
];

const parents: Parent[] = [
  {
    id: "parent-1",
    role: "parent",
    firstName: "Carla",
    lastName: "Ramirez",
    email: "carla.ramirez@example.com",
    avatarUrl: "https://i.pravatar.cc/300?img=5",
    playerIds: ["player-1", "player-8"]
  },
  {
    id: "parent-2",
    role: "parent",
    firstName: "Trevor",
    lastName: "Patel",
    email: "trevor.patel@example.com",
    avatarUrl: "https://i.pravatar.cc/300?img=8",
    playerIds: ["player-1", "player-3"]
  },
  {
    id: "parent-3",
    role: "parent",
    firstName: "Emily",
    lastName: "Johnson",
    email: "emily.johnson@example.com",
    avatarUrl: "https://i.pravatar.cc/300?img=9",
    playerIds: ["player-2", "player-7"]
  },
  {
    id: "parent-4",
    role: "parent",
    firstName: "Miguel",
    lastName: "Torres",
    email: "miguel.torres@example.com",
    avatarUrl: "https://i.pravatar.cc/300?img=10",
    playerIds: ["player-4", "player-5", "player-9"]
  },
  {
    id: "parent-5",
    role: "parent",
    firstName: "Dana",
    lastName: "Reed",
    email: "dana.reed@example.com",
    avatarUrl: "https://i.pravatar.cc/300?img=11",
    playerIds: ["player-6", "player-10"]
  }
];

const coaches: Coach[] = [
  {
    id: "coach-1",
    role: "coach",
    firstName: "Renee",
    lastName: "Cole",
    email: "renee.cole@example.com",
    avatarUrl: "https://i.pravatar.cc/300?img=24",
    teamId: "team-3"
  },
  {
    id: "coach-2",
    role: "coach",
    firstName: "Adam",
    lastName: "Foster",
    email: "adam.foster@example.com",
    avatarUrl: "https://i.pravatar.cc/300?img=26",
    teamId: "team-4",
    schoolId: "school-1"
  },
  {
    id: "coach-3",
    role: "coach",
    firstName: "Tia",
    lastName: "Walker",
    email: "tia.walker@example.com",
    avatarUrl: "https://i.pravatar.cc/300?img=28",
    teamId: "team-5",
    schoolId: "school-2"
  },
  {
    id: "coach-4",
    role: "coach",
    firstName: "James",
    lastName: "Nguyen",
    email: "james.nguyen@example.com",
    avatarUrl: "https://i.pravatar.cc/300?img=30",
    teamId: "team-2"
  }
];

const recruiters: Recruiter[] = [
  {
    id: "recruiter-1",
    role: "recruiter",
    firstName: "Monica",
    lastName: "Shaw",
    email: "monica.shaw@example.com",
    avatarUrl: "https://i.pravatar.cc/300?img=16",
    organization: "Midwest College Scouts",
    region: "Midwest"
  },
  {
    id: "recruiter-2",
    role: "recruiter",
    firstName: "Ben",
    lastName: "Ortega",
    email: "ben.ortega@example.com",
    avatarUrl: "https://i.pravatar.cc/300?img=17",
    organization: "River Valley FC Academy",
    region: "Central"
  }
];

const teams: Team[] = [
  {
    id: "team-1",
    name: "River City Rec",
    level: "rec",
    coachIds: [],
    playerIds: ["player-7", "player-8"]
  },
  {
    id: "team-2",
    name: "Metro United Travel",
    level: "travel",
    coachIds: ["coach-4"],
    playerIds: ["player-4", "player-5", "player-6", "player-10"]
  },
  {
    id: "team-3",
    name: "Apex FC 2010",
    level: "club",
    coachIds: ["coach-1"],
    playerIds: ["player-1", "player-2", "player-8"]
  },
  {
    id: "team-4",
    name: "Lincoln Lions Varsity",
    level: "school",
    schoolId: "school-1",
    coachIds: ["coach-2"],
    playerIds: ["player-1", "player-2", "player-3"]
  },
  {
    id: "team-5",
    name: "Westview Wildcats JV",
    level: "school",
    schoolId: "school-2",
    coachIds: ["coach-3"],
    playerIds: ["player-4", "player-5", "player-9"]
  }
];

const tournaments: Tournament[] = [
  {
    id: "tournament-1",
    name: "Midwest Spring Showcase",
    location: "St. Louis Soccer Park",
    startDate: "2026-04-05",
    endDate: "2026-04-07",
    gameIds: ["game-1", "game-2", "game-3"]
  },
  {
    id: "tournament-2",
    name: "State Cup Qualifier",
    location: "Jefferson Sports Complex",
    startDate: "2026-05-12",
    endDate: "2026-05-14",
    gameIds: ["game-4", "game-5"]
  }
];

const games: Game[] = [
  {
    id: "game-1",
    tournamentId: "tournament-1",
    date: "2026-04-05T10:00:00Z",
    location: "Field 2",
    homeTeamId: "team-3",
    awayTeamId: "team-2"
  },
  {
    id: "game-2",
    tournamentId: "tournament-1",
    date: "2026-04-06T15:00:00Z",
    location: "Field 4",
    homeTeamId: "team-4",
    awayTeamId: "team-5"
  },
  {
    id: "game-3",
    tournamentId: "tournament-1",
    date: "2026-04-07T12:00:00Z",
    location: "Field 1",
    homeTeamId: "team-3",
    awayTeamId: "team-5"
  },
  {
    id: "game-4",
    tournamentId: "tournament-2",
    date: "2026-05-12T17:30:00Z",
    location: "Championship Field",
    homeTeamId: "team-2",
    awayTeamId: "team-4"
  },
  {
    id: "game-5",
    tournamentId: "tournament-2",
    date: "2026-05-13T11:30:00Z",
    location: "North Field",
    homeTeamId: "team-5",
    awayTeamId: "team-1"
  },
  {
    id: "game-6",
    date: "2026-03-21T14:00:00Z",
    location: "Community Stadium",
    homeTeamId: "team-1",
    awayTeamId: "team-2"
  }
];

const clips: Clip[] = [
  {
    id: "clip-1",
    playerId: "player-1",
    title: "Near-post finish in traffic",
    videoUrl: sampleVideos[0].url,
    posterUrl: sampleVideos[0].posterUrl,
    durationSec: 32,
    tags: ["Goal", "Dribble"],
    notes: "Timed run between center backs and finished first touch.",
    gameId: "game-1",
    tournamentId: "tournament-1",
    createdAt: "2026-04-05T12:00:00Z"
  },
  {
    id: "clip-2",
    playerId: "player-1",
    title: "Header off a set piece",
    videoUrl: sampleVideos[2].url,
    posterUrl: sampleVideos[2].posterUrl,
    durationSec: 28,
    tags: ["Set Piece", "Shot"],
    notes: "Attacked back post service with strong elevation.",
    gameId: "game-4",
    tournamentId: "tournament-2",
    createdAt: "2026-05-12T18:15:00Z"
  },
  {
    id: "clip-3",
    playerId: "player-2",
    title: "Line-breaking assist",
    videoUrl: sampleVideos[1].url,
    posterUrl: sampleVideos[1].posterUrl,
    durationSec: 36,
    tags: ["Assist", "Pass"],
    notes: "Split midfield line and slipped striker through.",
    gameId: "game-1",
    tournamentId: "tournament-1",
    createdAt: "2026-04-05T12:20:00Z"
  },
  {
    id: "clip-4",
    playerId: "player-2",
    title: "Counter-press recovery",
    videoUrl: sampleVideos[3].url,
    posterUrl: sampleVideos[3].posterUrl,
    durationSec: 24,
    tags: ["Defensive Play", "Interception"],
    notes: "Won ball five seconds after turnover in attacking half.",
    gameId: "game-3",
    tournamentId: "tournament-1",
    createdAt: "2026-04-07T12:45:00Z"
  },
  {
    id: "clip-5",
    playerId: "player-3",
    title: "Top-corner reaction save",
    videoUrl: sampleVideos[2].url,
    posterUrl: sampleVideos[2].posterUrl,
    durationSec: 20,
    tags: ["Save"],
    notes: "Quick adjustment and strong palm over the bar.",
    gameId: "game-2",
    tournamentId: "tournament-1",
    createdAt: "2026-04-06T15:40:00Z"
  },
  {
    id: "clip-6",
    playerId: "player-4",
    title: "Recovery tackle in open field",
    videoUrl: sampleVideos[1].url,
    posterUrl: sampleVideos[1].posterUrl,
    durationSec: 26,
    tags: ["Tackle", "Defensive Play"],
    notes: "Closed angle from weak side and won cleanly.",
    gameId: "game-1",
    tournamentId: "tournament-1",
    createdAt: "2026-04-05T11:30:00Z"
  },
  {
    id: "clip-7",
    playerId: "player-4",
    title: "Long diagonal switch",
    videoUrl: sampleVideos[0].url,
    posterUrl: sampleVideos[0].posterUrl,
    durationSec: 18,
    tags: ["Pass", "Cross"],
    notes: "Right-footed switch to opposite wing in stride.",
    gameId: "game-4",
    tournamentId: "tournament-2",
    createdAt: "2026-05-12T18:05:00Z"
  },
  {
    id: "clip-8",
    playerId: "player-5",
    title: "1v1 wing take-on",
    videoUrl: sampleVideos[3].url,
    posterUrl: sampleVideos[3].posterUrl,
    durationSec: 21,
    tags: ["Dribble", "Cross"],
    notes: "Beat fullback and delivered driven cross.",
    gameId: "game-2",
    tournamentId: "tournament-1",
    createdAt: "2026-04-06T15:25:00Z"
  },
  {
    id: "clip-9",
    playerId: "player-6",
    title: "Midfield interception to shot",
    videoUrl: sampleVideos[0].url,
    posterUrl: sampleVideos[0].posterUrl,
    durationSec: 30,
    tags: ["Interception", "Shot"],
    notes: "Won second ball and took strike from top of box.",
    gameId: "game-1",
    tournamentId: "tournament-1",
    createdAt: "2026-04-05T12:50:00Z"
  },
  {
    id: "clip-10",
    playerId: "player-6",
    title: "Set-piece screen and finish",
    videoUrl: sampleVideos[2].url,
    posterUrl: sampleVideos[2].posterUrl,
    durationSec: 34,
    tags: ["Set Piece", "Goal"],
    notes: "Late run after screen, redirected in near post.",
    gameId: "game-4",
    tournamentId: "tournament-2",
    createdAt: "2026-05-12T18:30:00Z"
  },
  {
    id: "clip-11",
    playerId: "player-7",
    title: "Quick touch finish",
    videoUrl: sampleVideos[1].url,
    posterUrl: sampleVideos[1].posterUrl,
    durationSec: 22,
    tags: ["Goal", "Shot"],
    notes: "Two-touch finish from top of area.",
    gameId: "game-6",
    createdAt: "2026-03-21T15:10:00Z"
  },
  {
    id: "clip-12",
    playerId: "player-8",
    title: "Back-post clearance",
    videoUrl: sampleVideos[3].url,
    posterUrl: sampleVideos[3].posterUrl,
    durationSec: 19,
    tags: ["Clearance", "Defensive Play"],
    notes: "Tracked runner and cleared danger on line.",
    gameId: "game-3",
    tournamentId: "tournament-1",
    createdAt: "2026-04-07T13:00:00Z"
  },
  {
    id: "clip-13",
    playerId: "player-9",
    title: "Through-ball assist",
    videoUrl: sampleVideos[2].url,
    posterUrl: sampleVideos[2].posterUrl,
    durationSec: 27,
    tags: ["Assist", "Pass"],
    notes: "Delayed pass to beat offside line perfectly.",
    gameId: "game-2",
    tournamentId: "tournament-1",
    createdAt: "2026-04-06T16:10:00Z"
  },
  {
    id: "clip-14",
    playerId: "player-9",
    title: "Curled shot from zone 14",
    videoUrl: sampleVideos[0].url,
    posterUrl: sampleVideos[0].posterUrl,
    durationSec: 23,
    tags: ["Shot", "Dribble"],
    notes: "Cut inside and hit frame from edge of box.",
    gameId: "game-5",
    tournamentId: "tournament-2",
    createdAt: "2026-05-13T12:00:00Z"
  },
  {
    id: "clip-15",
    playerId: "player-10",
    title: "Low diving save",
    videoUrl: sampleVideos[1].url,
    posterUrl: sampleVideos[1].posterUrl,
    durationSec: 17,
    tags: ["Save"],
    notes: "Quick push step and clean collection.",
    gameId: "game-4",
    tournamentId: "tournament-2",
    createdAt: "2026-05-12T18:22:00Z"
  },
  {
    id: "clip-16",
    playerId: "player-10",
    title: "Distribution to trigger counter",
    videoUrl: sampleVideos[3].url,
    posterUrl: sampleVideos[3].posterUrl,
    durationSec: 25,
    tags: ["Pass", "Defensive Play"],
    notes: "One-touch throw started transition chance.",
    gameId: "game-1",
    tournamentId: "tournament-1",
    createdAt: "2026-04-05T11:10:00Z"
  },
  {
    id: "clip-17",
    playerId: "player-2",
    title: "Late box run goal",
    videoUrl: sampleVideos[0].url,
    posterUrl: sampleVideos[0].posterUrl,
    durationSec: 29,
    tags: ["Goal", "Pass"],
    notes: "Arrived late and finished low from edge of 6.",
    gameId: "game-2",
    tournamentId: "tournament-1",
    createdAt: "2026-04-06T16:20:00Z"
  },
  {
    id: "clip-18",
    playerId: "player-4",
    title: "Emergency clearance in box",
    videoUrl: sampleVideos[2].url,
    posterUrl: sampleVideos[2].posterUrl,
    durationSec: 15,
    tags: ["Clearance", "Defensive Play"],
    notes: "Tracked second phase and cleared with left foot.",
    gameId: "game-5",
    tournamentId: "tournament-2",
    createdAt: "2026-05-13T12:05:00Z"
  }
];

const teamInvites: TeamInvite[] = [
  {
    id: "invite-1",
    teamId: "team-2",
    playerId: "player-3",
    invitedByCoachId: "coach-4",
    status: "pending",
    createdAt: "2026-02-18T19:00:00Z"
  }
];

const users: User[] = [...players, ...parents, ...coaches, ...recruiters];

export const mockData: AppData = {
  users,
  players,
  parents,
  coaches,
  recruiters,
  schools,
  teams,
  tournaments,
  games,
  clips,
  teamInvites,
  sampleVideos
};

export const defaultUserByRole: Record<UserRole, string> = {
  player: "player-1",
  parent: "parent-4",
  coach: "coach-4",
  recruiter: "recruiter-1"
};
