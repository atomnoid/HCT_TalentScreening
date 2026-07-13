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

// Fetch a single role by id.
export async function getRoleById(id) {
  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Create a new role row and return the created object
export async function createRole(roleData) {
  const normalizedRoleData = {
    ...roleData,
    is_active: true,
    quiz_duration_minutes:
      roleData.quiz_duration_minutes === undefined || roleData.quiz_duration_minutes === ""
        ? 15
        : Number(roleData.quiz_duration_minutes),
  };

  const { data, error } = await supabase
    .from("roles")
    .insert(normalizedRoleData)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Update an existing role by id and return the updated row
export async function updateRole(id, roleData) {
  const normalizedRoleData = {
    ...roleData,
    quiz_duration_minutes:
      roleData.quiz_duration_minutes === undefined || roleData.quiz_duration_minutes === ""
        ? 15
        : Number(roleData.quiz_duration_minutes),
  };

  const { data, error } = await supabase
    .from("roles")
    .update(normalizedRoleData)
    .eq("id", id)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Deactivate a role by id. Throws on error.
export async function deactivateRole(id) {
  const { error } = await supabase
    .from("roles")
    .update({ is_active: false })
    .eq("id", id);

  if (error) {
    throw error;
  }

  return true;
}

// Activate a role by id. Throws on error.
export async function activateRole(id) {
  const { error } = await supabase
    .from("roles")
    .update({ is_active: true })
    .eq("id", id);

  if (error) {
    throw error;
  }

  return true;
}