import { supabase } from "../supabase";

export async function getClients(coachId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "client")
    .eq("coach_id", coachId)
    .order("created_at", { ascending: false });
  if (error) console.error("getClients error:", error.message);
  return data || [];
}

export async function updateClientStatus(clientId, status) {
  const { error } = await supabase
    .from("profiles")
    .update({ status })
    .eq("id", clientId);
  if (error) console.error("updateClientStatus error:", error.message);
  else console.log("✅ Client status updated:", status);
}