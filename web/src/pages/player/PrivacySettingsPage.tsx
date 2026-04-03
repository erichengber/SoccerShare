import { useMemo } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { useAuthStore } from "@/store/authStore";
import { useDataStore } from "@/store/dataStore";

export function PrivacySettingsPage() {
  const { selectedUserId } = useAuthStore();
  const { data } = useDataStore();

  const player = data.players.find((entry) => entry.id === selectedUserId);
  const isPublic = useMemo(() => player?.privacy === "public", [player]);

  if (!player) {
    return <EmptyState description="Player profile not found for this account." title="Player not found" />;
  }

  return (
    <div>
      <PageHeader
        description="Visibility applies to your full profile and clips."
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
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Privacy changes are managed by a linked parent account.</p>
          <p>Ask a parent to open your profile from the parent workflow and update visibility there.</p>
        </CardContent>
      </Card>
    </div>
  );
}
