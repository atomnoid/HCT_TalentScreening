import { supabase } from "../lib/supabase";

// Save a single submission record with score and total question count.
// `applicant_id` is expected to be unique (prevents re-submits at DB level).
export async function createSubmission(submissionData) {
  const { data, error } = await supabase
    .from("submissions")
    .insert(submissionData)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

//Queries the submissions table and joins profiles and roles to get applicant name, email, and role name in one request.
// Fetch all submissions joined with applicant `profiles` and `roles`.
export async function getSubmissions() {
  const { data, error } = await supabase
    .from("submissions")
    .select(`*, profiles(full_name, email), roles(name)`)
    .order("submitted_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

// Return a single submission for an applicant or null if none exists.
export async function getSubmissionByApplicant(applicantId) {
  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("applicant_id", applicantId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ?? null;
}
