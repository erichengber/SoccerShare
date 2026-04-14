import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { capitalize } from "@/lib/format";
import type { Team } from "@/types/domain";

interface TeamCardProps {
  team: Team;
  schoolName?: string;
  playerCount: number;
}

export function TeamCard({ team, schoolName, playerCount }: TeamCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="min-w-0 flex-1 text-lg leading-snug">{team.name}</CardTitle>
          <Badge className="shrink-0 self-start" variant="secondary">
            {capitalize(team.level)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p>{schoolName ? `School: ${schoolName}` : "Independent team"}</p>
        <p>Roster size: {playerCount}</p>
      </CardContent>
    </Card>
  );
}
