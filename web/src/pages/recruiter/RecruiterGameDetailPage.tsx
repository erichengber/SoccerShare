import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { PlayerCard } from "@/components/cards/PlayerCard";
import { ClipCard } from "@/components/cards/ClipCard";
import { TeamCard } from "@/components/cards/TeamCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { getPublicClipsForGame, getPlayersForGame, getSchoolName, getTeamName } from "@/lib/selectors";
import { useDataStore } from "@/store/dataStore";
import { useRecruiterStore } from "@/store/recruiterStore";

export function RecruiterGameDetailPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const { data } = useDataStore();
  const { favoritePlayerIds, savedClipIds, toggleFavoritePlayer, toggleSavedClip } = useRecruiterStore();

  const game = data.games.find((entry) => entry.id === gameId);
  if (!game) {
    return <EmptyState description="Game not found in demo data." title="Game not found" />;
  }

  const homeTeam = data.teams.find((team) => team.id === game.homeTeamId);
  const awayTeam = data.teams.find((team) => team.id === game.awayTeamId);

  const tournament = data.tournaments.find((entry) => entry.id === game.tournamentId);

  const publicPlayers = getPlayersForGame(data, game);
  const clips = getPublicClipsForGame(data, game.id);

  const playerNameById = useMemo(
    () =>
      Object.fromEntries(
        data.players.map((player) => [player.id, `${player.firstName} ${player.lastName}`])
      ) as Record<string, string>,
    [data.players]
  );

  return (
    <div>
      <PageHeader
        action={
          tournament ? (
            <Button asChild variant="outline">
              <Link to={`/recruiter/tournaments/${tournament.id}`}>Back to Tournament</Link>
            </Button>
          ) : undefined
        }
        description={`${new Date(game.date).toLocaleString()} • ${game.location}`}
        title={`${getTeamName(data, game.homeTeamId)} vs ${getTeamName(data, game.awayTeamId)}`}
      />

      <section className="grid gap-4 md:grid-cols-2">
        {homeTeam ? (
          <TeamCard
            playerCount={homeTeam.playerIds.length}
            schoolName={getSchoolName(data, homeTeam.schoolId)}
            team={homeTeam}
          />
        ) : null}
        {awayTeam ? (
          <TeamCard
            playerCount={awayTeam.playerIds.length}
            schoolName={getSchoolName(data, awayTeam.schoolId)}
            team={awayTeam}
          />
        ) : null}
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Eligible Public Players</h2>
        {publicPlayers.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {publicPlayers.map((player) => {
              const isFavorite = favoritePlayerIds.includes(player.id);
              return (
                <PlayerCard
                  actionLabel={isFavorite ? "Unfavorite" : "Favorite"}
                  actionVariant={isFavorite ? "secondary" : "outline"}
                  key={player.id}
                  linkTo={`/recruiter/players/${player.id}`}
                  onAction={() => toggleFavoritePlayer(player.id)}
                  player={player}
                  teamNames={player.teamIds.map((teamId) => getTeamName(data, teamId))}
                />
              );
            })}
          </div>
        ) : (
          <EmptyState
            description="No public players are available in this game due to privacy rules."
            title="No eligible players"
          />
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Game Clips (Public Players Only)</h2>
        {clips.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {clips.map((clip) => (
              <ClipCard
                canSave
                clip={clip}
                isSaved={savedClipIds.includes(clip.id)}
                key={clip.id}
                onToggleSave={() => toggleSavedClip(clip.id)}
                playerName={playerNameById[clip.playerId] ?? "Unknown Player"}
              />
            ))}
          </div>
        ) : (
          <EmptyState description="No public clips are attached to this game yet." title="No clips" />
        )}
      </section>
    </div>
  );
}
