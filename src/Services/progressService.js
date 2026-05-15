import { supabase } from "../supabase";

export async function logProgress(clientId, entry) {
  const { error } = await supabase
    .from("progress")
    .insert({ client_id: clientId, ...entry });
  if (error) throw new Error(error.message);
}

export async function getProgress(clientId) {
  const { data, error } = await supabase
    .from("progress")
    .select("*")
    .eq("client_id", clientId)
    .order("logged_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
}