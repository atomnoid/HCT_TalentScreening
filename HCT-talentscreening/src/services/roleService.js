import { supabase } from "../lib/supabase";

export async function getRoles() {
  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .order("name");

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}