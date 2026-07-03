// Supabase client used to read and write `roles` rows
import { supabase } from "../lib/supabase";

// Fetch all roles ordered by name. Returns empty array on error.
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

// Create a new role row and return the created object
export async function createRole(roleData) {
  const { data, error } = await supabase.from("roles").insert(roleData).single();

  if (error) {
    throw error;
  }

  return data;
}

// Update an existing role by id and return the updated row
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

// Delete a role by id. Throws on error.
export async function deleteRole(id) {
  const { error } = await supabase.from("roles").delete().eq("id", id);

  if (error) {
    throw error;
  }

  return true;
}