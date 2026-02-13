import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import type { Tournament } from "@/types/domain";

interface TournamentCardProps {
  tournament: Tournament;
  linkTo?: string;
}

export function TournamentCard({ tournament, linkTo }: TournamentCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{tournament.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <p>{tournament.location}</p>
        <p>
          {formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}
        </p>
        <p>{tournament.gameIds.length} games</p>
        {linkTo ? (
          <Button asChild size="sm">
            <Link to={linkTo}>View Tournament</Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
