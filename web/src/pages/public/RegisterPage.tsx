import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { USER_ROLES } from "@/constants/domain";
import { capitalize } from "@/lib/format";
import { getOnboardingPathForRole } from "@/lib/roleRouting";
import { useAuthStore } from "@/store/authStore";
import type { UserRole } from "@/types/domain";

type RoleSelection = UserRole | "unset";

export function RegisterPage() {
  const navigate = useNavigate();
  const { signUpWithEmail } = useAuthStore();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<RoleSelection>("unset");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [stateOrRegion, setStateOrRegion] = useState("");
  const [organization, setOrganization] = useState("");
  const [recruiterRegion, setRecruiterRegion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleRoleChange(nextRole: RoleSelection) {
    setRole(nextRole);
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

      const trimmedFirstName = firstName.trim();
      const trimmedLastName = lastName.trim();
      if (!trimmedFirstName || !trimmedLastName) {
        setError("First and last name are required.");
        return;
      }

      const metadata: Record<string, unknown> = {};

      metadata.first_name = trimmedFirstName;
      metadata.last_name = trimmedLastName;
      if (role !== "unset") metadata.selected_role = role;

      const trimmedPhone = phone.trim();
      const trimmedCity = city.trim();
      const trimmedStateOrRegion = stateOrRegion.trim();
      const trimmedOrganization = organization.trim();
      const trimmedRecruiterRegion = recruiterRegion.trim();

      if (trimmedPhone) metadata.phone = trimmedPhone;
      if (trimmedCity) metadata.city = trimmedCity;
      if (trimmedStateOrRegion) metadata.state_or_region = trimmedStateOrRegion;

      if (role === "recruiter") {
        if (trimmedOrganization) metadata.organization = trimmedOrganization;
        if (trimmedRecruiterRegion) metadata.recruiter_region = trimmedRecruiterRegion;
      }

      const maybeError = await signUpWithEmail(
        normalizedEmail,
        password,
        Object.keys(metadata).length > 0 ? metadata : undefined
      );

      if (maybeError) {
        setError(maybeError);
        return;
      }

      const { selectedRole, user } = useAuthStore.getState();
      if (user && selectedRole) {
        navigate(getOnboardingPathForRole(selectedRole));
        return;
      }

      navigate("/select-role");
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
              Register with Supabase, then continue as your selected role.
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
                  placeholder="you@yourdomain.com"
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
                    onValueChange={(value) => handleRoleChange(value as RoleSelection)}
                    value={role}
                  >
                    <SelectTrigger id="register-role">
                      <SelectValue placeholder="Choose later" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unset">Choose later</SelectItem>
                      {USER_ROLES.map((entry) => (
                        <SelectItem key={entry} value={entry}>
                          {capitalize(entry)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="optional-phone">Phone (optional)</Label>
                <Input
                  id="optional-phone"
                  disabled={isSubmitting}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="(555) 123-4567"
                  value={phone}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="optional-city">City (optional)</Label>
                  <Input
                    id="optional-city"
                    disabled={isSubmitting}
                    onChange={(event) => setCity(event.target.value)}
                    placeholder="Austin"
                    value={city}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="optional-state-region">State or region (optional)</Label>
                  <Input
                    id="optional-state-region"
                    disabled={isSubmitting}
                    onChange={(event) => setStateOrRegion(event.target.value)}
                    placeholder="TX"
                    value={stateOrRegion}
                  />
                </div>
              </div>

              {role === "recruiter" ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="optional-organization">Organization (optional)</Label>
                    <Input
                      id="optional-organization"
                      disabled={isSubmitting}
                      onChange={(event) => setOrganization(event.target.value)}
                      placeholder="Midwest FC"
                      value={organization}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="optional-recruiter-region">Recruiting region (optional)</Label>
                    <Input
                      id="optional-recruiter-region"
                      disabled={isSubmitting}
                      onChange={(event) => setRecruiterRegion(event.target.value)}
                      placeholder="Midwest"
                      value={recruiterRegion}
                    />
                  </div>
                </div>
              ) : null}

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
