import { supabase } from "../lib/supabase";

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

export async function getQuestionsByRole(roleId) {
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("role_id", roleId)
    .order("question", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function createQuestion(questionData) {
  const { data, error } = await supabase.from("questions").insert(questionData).single();

  if (error) {
    throw error;
  }

  return data;
}

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

export async function deleteQuestion(id) {
  const { error } = await supabase.from("questions").delete().eq("id", id);

  if (error) {
    throw error;
  }

  return true;
}
