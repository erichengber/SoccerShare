import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { USER_ROLES } from "@/constants/domain";
import { defaultUserByRole } from "@/data/mockData";
import { capitalize } from "@/lib/format";
import { getDefaultPathForRole } from "@/lib/roleRouting";
import { useAuthStore } from "@/store/authStore";
import { useDataStore } from "@/store/dataStore";
import type { UserRole } from "@/types/domain";

export function RegisterPage() {
  const navigate = useNavigate();
  const { signUpWithEmail } = useAuthStore();
  const { data } = useDataStore();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("player");
  const [linkedUserId, setLinkedUserId] = useState<string>(defaultUserByRole.player);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    const defaultLinkedUserId = defaultUserByRole[nextRole];
    const fallbackLinkedUserId = nextUsers[0]?.id ?? "";
    setLinkedUserId(
      nextUsers.some((user) => user.id === defaultLinkedUserId) ? defaultLinkedUserId : fallbackLinkedUserId
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      if (normalizedEmail.endsWith("@example.com")) {
        setError("Please use a real email domain. Addresses at example.com are rejected by Supabase.");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      if (!linkedUserId) {
        setError("Please select a linked demo profile.");
        return;
      }

      const maybeError = await signUpWithEmail(normalizedEmail, password, {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        selected_role: role,
        selected_user_id: linkedUserId
      });

      if (maybeError) {
        setError(maybeError);
        return;
      }

      const { selectedRole, user } = useAuthStore.getState();
      if (user && selectedRole) {
        navigate(getDefaultPathForRole(selectedRole, linkedUserId, data));
        return;
      }

      navigate("/login");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 md:px-6">
      <div className="mx-auto w-full max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>
              Register with Supabase, then continue with the linked demo profile for your role.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First name</Label>
                  <Input
                    id="first-name"
                    disabled={isSubmitting}
                    onChange={(event) => setFirstName(event.target.value)}
                    required
                    value={firstName}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last name</Label>
                  <Input
                    id="last-name"
                    disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
                  <Select
                    disabled={isSubmitting}
                    onValueChange={(value) => handleRoleChange(value as UserRole)}
                    value={role}
                  >
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
                  <Select disabled={isSubmitting} onValueChange={setLinkedUserId} value={linkedUserId}>
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

              <Button className="w-full" disabled={isSubmitting} type="submit">
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
