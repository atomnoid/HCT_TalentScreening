// Supabase used for question and role
import { supabase } from "../lib/supabase";

// fetch roles used in dropdowns and forms
export async function getRoles() {
  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Failed to fetch roles:", error);
    return [];
  }

  return data ?? [];
}

// Retrieve the currently authenticated user's profile (applicant-facing)
export async function getApplicantProfile() {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  const user = userData?.user;

  if (!user) {
    throw new Error("No active session.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) {
    throw profileError;
  }

  if (!profile) {
    throw new Error("Profile not found.");
  }

  return profile;
}
// crud -
// Fetch question rows for a specific role. Throws on Supabase error.
export async function getQuestionsByRole(roleId) {
  console.log("Searching Questions For Role:", roleId);

  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("role_id", roleId)
    .order("question", { ascending: true });

  console.log("Supabase Response:", data);
  console.log("Supabase Error:", error);

  if (error) {
    throw error;
  }

  return data ?? [];
}

// Insert a new question row
export async function createQuestion(questionData) {
  const { data, error } = await supabase.from("questions").insert(questionData).single();

  if (error) {
    throw error;
  }

  return data;
}

// Update an existing question row by id
export async function updateQuestion(id, questionData) {
  const { data, error } = await supabase
    .from("questions")
    .update(questionData)
    .eq("id", id)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Delete a question by id
export async function deleteQuestion(id) {
  const { error } = await supabase.from("questions").delete().eq("id", id);

  if (error) {
    throw error;
  }

  return true;
}
