import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { USER_ROLES } from "@/constants/domain";
import { defaultUserByRole } from "@/data/mockData";
import { getHomePathForRole } from "@/lib/roleRouting";
import { useAuthStore } from "@/store/authStore";
import { useDataStore } from "@/store/dataStore";
import type { UserRole } from "@/types/domain";

const roleDescriptions: Record<UserRole, string> = {
  player: "Manage your profile, clips, and schedule.",
  parent: "Support linked athletes, upload clips, and control profile privacy.",
  coach: "Review roster players, clips, and match schedule for your team.",
  recruiter: "Evaluate tournaments, games, and discover public player profiles."
};

export function SelectRolePage() {
  const navigate = useNavigate();
  const { selectRole } = useAuthStore();
  const { data } = useDataStore();

  const [role, setRole] = useState<UserRole>("player");
  const [selectedUserByRole, setSelectedUserByRole] = useState<Record<UserRole, string>>(defaultUserByRole);

  const usersByRole = useMemo(
    () => ({
      player: data.players,
      parent: data.parents,
      coach: data.coaches,
      recruiter: data.recruiters
    }),
    [data]
  );

  const selectedUserId = selectedUserByRole[role];

  function handleContinue() {
    selectRole(role, selectedUserId);
    navigate(getHomePathForRole(role));
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 md:px-6">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Select Demo Role</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose one session role and demo user to preview the product workflow.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Session Role</CardTitle>
            <CardDescription>Exactly one role is active per session.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 md:grid-cols-2">
              {USER_ROLES.map((candidateRole) => (
                <button
                  className={`rounded-lg border p-4 text-left transition ${
                    role === candidateRole
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border bg-white hover:bg-muted"
                  }`}
                  key={candidateRole}
                  onClick={() => setRole(candidateRole)}
                  type="button"
                >
                  <p className="text-sm font-semibold capitalize">{candidateRole}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{roleDescriptions[candidateRole]}</p>
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Demo User</p>
              <Select
                onValueChange={(value) =>
                  setSelectedUserByRole((prev) => ({
                    ...prev,
                    [role]: value
                  }))
                }
                value={selectedUserId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {usersByRole[role].map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button className="w-full" onClick={handleContinue}>
              Continue as {role}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
