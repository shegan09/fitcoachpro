import { supabase } from "../supabase";

export async function getPackages(coachId) {
  const { data, error } = await supabase
    .from("packages")
    .select("*")
    .eq("coach_id", coachId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function createPackage(coachId, pkg) {
  const { error } = await supabase
    .from("packages")
    .insert({ coach_id: coachId, ...pkg });
  if (error) throw new Error(error.message);
}

export async function deletePackage(id) {
  const { error } = await supabase.from("packages").delete().eq("id", id);
  if (error) throw new Error(error.message);
}