import { supabase } from "../lib/supabase";

export async function registerUser(formData) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
  });

  if (authError) {
    throw authError;
  }

  const user = authData.user;

  if (!user) {
    throw new Error("User not created.");
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    id: user.id,
    email: formData.email,
    full_name: formData.fullName,
    phone: formData.phone,
    portfolio_url: formData.portfolio,
    application_role_id: formData.role,
    app_role: "applicant",
  });

  if (profileError) {
    throw profileError;
  }

  return user;
}

export async function loginUser({ email, password }) {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    throw authError;
  }

  const user = authData.user;

  if (!user) {
    throw new Error("Login failed.");
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
