import { supabase } from "@/lib/supabase";

interface RecruiterClientResult<T> {
  data?: T;
  error?: string;
}

interface UpsertRecruiterPayload {
  recruiterId: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string;
  organization: string;
  region: string;
}

export async function upsertRecruiterInSupabase(
  payload: UpsertRecruiterPayload
): Promise<RecruiterClientResult<{ id: string }>> {
  if (!supabase) {
    return {
      error:
        "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY (or VITE_SUPABASE_ANON_KEY)."
    };
  }

  const firstName = payload.firstName.trim();
  const lastName = payload.lastName.trim();
  const email = payload.email.trim().toLowerCase();
  const avatarUrl = payload.avatarUrl.trim();
  const organization = payload.organization.trim();
  const region = payload.region.trim();

  if (!firstName || !lastName || !email || !avatarUrl || !organization || !region) {
    return {
      error: "Recruiter profile is missing required fields."
    };
  }

  const { data, error } = await supabase
    .from("recruiters")
    .upsert({
      id: payload.recruiterId,
      role: "recruiter",
      first_name: firstName,
      last_name: lastName,
      email,
      avatar_url: avatarUrl,
      organization,
      region
    })
    .select("id")
    .single();

  if (error || !data) {
    return {
      error: error?.message ?? "Unable to save recruiter in Supabase."
    };
  }

  return {
    data: {
      id: data.id as string
    }
  };
}
