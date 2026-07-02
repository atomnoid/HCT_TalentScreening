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

export async function createRole(roleData) {
  const { data, error } = await supabase.from("roles").insert(roleData).single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateRole(id, roleData) {
  const { data, error } = await supabase
    .from("roles")
    .update(roleData)
    .eq("id", id)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteRole(id) {
  const { error } = await supabase.from("roles").delete().eq("id", id);

  if (error) {
    throw error;
  }

  return true;
}