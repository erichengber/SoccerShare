import { Link } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { useAuthStore } from "@/store/authStore";
import { useDataStore } from "@/store/dataStore";

export function ParentOverviewPage() {
  const { selectedUserId } = useAuthStore();
  const { data } = useDataStore();

  const parent = data.parents.find((entry) => entry.id === selectedUserId);
  if (!parent) {
    return <EmptyState description="Parent profile not found for this account." title="Parent not found" />;
  }

  const players = data.players.filter((player) => parent.playerIds.includes(player.id));
  const clipsCount = data.clips.filter((clip) => parent.playerIds.includes(clip.playerId)).length;

  return (
    <div>
      <PageHeader
        action={
          <Button asChild>
            <Link to="/parent/players">Manage Players</Link>
          </Button>
        }
        description="Follow your linked athletes and contribute clips."
        title={`Welcome, ${parent.firstName}`}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Linked Players</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{players.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Clips</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{clipsCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Private Profiles</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {players.filter((player) => player.privacy === "private").length}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
