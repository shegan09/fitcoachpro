import { supabase } from "../supabase";

export async function uploadWorkoutFile(coachId, file) {
  const fileExt = file.name.split(".").pop();
  const fileName = `${coachId}/${Date.now()}.${fileExt}`;

  const { error } = await supabase.storage
    .from("workouts")
    .upload(fileName, file);

  if (error) {
    console.error("uploadWorkoutFile error:", error.message);
    return null;
  }

  const { data } = supabase.storage
    .from("workouts")
    .getPublicUrl(fileName);

  return data.publicUrl;
}

export async function saveWorkout(coachId, workout) {
  const { error } = await supabase
    .from("workouts")
    .insert({ coach_id: coachId, ...workout });
  if (error) console.error("saveWorkout error:", error.message);
}

export async function getCoachWorkouts(coachId) {
  const { data, error } = await supabase
    .from("workouts")
    .select("*")
    .eq("coach_id", coachId)
    .order("created_at", { ascending: false });
  if (error) console.error("getCoachWorkouts error:", error.message);
  return data || [];
}

export async function deleteWorkout(id) {
  const { error } = await supabase
    .from("workouts")
    .delete()
    .eq("id", id);
  if (error) console.error("deleteWorkout error:", error.message);
}