import { supabase } from "../supabase";

export async function uploadPaymentProof(clientId, file) {
  const fileExt = file.name.split(".").pop();
  const fileName = `${clientId}/${Date.now()}.${fileExt}`;
  const { error } = await supabase.storage
    .from("payment-proofs")
    .upload(fileName, file);
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from("payment-proofs").getPublicUrl(fileName);
  return data.publicUrl;
}

export async function submitPayment(clientId, coachId, payment) {
  const { error } = await supabase
    .from("payments")
    .insert({ client_id: clientId, coach_id: coachId, ...payment });
  if (error) throw new Error(error.message);
}

export async function getCoachPayments(coachId) {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("coach_id", coachId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function getClientPayments(clientId) {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function updatePaymentStatus(id, status) {
  const { error } = await supabase
    .from("payments")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function getCoachIdFromSupabase() {
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "coach")
    .limit(1)
    .single();
  return data?.id || null;
}