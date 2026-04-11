import { useMemo, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { Camera, CircleUserRound } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PLAYER_POSITIONS, TEAM_LEVELS } from "@/constants/domain";
import { capitalize } from "@/lib/format";
import { getHomePathForRole } from "@/lib/roleRouting";
import { useAuthStore } from "@/store/authStore";
import { useDataStore } from "@/store/dataStore";
import type { PlayerPosition, TeamLevel } from "@/types/domain";

export function AccountPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { selectedRole, selectedUserId } = useAuthStore();
  const {
    data,
    updateCoachProfile,
    updateParentProfile,
    updatePlayerProfile,
    updateRecruiterProfile
  } = useDataStore();

  const player = selectedRole === "player" ? data.players.find((entry) => entry.id === selectedUserId) : undefined;
  const parent = selectedRole === "parent" ? data.parents.find((entry) => entry.id === selectedUserId) : undefined;
  const coach = selectedRole === "coach" ? data.coaches.find((entry) => entry.id === selectedUserId) : undefined;
  const recruiter =
    selectedRole === "recruiter" ? data.recruiters.find((entry) => entry.id === selectedUserId) : undefined;
  const coachTeam = coach?.teamId ? data.teams.find((entry) => entry.id === coach.teamId) : undefined;

  const [avatarUrl, setAvatarUrl] = useState(
    player?.avatarUrl ?? parent?.avatarUrl ?? coach?.avatarUrl ?? recruiter?.avatarUrl ?? ""
  );
  const [position, setPosition] = useState<PlayerPosition>(player?.position ?? PLAYER_POSITIONS[0]);
  const [jerseyNumber, setJerseyNumber] = useState(String(player?.jerseyNumber ?? ""));
  const [playerTeamId, setPlayerTeamId] = useState(player?.teamIds[0] ?? data.teams[0]?.id ?? "");
  const [bio, setBio] = useState(player?.bio ?? "");
  const [linkedPlayerId, setLinkedPlayerId] = useState(parent?.playerIds[0] ?? data.players[0]?.id ?? "");
  const [teamName, setTeamName] = useState(coachTeam?.name ?? "");
  const [teamLevel, setTeamLevel] = useState<TeamLevel>(coachTeam?.level ?? "club");
  const [schoolId, setSchoolId] = useState(coach?.schoolId ?? "none");
  const [organization, setOrganization] = useState(recruiter?.organization ?? "");
  const [region, setRegion] = useState(recruiter?.region ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initials = useMemo(() => {
    const activeProfile = player ?? parent ?? coach ?? recruiter;
    return `${activeProfile?.firstName[0] ?? ""}${activeProfile?.lastName[0] ?? ""}`.toUpperCase();
  }, [coach, parent, player, recruiter]);

  if (!selectedRole || !selectedUserId) {
    return <Navigate replace to="/" />;
  }

  if (
    (selectedRole === "player" && !player) ||
    (selectedRole === "parent" && !parent) ||
    (selectedRole === "coach" && (!coach || !coachTeam)) ||
    (selectedRole === "recruiter" && !recruiter)
  ) {
    return <Navigate replace to={getHomePathForRole(selectedRole)} />;
  }

  const activePlayer = selectedRole === "player" ? player : undefined;
  const activeParent = selectedRole === "parent" ? parent : undefined;
  const activeCoach = selectedRole === "coach" ? coach : undefined;
  const activeRecruiter = selectedRole === "recruiter" ? recruiter : undefined;

  async function handleAvatarFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Profile picture must be 5MB or smaller.");
      return;
    }

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
      reader.onerror = () => reject(new Error("Unable to read file."));
      reader.readAsDataURL(file);
    }).catch(() => "");

    if (!dataUrl) {
      setError("Unable to process image. Try a different file.");
      return;
    }

    setAvatarUrl(dataUrl);
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      let result;

      switch (selectedRole) {
        case "player":
          result = await updatePlayerProfile({
            playerId: activePlayer!.id,
            position,
            jerseyNumber: Number(jerseyNumber),
            teamId: playerTeamId,
            bio,
            avatarUrl
          });
          break;
        case "parent":
          result = await updateParentProfile({
            parentId: activeParent!.id,
            avatarUrl,
            playerId: linkedPlayerId
          });
          break;
        case "coach":
          result = await updateCoachProfile({
            coachId: activeCoach!.id,
            avatarUrl,
            teamName,
            level: teamLevel,
            schoolId: schoolId === "none" ? undefined : schoolId
          });
          break;
        case "recruiter":
          result = await updateRecruiterProfile({
            recruiterId: activeRecruiter!.id,
            avatarUrl,
            organization,
            region
          });
          break;
        default:
          result = { success: false, error: "Unable to determine account type." };
      }

      if (!result.success) {
        setError(result.error ?? "Unable to update profile.");
        return;
      }

      setSuccess("Profile updated successfully.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <PageHeader
        description="Update the profile details tied to your current SoccerShare account."
        title="Account"
      />

      <Card>
        <CardContent className="space-y-8 p-6">
          <div className="flex flex-col gap-6 rounded-3xl border bg-slate-50/80 p-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <button
                className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-200 shadow-sm"
                onClick={() => fileInputRef.current?.click()}
                type="button"
              >
                {avatarUrl ? (
                  <img
                    alt="Profile avatar"
                    className="h-full w-full object-cover"
                    src={avatarUrl}
                  />
                ) : (
                  <span className="text-2xl font-semibold text-slate-600">{initials}</span>
                )}
              </button>
              <div>
                <p className="text-sm font-medium text-slate-900">Profile photo</p>
                <p className="mt-1 text-sm text-slate-500">PNG, JPG, or WEBP. Max file size 5MB.</p>
              </div>
            </div>

            <div>
              <input
                accept="image/*"
                className="hidden"
                onChange={handleAvatarFileChange}
                ref={fileInputRef}
                type="file"
              />
              <Button onClick={() => fileInputRef.current?.click()} type="button" variant="outline">
                <Camera className="h-4 w-4" />
                Change Photo
              </Button>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {selectedRole === "player" ? (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="player-position">Position</Label>
                    <Select onValueChange={(value) => setPosition(value as PlayerPosition)} value={position}>
                      <SelectTrigger id="player-position">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PLAYER_POSITIONS.map((entry) => (
                          <SelectItem key={entry} value={entry}>
                            {entry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="player-jersey">Jersey number</Label>
                    <Input
                      id="player-jersey"
                      inputMode="numeric"
                      max={99}
                      min={0}
                      onChange={(event) => setJerseyNumber(event.target.value)}
                      required
                      type="number"
                      value={jerseyNumber}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="player-team">Team</Label>
                  <Select onValueChange={setPlayerTeamId} value={playerTeamId}>
                    <SelectTrigger id="player-team">
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      {data.teams.map((teamOption) => (
                        <SelectItem key={teamOption.id} value={teamOption.id}>
                          {teamOption.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="player-bio">Profile summary</Label>
                  <Textarea
                    id="player-bio"
                    onChange={(event) => setBio(event.target.value)}
                    placeholder="Describe your playing style, strengths, and goals."
                    required
                    rows={5}
                    value={bio}
                  />
                </div>
              </>
            ) : null}

            {selectedRole === "parent" ? (
              <div className="space-y-2">
                <Label htmlFor="parent-player">Linked player</Label>
                <Select onValueChange={setLinkedPlayerId} value={linkedPlayerId}>
                  <SelectTrigger id="parent-player">
                    <SelectValue placeholder="Select player" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.players.map((playerOption) => (
                      <SelectItem key={playerOption.id} value={playerOption.id}>
                        {playerOption.firstName} {playerOption.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            {selectedRole === "coach" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="coach-team-name">Team name</Label>
                  <Input
                    id="coach-team-name"
                    onChange={(event) => setTeamName(event.target.value)}
                    required
                    value={teamName}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="coach-team-level">Team level</Label>
                    <Select onValueChange={(value) => setTeamLevel(value as TeamLevel)} value={teamLevel}>
                      <SelectTrigger id="coach-team-level">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TEAM_LEVELS.map((entry) => (
                          <SelectItem key={entry} value={entry}>
                            {capitalize(entry)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coach-school">School affiliation</Label>
                    <Select onValueChange={setSchoolId} value={schoolId}>
                      <SelectTrigger id="coach-school">
                        <SelectValue placeholder="Independent team" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Independent team</SelectItem>
                        {data.schools.map((schoolOption) => (
                          <SelectItem key={schoolOption.id} value={schoolOption.id}>
                            {schoolOption.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            ) : null}

            {selectedRole === "recruiter" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="recruiter-organization">Organization</Label>
                  <Input
                    id="recruiter-organization"
                    onChange={(event) => setOrganization(event.target.value)}
                    required
                    value={organization}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recruiter-region">Recruiting region</Label>
                  <Input
                    id="recruiter-region"
                    onChange={(event) => setRegion(event.target.value)}
                    required
                    value={region}
                  />
                </div>
              </>
            ) : null}

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {success ? <p className="text-sm text-emerald-600">{success}</p> : null}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-6">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <CircleUserRound className="h-4 w-4" />
                Changes save back to your Supabase-backed profile data.
              </div>
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
