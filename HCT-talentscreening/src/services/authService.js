import { supabase } from "../lib/supabase";

export async function registerUser(formData) {
  // 1. Create Auth User
  const { data: authData, error: authError } =
    await supabase.auth.signUp({
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

  // 2. Create Profile
  const { error: profileError } = await supabase
    .from("profiles")
    .insert({
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