import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Recruiter } from "@/types/domain";

interface RecruiterClientResult<T> {
  data?: T;
  error?: string;
}

interface RecruiterRow {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  avatar_url: string | null;
  organization: string | null;
  region: string | null;
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

function mapRecruiterRowToRecruiter(row: RecruiterRow): Recruiter {
  return {
    id: row.id,
    role: "recruiter",
    firstName: row.first_name?.trim() || "New",
    lastName: row.last_name?.trim() || "Recruiter",
    email: row.email?.trim().toLowerCase() || "",
    avatarUrl: row.avatar_url?.trim() || "",
    organization: row.organization?.trim() || "",
    region: row.region?.trim() || ""
  };
}

export async function fetchRecruiterFromSupabase(
  recruiterId: string
): Promise<RecruiterClientResult<Recruiter>> {
  if (!isSupabaseConfigured || !supabase) {
    return {};
  }

  const { data, error } = await supabase
    .from("recruiters")
    .select("id, first_name, last_name, email, avatar_url, organization, region")
    .eq("id", recruiterId)
    .maybeSingle();

  if (error) {
    return {
      error: error.message
    };
  }

  if (!data) {
    return {};
  }

  return {
    data: mapRecruiterRowToRecruiter(data as RecruiterRow)
  };
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
