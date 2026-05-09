import { supabase } from "./supabase";

// ── PROFILES ──────────────────────────────────────────

// Save user role after signup
export async function saveProfile(uid, name, email, role) {
  const { error } = await supabase
    .from("profiles")
    .upsert({ id: uid, name, email, role });
  if (error) console.error("saveProfile error:", error.message);
}

// Get a user's profile
export async function getProfile(uid) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", uid)
    .single();
  if (error) console.error("getProfile error:", error.message);
  return data;
}

// ── COACH ──────────────────────────────────────────────

// Save coach profile
export async function saveCoachProfile(uid, fields) {
  const { error } = await supabase
    .from("coaches")
    .upsert({ id: uid, ...fields });
  if (error) console.error("saveCoachProfile error:", error.message);
}

// Get coach profile
export async function getCoachProfile(uid) {
  const { data, error } = await supabase
    .from("coaches")
    .select("*")
    .eq("id", uid)
    .single();
  if (error) console.error("getCoachProfile error:", error.message);
  return data;
}

// ── CLIENTS ────────────────────────────────────────────

// Get all clients for a coach
export async function getClients(coachId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "client")
    .order("created_at", { ascending: false });
  if (error) console.error("getClients error:", error.message);
  return data || [];
}

// Get single client
export async function getClient(clientId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", clientId)
    .single();
  if (error) console.error("getClient error:", error.message);
  return data;
}

// Update client status
export async function updateClientStatus(clientId, status) {
  const { error } = await supabase
    .from("clients")
    .update({ status })
    .eq("id", clientId);
  if (error) console.error("updateClientStatus error:", error.message);
}

// ── PACKAGES ───────────────────────────────────────────

// Get packages for a coach
export async function getPackages(coachId) {
  const { data, error } = await supabase
    .from("packages")
    .select("*")
    .eq("coach_id", coachId)
    .order("created_at", { ascending: true });
  if (error) console.error("getPackages error:", error.message);
  return data || [];
}

// Create a package
export async function createPackage(coachId, pkg) {
  const { error } = await supabase
    .from("packages")
    .insert({ coach_id: coachId, ...pkg });
  if (error) console.error("createPackage error:", error.message);
}

// Delete a package
export async function deletePackage(id) {
  const { error } = await supabase
    .from("packages")
    .delete()
    .eq("id", id);
  if (error) console.error("deletePackage error:", error.message);
}

// ── WORKOUTS & DIETS ────────────────────────────────────

// Get all plans for a coach
export async function getWorkouts(coachId) {
  const { data, error } = await supabase
    .from("workouts")
    .select("*")
    .eq("coach_id", coachId)
    .order("created_at", { ascending: false });
  if (error) console.error("getWorkouts error:", error.message);
  return data || [];
}

// Create a plan
export async function createWorkout(coachId, workout) {
  const { error } = await supabase
    .from("workouts")
    .insert({ coach_id: coachId, ...workout });
  if (error) console.error("createWorkout error:", error.message);
}

// Delete a plan
export async function deleteWorkout(id) {
  const { error } = await supabase
    .from("workouts")
    .delete()
    .eq("id", id);
  if (error) console.error("deleteWorkout error:", error.message);
}

// ── PROGRESS ───────────────────────────────────────────

// Get progress logs for a client
export async function getProgress(clientId) {
  const { data, error } = await supabase
    .from("progress")
    .select("*")
    .eq("client_id", clientId)
    .order("logged_at", { ascending: true });
  if (error) console.error("getProgress error:", error.message);
  return data || [];
}

// Log new progress entry
export async function logProgress(clientId, entry) {
  const { error } = await supabase
    .from("progress")
    .insert({ client_id: clientId, ...entry });
  if (error) console.error("logProgress error:", error.message);
}

// ── PAYMENTS ────────────────────────────────────────────

// Get all payments for a coach
export async function getPayments(coachId) {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("coach_id", coachId)
    .order("created_at", { ascending: false });
  if (error) console.error("getPayments error:", error.message);
  return data || [];
}

// Submit a payment (client side)
export async function submitPayment(clientId, coachId, payment) {
  const { error } = await supabase
    .from("payments")
    .insert({ client_id: clientId, coach_id: coachId, ...payment });
  if (error) console.error("submitPayment error:", error.message);
}

// Approve or reject a payment (coach side)
export async function updatePaymentStatus(id, status) {
  const { error } = await supabase
    .from("payments")
    .update({ status })
    .eq("id", id);
  if (error) console.error("updatePaymentStatus error:", error.message);
}

// ── FILE UPLOADS ────────────────────────────────────────

// Upload a workout PDF or image
export async function uploadWorkoutFile(coachId, file) {
  const fileExt = file.name.split(".").pop();
  const fileName = `${coachId}/${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from("workouts")
    .upload(fileName, file);

  if (error) {
    console.error("uploadWorkoutFile error:", error.message);
    return null;
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("workouts")
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

// Upload a diet chart PDF or image
export async function uploadDietFile(coachId, file) {
  const fileExt = file.name.split(".").pop();
  const fileName = `${coachId}/${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from("diets")
    .upload(fileName, file);

  if (error) {
    console.error("uploadDietFile error:", error.message);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from("diets")
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

// Save workout record to database
export async function saveWorkout(coachId, workout) {
  const { error } = await supabase
    .from("workouts")
    .insert({ coach_id: coachId, ...workout });
  if (error) console.error("saveWorkout error:", error.message);
}

// Get all workouts for a coach
export async function getCoachWorkouts(coachId) {
  const { data, error } = await supabase
    .from("workouts")
    .select("*")
    .eq("coach_id", coachId)
    .order("created_at", { ascending: false });
  if (error) console.error("getCoachWorkouts error:", error.message);
  return data || [];
}

// Delete a workout
export async function deleteWorkoutById(id) {
  const { error } = await supabase
    .from("workouts")
    .delete()
    .eq("id", id);
  if (error) console.error("deleteWorkout error:", error.message);
}

// Save diet record to database
export async function saveDiet(coachId, diet) {
  const { error } = await supabase
    .from("workouts")
    .insert({ coach_id: coachId, type: "Diet Chart", ...diet });
  if (error) console.error("saveDiet error:", error.message);
}