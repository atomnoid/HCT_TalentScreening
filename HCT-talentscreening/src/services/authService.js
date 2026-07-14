// Supabase client used for all authentication and profile queries
import { supabase } from "../lib/supabase";

// Register a new auth user and create a profiles row linked to the auth user
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

// Sign in a user with email/password and return their profile (with role)
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
    .select("*, roles(name)")
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

// Get the currently authenticated user's profile including role
export async function getCurrentProfile() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("No active session.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*, roles(name)")
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

// Sign out the current session
export async function logoutUser() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }

  return true;
}

// Fetch all profiles with app_role = 'applicant'
export async function getApplicants() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("app_role", "applicant");

  if (error) {
    throw error;
  }

  return data ?? [];
}

