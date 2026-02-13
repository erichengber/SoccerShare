import { useMemo } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { useAuthStore } from "@/store/authStore";
import { useDataStore } from "@/store/dataStore";

export function PrivacySettingsPage() {
  const { selectedUserId } = useAuthStore();
  const { data, setPlayerPrivacy } = useDataStore();

  const player = data.players.find((entry) => entry.id === selectedUserId);
  const isPublic = useMemo(() => player?.privacy === "public", [player]);

  if (!player) {
    return <EmptyState description="Select a valid player demo user." title="Player not found" />;
  }

  return (
    <div>
      <PageHeader
        description="Privacy is absolute and applies to your full profile and clips."
        title="Privacy Settings"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Current Visibility
            <Badge>{isPublic ? "Public" : "Private"}</Badge>
          </CardTitle>
          <CardDescription>
            Public profiles are visible to recruiters. Private profiles are hidden from recruiters and any
            non-linked users.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button disabled={isPublic} onClick={() => setPlayerPrivacy(player.id, "public")}>
            Set Public
          </Button>
          <Button
            disabled={!isPublic}
            onClick={() => setPlayerPrivacy(player.id, "private")}
            variant="outline"
          >
            Set Private
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
