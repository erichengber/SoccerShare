import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import type { Game } from "@/types/domain";

interface GameCardProps {
  game: Game;
  homeTeamName: string;
  awayTeamName: string;
  linkTo?: string;
}

export function GameCard({ game, homeTeamName, awayTeamName, linkTo }: GameCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">
          {homeTeamName} vs {awayTeamName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-muted-foreground">{formatDateTime(game.date)}</p>
        <p className="text-muted-foreground">{game.location}</p>
        {linkTo ? (
          <Button asChild size="sm">
            <Link to={linkTo}>View Game</Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
