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
