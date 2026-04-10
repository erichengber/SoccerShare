import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { capitalize } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Player } from "@/types/domain";

interface PlayerCardProps {
  player: Player;
  teamNames: string[];
  linkTo?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionVariant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
  variant?: "compact" | "profile";
}

export function PlayerCard({
  player,
  teamNames,
  linkTo,
  actionLabel,
  onAction,
  actionVariant = "outline",
  variant = "compact"
}: PlayerCardProps) {
  const displayName = `${player.firstName} ${player.lastName}`;
  const initials = `${player.firstName[0] ?? ""}${player.lastName[0] ?? ""}`.toUpperCase();
  const profileMeta = `${player.position} • Class of ${player.gradYear} • #${player.jerseyNumber}`;
  const profileBio = player.bio.trim() || "Profile summary coming soon.";
  const hasActionRow = Boolean(linkTo || (actionLabel && onAction));
  const avatar = player.avatarUrl ? (
    <img
      alt={displayName}
      className={cn(
        "border object-cover",
        variant === "profile" ? "h-32 w-32 rounded-3xl shadow-sm" : "h-24 w-24 rounded-full"
      )}
      src={player.avatarUrl}
    />
  ) : (
    <div
      className={cn(
        "flex items-center justify-center border bg-muted font-semibold text-muted-foreground",
        variant === "profile" ? "h-32 w-32 rounded-3xl text-3xl" : "h-24 w-24 rounded-full text-2xl"
      )}
    >
      {initials}
    </div>
  );

  if (variant === "profile") {
    return (
      <Card className="h-full">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-2xl">{displayName}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">{profileMeta}</p>
            </div>
            <Badge className="shrink-0" variant={player.privacy === "public" ? "default" : "secondary"}>
              {capitalize(player.privacy)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            {avatar}
            <div className="flex-1 space-y-4">
              <p className="text-sm leading-6 text-muted-foreground">{profileBio}</p>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Teams
                </p>
                {teamNames.length ? (
                  <div className="flex flex-wrap gap-2">
                    {teamNames.map((team) => (
                      <Badge key={team} variant="outline">
                        {team}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No teams linked yet.</p>
                )}
              </div>
            </div>
          </div>

          {hasActionRow ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              {linkTo ? (
                <Button asChild className="flex-1" size="sm">
                  <Link to={linkTo}>View Profile</Link>
                </Button>
              ) : null}
              {actionLabel && onAction ? (
                <Button className="flex-1" onClick={onAction} size="sm" variant={actionVariant}>
                  {actionLabel}
                </Button>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">
              {displayName}
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{profileMeta}</p>
          </div>
          <Badge variant={player.privacy === "public" ? "default" : "secondary"}>
            {capitalize(player.privacy)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {avatar}
        <p className="line-clamp-2 text-sm text-muted-foreground">{profileBio}</p>
        {teamNames.length ? (
          <div className="flex flex-wrap gap-2">
            {teamNames.map((team) => (
              <Badge key={team} variant="outline">
                {team}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No teams linked yet.</p>
        )}
        <div className="flex gap-2">
          {linkTo ? (
            <Button asChild className="flex-1" size="sm">
              <Link to={linkTo}>View Profile</Link>
            </Button>
          ) : null}
          {actionLabel && onAction ? (
            <Button className="flex-1" onClick={onAction} size="sm" variant={actionVariant}>
              {actionLabel}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
