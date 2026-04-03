import { useEffect, useState } from "react";
import { GameCard } from "@/components/cards/GameCard";
import { TournamentCard } from "@/components/cards/TournamentCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useAuthStore } from "@/store/authStore";
import { useDataStore } from "@/store/dataStore";
import { getTeamName } from "@/lib/selectors";

export function CoachSchedulePage() {
  const { selectedUserId } = useAuthStore();
  const { data, addCoachGame, addCoachTournament } = useDataStore();
  const [opponentTeamId, setOpponentTeamId] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [homeOrAway, setHomeOrAway] = useState<"home" | "away">("home");
  const [tournamentId, setTournamentId] = useState<string>("none");
  const [gameMessage, setGameMessage] = useState<string>();
  const [tournamentName, setTournamentName] = useState("");
  const [tournamentLocation, setTournamentLocation] = useState("");
  const [tournamentStartDate, setTournamentStartDate] = useState("");
  const [tournamentEndDate, setTournamentEndDate] = useState("");
  const [tournamentMessage, setTournamentMessage] = useState<string>();

  const coach = data.coaches.find((entry) => entry.id === selectedUserId);
  if (!coach) {
    return <EmptyState description="Coach profile not found for this account." title="Coach not found" />;
  }
  if (!coach.teamId) {
    return (
      <EmptyState
        description="Create a team from Coach Overview before creating games or viewing team schedule."
        title="No team linked"
      />
    );
  }

  const opponentTeams = data.teams.filter((team) => team.id !== coach.teamId);

  useEffect(() => {
    if (!opponentTeams.length) {
      setOpponentTeamId("");
      return;
    }

    if (!opponentTeams.some((team) => team.id === opponentTeamId)) {
      setOpponentTeamId(opponentTeams[0].id);
    }
  }, [opponentTeamId, opponentTeams]);

  const games = data.games.filter(
    (game) => game.homeTeamId === coach.teamId || game.awayTeamId === coach.teamId
  );

  const tournaments = data.tournaments.filter((tournament) =>
    tournament.createdByCoachId === coach.id ||
    tournament.gameIds.some((gameId) => games.some((game) => game.id === gameId))
  );

  return (
    <div>
      <PageHeader description="Upcoming and linked tournament matches for your team." title="Team Schedule" />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add Game to Schedule</CardTitle>
          <CardDescription>Create a team game directly from the coach workflow.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm font-medium">Opponent</p>
            <Select onValueChange={setOpponentTeamId} value={opponentTeamId}>
              <SelectTrigger>
                <SelectValue placeholder="Select opponent" />
              </SelectTrigger>
              <SelectContent>
                {opponentTeams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Home or Away</p>
            <Select
              onValueChange={(value) => setHomeOrAway(value as "home" | "away")}
              value={homeOrAway}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select side" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="home">Home</SelectItem>
                <SelectItem value="away">Away</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Date and Time</p>
            <Input onChange={(event) => setDate(event.target.value)} type="datetime-local" value={date} />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Location</p>
            <Input onChange={(event) => setLocation(event.target.value)} placeholder="Field / stadium" value={location} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <p className="text-sm font-medium">Tournament (optional)</p>
            <Select onValueChange={setTournamentId} value={tournamentId}>
              <SelectTrigger>
                <SelectValue placeholder="No tournament" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No tournament</SelectItem>
                {data.tournaments.map((tournament) => (
                  <SelectItem key={tournament.id} value={tournament.id}>
                    {tournament.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Button
              disabled={!opponentTeamId || !date}
              onClick={async () => {
                const result = await addCoachGame(coach.id, {
                  opponentTeamId,
                  date,
                  location,
                  homeOrAway,
                  tournamentId: tournamentId === "none" ? undefined : tournamentId
                });

                setGameMessage(result.success ? "Game added to schedule." : result.error ?? "Unable to add game.");
                if (result.success) {
                  setDate("");
                  setLocation("");
                  setTournamentId("none");
                }
              }}
            >
              Add Game
            </Button>
            {gameMessage ? <p className="mt-2 text-sm text-muted-foreground">{gameMessage}</p> : null}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Create Tournament</CardTitle>
          <CardDescription>Create a tournament that your team can attach games to.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm font-medium">Tournament Name</p>
            <Input
              onChange={(event) => setTournamentName(event.target.value)}
              placeholder="Spring Showcase Cup"
              value={tournamentName}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Location</p>
            <Input
              onChange={(event) => setTournamentLocation(event.target.value)}
              placeholder="City, State"
              value={tournamentLocation}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Start Date</p>
            <Input
              onChange={(event) => setTournamentStartDate(event.target.value)}
              type="date"
              value={tournamentStartDate}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">End Date</p>
            <Input
              onChange={(event) => setTournamentEndDate(event.target.value)}
              type="date"
              value={tournamentEndDate}
            />
          </div>

          <div className="md:col-span-2">
            <Button
              disabled={
                !tournamentName || !tournamentLocation || !tournamentStartDate || !tournamentEndDate
              }
              onClick={async () => {
                const result = await addCoachTournament(coach.id, {
                  name: tournamentName,
                  location: tournamentLocation,
                  startDate: tournamentStartDate,
                  endDate: tournamentEndDate
                });

                setTournamentMessage(
                  result.success
                    ? "Tournament created. You can now attach games to it."
                    : result.error ?? "Unable to create tournament."
                );
                if (result.success) {
                  setTournamentName("");
                  setTournamentLocation("");
                  setTournamentStartDate("");
                  setTournamentEndDate("");
                }
              }}
            >
              Create Tournament
            </Button>
            {tournamentMessage ? (
              <p className="mt-2 text-sm text-muted-foreground">{tournamentMessage}</p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Games</h2>
        {games.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {games.map((game) => (
              <GameCard
                awayTeamName={getTeamName(data, game.awayTeamId)}
                game={game}
                homeTeamName={getTeamName(data, game.homeTeamId)}
                key={game.id}
              />
            ))}
          </div>
        ) : (
          <EmptyState description="No games are on this team schedule yet." title="No games" />
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Tournaments</h2>
        {tournaments.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {tournaments.map((tournament) => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </div>
        ) : (
          <EmptyState description="No tournaments linked for this team yet." title="No tournaments" />
        )}
      </section>
    </div>
  );
}
