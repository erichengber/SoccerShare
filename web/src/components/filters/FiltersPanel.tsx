import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PLAYER_POSITIONS } from "@/constants/domain";
import type { RecruiterFilters, Team, Tournament } from "@/types/domain";

interface FiltersPanelProps {
  filters: RecruiterFilters;
  teams: Team[];
  tournaments: Tournament[];
  gradYears: number[];
  onChange: (filters: Partial<RecruiterFilters>) => void;
  onReset: () => void;
}

export function FiltersPanel({
  filters,
  teams,
  tournaments,
  gradYears,
  onChange,
  onReset
}: FiltersPanelProps) {
  return (
    <div className="grid gap-4 rounded-lg border bg-card p-4 md:grid-cols-5">
      <div className="space-y-2">
        <Label>Position</Label>
        <Select
          onValueChange={(value) =>
            onChange({ position: value === "all" ? undefined : (value as RecruiterFilters["position"]) })
          }
          value={filters.position ?? "all"}
        >
          <SelectTrigger>
            <SelectValue placeholder="Any position" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any position</SelectItem>
            {PLAYER_POSITIONS.map((position) => (
              <SelectItem key={position} value={position}>
                {position}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Grad Year</Label>
        <Select
          onValueChange={(value) => onChange({ gradYear: value === "all" ? undefined : Number(value) })}
          value={filters.gradYear ? String(filters.gradYear) : "all"}
        >
          <SelectTrigger>
            <SelectValue placeholder="Any grad year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any grad year</SelectItem>
            {gradYears.map((year) => (
              <SelectItem key={year} value={String(year)}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Team</Label>
        <Select
          onValueChange={(value) => onChange({ teamId: value === "all" ? undefined : value })}
          value={filters.teamId ?? "all"}
        >
          <SelectTrigger>
            <SelectValue placeholder="Any team" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any team</SelectItem>
            {teams.map((team) => (
              <SelectItem key={team.id} value={team.id}>
                {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Tournament</Label>
        <Select
          onValueChange={(value) => onChange({ tournamentId: value === "all" ? undefined : value })}
          value={filters.tournamentId ?? "all"}
        >
          <SelectTrigger>
            <SelectValue placeholder="Any tournament" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any tournament</SelectItem>
            {tournaments.map((tournament) => (
              <SelectItem key={tournament.id} value={tournament.id}>
                {tournament.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-end">
        <Button className="w-full" onClick={onReset} variant="outline">
          Clear Filters
        </Button>
      </div>
    </div>
  );
}
