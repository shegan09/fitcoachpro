import { supabase } from "../supabase";

export async function saveProfile(uid, name, email, role, coachId = null, packageName = null) {
  const profileData = {
    id: uid,
    name,
    email,
    role,
    status: role === "client" ? "pending" : "active",
  };

  if (coachId) profileData.coach_id = coachId;
  if (packageName) profileData.selected_package = packageName;

  const { error } = await supabase
    .from("profiles")
    .upsert(profileData);

  if (error) console.error("saveProfile error:", error.message);
}

export async function getProfile(uid) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", uid)
    .single();
  if (error) return null;
  return data;
}