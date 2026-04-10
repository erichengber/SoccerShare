import { Link } from "react-router-dom";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { capitalize } from "@/lib/format";
import type { Player } from "@/types/domain";

interface PlayerCardProps {
  player: Player;
  teamNames: string[];
  linkTo?: string;
  editTo?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionVariant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
}

export function PlayerCard({
  player,
  teamNames,
  linkTo,
  editTo,
  actionLabel,
  onAction,
  actionVariant = "outline"
}: PlayerCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">
              {player.firstName} {player.lastName}
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {player.position} • Class of {player.gradYear} • #{player.jerseyNumber}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {editTo ? (
              <Button asChild size="icon" variant="ghost">
                <Link aria-label="Edit profile" to={editTo}>
                  <Pencil className="h-4 w-4" />
                </Link>
              </Button>
            ) : null}
            <Badge variant={player.privacy === "public" ? "default" : "secondary"}>
              {capitalize(player.privacy)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <img
          alt={`${player.firstName} ${player.lastName}`}
          className="h-24 w-24 rounded-full border object-cover"
          src={player.avatarUrl}
        />
        <p className="text-sm text-muted-foreground line-clamp-2">{player.bio}</p>
        <div className="flex flex-wrap gap-2">
          {teamNames.map((team) => (
            <Badge key={team} variant="outline">
              {team}
            </Badge>
          ))}
        </div>
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
