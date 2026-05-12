import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Key:", supabaseKey ? "✅ Found" : "❌ Missing");

export const supabase = createClient(supabaseUrl, supabaseKey);

// ── PROFILES ──────────────────────────────────────────

export async function saveProfile(uid, name, email, role) {
  console.log("Saving profile...", { uid, name, email, role });
  const { data, error } = await supabase
    .from("profiles")
    .upsert({ id: uid, name, email, role });
  if (error) console.error("❌ saveProfile error:", error.message);
  else console.log("✅ Profile saved successfully!");
}

export async function getProfile(uid) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", uid)
    .single();
  if (error) console.error("getProfile error:", error.message);
  return data;
}

// ── CLIENTS ────────────────────────────────────────────

export async function getClients(coachId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "client")
    .order("created_at", { ascending: false });
  if (error) console.error("getClients error:", error.message);
  return data || [];
}

export async function updateClientStatus(clientId, status) {
  const { error } = await supabase
    .from("clients")
    .update({ status })
    .eq("id", clientId);
  if (error) console.error("updateClientStatus error:", error.message);
}

// ── PACKAGES ───────────────────────────────────────────

export async function getPackages(coachId) {
  const { data, error } = await supabase
    .from("packages")
    .select("*")
    .eq("coach_id", coachId)
    .order("created_at", { ascending: true });
  if (error) console.error("getPackages error:", error.message);
  return data || [];
}

export async function createPackage(coachId, pkg) {
  const { error } = await supabase
    .from("packages")
    .insert({ coach_id: coachId, ...pkg });
  if (error) console.error("createPackage error:", error.message);
}

export async function deletePackage(id) {
  const { error } = await supabase
    .from("packages")
    .delete()
    .eq("id", id);
  if (error) console.error("deletePackage error:", error.message);
}

// ── WORKOUTS ───────────────────────────────────────────

export async function uploadWorkoutFile(coachId, file) {
  console.log("📁 Starting upload...", { coachId, fileName: file.name });
  const fileExt = file.name.split(".").pop();
  const fileName = `${coachId}/${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from("workouts")
    .upload(fileName, file);

  if (error) {
    console.error("❌ Upload error:", error.message);
    return null;
  }

  console.log("✅ File uploaded!", data);

  const { data: urlData } = supabase.storage
    .from("workouts")
    .getPublicUrl(fileName);

  console.log("🔗 Public URL:", urlData.publicUrl);
  return urlData.publicUrl;
}

export async function saveWorkout(coachId, workout) {
  console.log("💾 Saving workout to DB...", { coachId, workout });
  const { data, error } = await supabase
    .from("workouts")
    .insert({ coach_id: coachId, ...workout })
    .select();
  if (error) console.error("❌ saveWorkout error:", error.message);
  else console.log("✅ Workout saved!", data);
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

export async function deleteWorkoutById(id) {
  const { error } = await supabase
    .from("workouts")
    .delete()
    .eq("id", id);
  if (error) console.error("deleteWorkout error:", error.message);
}

export async function saveDiet(coachId, diet) {
  const { error } = await supabase
    .from("workouts")
    .insert({ coach_id: coachId, type: "Diet Chart", ...diet });
  if (error) console.error("saveDiet error:", error.message);
}

// ── PROGRESS ───────────────────────────────────────────

export async function getProgress(clientId) {
  const { data, error } = await supabase
    .from("progress")
    .select("*")
    .eq("client_id", clientId)
    .order("logged_at", { ascending: true });
  if (error) console.error("getProgress error:", error.message);
  return data || [];
}

export async function logProgress(clientId, entry) {
  const { error } = await supabase
    .from("progress")
    .insert({ client_id: clientId, ...entry });
  if (error) console.error("logProgress error:", error.message);
}

// ── PAYMENTS ────────────────────────────────────────────

export async function uploadPaymentProof(clientId, file) {
  console.log("📸 Uploading payment proof...");
  const fileExt = file.name.split(".").pop();
  const fileName = `${clientId}/${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from("payment-proofs")
    .upload(fileName, file);

  if (error) {
    console.error("❌ uploadPaymentProof error:", error.message);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from("payment-proofs")
    .getPublicUrl(fileName);

  console.log("✅ Payment proof uploaded!", urlData.publicUrl);
  return urlData.publicUrl;
}

export async function submitPayment(clientId, coachId, payment) {
  console.log("💾 Saving payment...", { clientId, coachId, payment });
  const { error } = await supabase
    .from("payments")
    .insert({ client_id: clientId, coach_id: coachId, ...payment });
  if (error) console.error("❌ submitPayment error:", error.message);
  else console.log("✅ Payment saved!");
}

export async function getCoachPayments(coachId) {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("coach_id", coachId)
    .order("created_at", { ascending: false });
  if (error) console.error("getCoachPayments error:", error.message);
  return data || [];
}

export async function getClientPayments(clientId) {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  if (error) console.error("getClientPayments error:", error.message);
  return data || [];
}

export async function updatePaymentStatus(id, status) {
  const { error } = await supabase
    .from("payments")
    .update({ status })
    .eq("id", id);
  if (error) console.error("updatePaymentStatus error:", error.message);
  else console.log("✅ Payment status updated to:", status);
}