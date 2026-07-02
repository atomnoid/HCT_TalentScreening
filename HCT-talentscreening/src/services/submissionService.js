import { supabase } from "../lib/supabase";

// Saves a single submission record with score and total question count.
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
export async function getSubmissions() {
  const { data, error } = await supabase
    .from("submissions")
    .select(
      `*, profiles(full_name, email), roles(name)`
    )
    .order("submitted_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}
