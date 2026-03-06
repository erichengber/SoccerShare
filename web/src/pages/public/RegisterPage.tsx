import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { USER_ROLES } from "@/constants/domain";
import { capitalize } from "@/lib/format";
import { getHomePathForRole } from "@/lib/roleRouting";
import { useAuthStore } from "@/store/authStore";
import { useDataStore } from "@/store/dataStore";
import type { UserRole } from "@/types/domain";

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuthStore();
  const { data } = useDataStore();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("player");
  const [linkedUserId, setLinkedUserId] = useState<string>(data.players[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);

  const usersByRole = useMemo(
    () => ({
      player: data.players,
      parent: data.parents,
      coach: data.coaches,
      recruiter: data.recruiters
    }),
    [data]
  );

  function handleRoleChange(nextRole: UserRole) {
    setRole(nextRole);
    const nextUsers = usersByRole[nextRole];
    setLinkedUserId(nextUsers[0]?.id ?? "");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!linkedUserId) {
      setError("Please select a linked demo profile.");
      return;
    }

    const result = register({
      firstName,
      lastName,
      email,
      password,
      role,
      userId: linkedUserId
    });

    if (!result.success) {
      setError(result.error ?? "Unable to register account.");
      return;
    }

    if (result.onboardingRequired) {
      navigate("/onboarding/player");
      return;
    }

    if (result.role) {
      navigate(getHomePathForRole(result.role));
      return;
    }

    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 md:px-6">
      <div className="mx-auto w-full max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>
              This registers a local mock account now, with clear handoff points to replace with Supabase Auth later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First name</Label>
                  <Input
                    id="first-name"
                    onChange={(event) => setFirstName(event.target.value)}
                    required
                    value={firstName}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last name</Label>
                  <Input
                    id="last-name"
                    onChange={(event) => setLastName(event.target.value)}
                    required
                    value={lastName}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input
                  autoComplete="email"
                  id="register-email"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@school.org"
                  required
                  type="email"
                  value={email}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    autoComplete="new-password"
                    id="register-password"
                    minLength={8}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    type="password"
                    value={password}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm password</Label>
                  <Input
                    autoComplete="new-password"
                    id="confirm-password"
                    minLength={8}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                    type="password"
                    value={confirmPassword}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="register-role">Role</Label>
                  <Select onValueChange={(value) => handleRoleChange(value as UserRole)} value={role}>
                    <SelectTrigger id="register-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {USER_ROLES.map((entry) => (
                        <SelectItem key={entry} value={entry}>
                          {capitalize(entry)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linked-profile">Linked demo profile</Label>
                  <Select onValueChange={setLinkedUserId} value={linkedUserId}>
                    <SelectTrigger id="linked-profile">
                      <SelectValue placeholder="Select profile" />
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
              </div>

              {error ? <p className="text-sm text-destructive">{error}</p> : null}

              <Button className="w-full" type="submit">
                Create Account
              </Button>
            </form>

            <p className="mt-4 text-sm text-muted-foreground">
              Already have an account? <Link className="text-primary underline" to="/login">Sign in</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
