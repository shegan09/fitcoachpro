import { useState, useEffect, useRef } from "react";
import { useAuth } from "./context/AuthContext";
import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

// Landing page
import LandingPage from "./pages/LandingPage";

// Constants
import { COLORS } from "./constants/colors";

// UI Components
import Badge from "./components/ui/Badge";
import Avatar from "./components/ui/Avatar";
import Button from "./components/ui/Button";
import { Input, Textarea } from "./components/ui/Input";
import Modal from "./components/ui/Modal";
import Stat from "./components/ui/Stat";

// Layout Components
import TopNav from "./components/layout/TopNav";
import SidebarNav from "./components/layout/SidebarNav";

// Services
import { saveProfile } from "./services/profileService";
import { getClients, updateClientStatus } from "./services/clientService";
import { uploadWorkoutFile, saveWorkout, getCoachWorkouts, deleteWorkout } from "./services/workoutService";
import { uploadPaymentProof, submitPayment, getCoachPayments, getClientPayments, updatePaymentStatus, getCoachIdFromSupabase } from "./services/paymentService";
import { getPackages, createPackage, deletePackage } from "./services/packageService";
import { logProgress, getProgress } from "./services/progressService";


const coaches = [
  {
    id: "johnfitness",
    name: "John Carter",
    handle: "johnfitness",
    bio: "Elite fitness coach with 10+ years helping professionals transform their bodies and mindset. Specializing in hypertrophy, fat loss, and sustainable lifestyle change.",
    specialties: ["Hypertrophy", "Fat Loss", "Strength"],
    rating: 4.9,
    reviews: 127,
    clients: 340,
    image: null,
    packages: [
      { id: 1, name: "Starter Plan", price: 99, duration: "1 Month", features: ["Custom workout plan", "Diet chart", "Weekly check-ins", "Progress tracking"], popular: false },
      { id: 2, name: "Transformation", price: 249, duration: "3 Months", features: ["Custom workout plan", "Diet chart", "Bi-weekly calls", "Progress tracking", "24/7 WhatsApp support", "Meal prep guide"], popular: true },
      { id: 3, name: "Elite Coaching", price: 499, duration: "6 Months", features: ["Everything in Transformation", "Daily check-ins", "Custom supplement plan", "1-on-1 video calls", "Priority support", "Body composition analysis"], popular: false },
    ],
    transformations: [
      { before: "180 lbs", after: "155 lbs", duration: "12 weeks", name: "Mike R." },
      { before: "210 lbs", after: "175 lbs", duration: "16 weeks", name: "Sarah K." },
      { before: "165 lbs", after: "185 lbs", duration: "20 weeks", name: "Alex M." },
    ],
    testimonials: [
      { name: "Mike Rodriguez", text: "John completely transformed my approach to fitness. Down 25 lbs in 12 weeks with sustainable habits.", stars: 5 },
      { name: "Sarah Kim", text: "Best investment I've ever made. The personalized diet and workout plan was exactly what I needed.", stars: 5 },
      { name: "Alex Martinez", text: "Gained 20 lbs of muscle in 5 months. John's programming is next level.", stars: 5 },
    ]
  }
];

const mockClients = [
  { id: 1, name: "Mike Rodriguez", email: "mike@email.com", package: "Transformation", status: "active", joinDate: "2024-01-15", weight: 178, goal: "Fat Loss", progress: 68 },
  { id: 2, name: "Sarah Kim", email: "sarah@email.com", package: "Elite Coaching", status: "active", joinDate: "2024-02-01", weight: 142, goal: "Toning", progress: 82 },
  { id: 3, name: "Alex Martinez", email: "alex@email.com", package: "Starter Plan", status: "pending", joinDate: "2024-03-10", weight: 195, goal: "Muscle Gain", progress: 15 },
  { id: 4, name: "Jordan Lee", email: "jordan@email.com", package: "Transformation", status: "active", joinDate: "2024-01-20", weight: 167, goal: "Strength", progress: 55 },
  { id: 5, name: "Chris Park", email: "chris@email.com", package: "Transformation", status: "expired", joinDate: "2023-11-01", weight: 158, goal: "Fat Loss", progress: 100 },
];

const mockPayments = [
  { id: 1, client: "Mike Rodriguez", amount: 249, package: "Transformation", date: "2024-01-15", status: "approved", proof: "bank_transfer_001.jpg" },
  { id: 2, client: "Sarah Kim", amount: 499, package: "Elite Coaching", date: "2024-02-01", status: "approved", proof: "bank_transfer_002.jpg" },
  { id: 3, client: "Alex Martinez", amount: 99, package: "Starter Plan", date: "2024-03-10", status: "pending", proof: "bank_transfer_003.jpg" },
  { id: 4, client: "Jordan Lee", amount: 249, package: "Transformation", date: "2024-01-20", status: "approved", proof: "bank_transfer_004.jpg" },
];

const mockWorkouts = [
  { id: 1, name: "Push Day A - Upper Body", type: "Workout Plan", assignedTo: "All Clients", date: "2024-03-01", format: "PDF" },
  { id: 2, name: "Pull Day B - Back & Biceps", type: "Workout Plan", assignedTo: "Mike Rodriguez", date: "2024-03-05", format: "PDF" },
  { id: 3, name: "Week 1 Meal Plan - 2200 cal", type: "Diet Chart", assignedTo: "All Clients", date: "2024-03-01", format: "Image" },
  { id: 4, name: "Leg Day C - Hypertrophy", type: "Workout Plan", assignedTo: "Sarah Kim", date: "2024-03-08", format: "PDF" },
  { id: 5, name: "Cutting Phase Diet - 1800 cal", type: "Diet Chart", assignedTo: "Mike Rodriguez", date: "2024-03-10", format: "PDF" },
];

const mockProgress = [
  { client: "Mike Rodriguez", date: "Mar 1", weight: 185, chest: 42, waist: 36, hips: 40 },
  { client: "Mike Rodriguez", date: "Mar 8", weight: 183, chest: 42, waist: 35.5, hips: 39.5 },
  { client: "Mike Rodriguez", date: "Mar 15", weight: 181, chest: 41.5, waist: 35, hips: 39 },
  { client: "Mike Rodriguez", date: "Mar 22", weight: 179, chest: 41, waist: 34.5, hips: 38.5 },
  { client: "Mike Rodriguez", date: "Mar 29", weight: 178, chest: 41, waist: 34, hips: 38 },
];



// ─────────────────────────────────────────────────────────────────────────────
// AUTH PAGES
// ─────────────────────────────────────────────────────────────────────────────


const AuthPage = ({ mode, onNavigate, onLogin }) => {
  const [role, setRole] = useState("client");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Get coach info from sessionStorage (set when client clicks Get Started)
  const preselectedCoachId = sessionStorage.getItem("selectedCoachId");
  const preselectedCoachName = sessionStorage.getItem("selectedCoachName");
  const preselectedPackage = sessionStorage.getItem("selectedPackage");

  // If came from coach page, force client role
  useEffect(() => {
    if (preselectedCoachId) {
      setRole("client");
    }
  }, []);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }
    if (mode === "signup" && !name) {
      setError("Please enter your name.");
      setLoading(false);
      return;
    }

    try {
      let userCredential;

      if (mode === "signup") {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });

        // Save profile with coach link if client came from coach page
        await saveProfile(
          userCredential.user.uid,
          name,
          email,
          role,
          role === "client" ? preselectedCoachId : null,
          preselectedPackage || null
        );

        // Clear sessionStorage after use
        sessionStorage.removeItem("selectedCoachId");
        sessionStorage.removeItem("selectedCoachName");
        sessionStorage.removeItem("selectedPackage");
        sessionStorage.removeItem("selectedPackagePrice");

      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }

      const firebaseUser = userCredential.user;
      const user = {
        name: firebaseUser.displayName || email.split("@")[0],
        email: firebaseUser.email,
        uid: firebaseUser.uid,
        role: role,
      };

      onLogin(user);
      onNavigate("dashboard");

    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Try signing in instead.");
      } else if (err.code === "auth/user-not-found") {
        setError("No account found with this email. Try signing up.");
      } else if (err.code === "auth/wrong-password") {
        setError("Wrong password. Please try again.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (err.code === "auth/invalid-credential") {
        setError("Wrong email or password. Please try again.");
      } else {
        setError("Something went wrong. Please try again.");
      }
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: COLORS.bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20
    }}>
      <div style={{
        background: COLORS.surface, border: `1px solid ${COLORS.border}`,
        borderRadius: 20, padding: 40, width: "100%", maxWidth: 440
      }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>⚡</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, margin: "0 0 8px" }}>
            {mode === "login" ? "Welcome back" : "Create account"}
          </h2>
          {preselectedCoachName && mode === "signup" && (
            <div style={{
              background: COLORS.accentBg, border: `1px solid ${COLORS.accent}30`,
              borderRadius: 8, padding: "8px 16px", marginTop: 12,
              fontSize: 13, color: COLORS.accent, fontWeight: 600
            }}>
              🏋️ Joining {preselectedCoachName}'s program
              {preselectedPackage && ` · ${preselectedPackage}`}
            </div>
          )}
        </div>

        {/* Role Toggle — only show if NOT coming from coach page */}
        {!preselectedCoachId && (
          <div style={{
            display: "flex", background: COLORS.surface2,
            borderRadius: 10, padding: 4, marginBottom: 24, gap: 4
          }}>
            {["coach", "client"].map(r => (
              <button key={r} onClick={() => setRole(r)} style={{
                flex: 1, padding: "8px 0", borderRadius: 7, fontSize: 14, fontWeight: 600,
                background: role === r ? COLORS.accentBg2 : "transparent",
                color: role === r ? COLORS.accent : COLORS.textMuted,
                border: role === r ? `1px solid ${COLORS.accent}30` : "1px solid transparent",
                cursor: "pointer", textTransform: "capitalize"
              }}>
                {r === "coach" ? "🏋️ Coach" : "💪 Client"}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div style={{
            background: COLORS.dangerBg, border: `1px solid ${COLORS.danger}40`,
            borderRadius: 8, padding: "10px 14px", marginBottom: 16,
            fontSize: 13, color: COLORS.danger
          }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {mode === "signup" && (
            <Input label="Full Name" placeholder="Your full name"
              value={name} onChange={e => setName(e.target.value)} />
          )}
          <Input label="Email" type="email" placeholder="you@example.com"
            value={email} onChange={e => setEmail(e.target.value)} />
          <Input label="Password" type="password" placeholder="Min. 6 characters"
            value={password} onChange={e => setPassword(e.target.value)} />

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              background: loading ? COLORS.surface3 : COLORS.accent,
              color: loading ? COLORS.textMuted : "#0A0A0B",
              border: "none", borderRadius: 8, padding: "12px 22px",
              fontSize: 15, fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              width: "100%", marginTop: 4
            }}>
            {loading ? "Please wait..." : (mode === "login" ? "Sign In →" : "Create Account →")}
          </button>
        </div>

        <div style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: COLORS.textMuted }}>
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <span style={{ color: COLORS.accent, cursor: "pointer", fontWeight: 600 }}
            onClick={() => onNavigate(mode === "login" ? "signup" : "login")}>
            {mode === "login" ? "Sign up" : "Sign in"}
          </span>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC COACH PAGE
// ─────────────────────────────────────────────────────────────────────────────

const PublicCoachPage = ({ onNavigate, coachHandle }) => {
  const [coach, setCoach] = useState(null);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPkg, setSelectedPkg] = useState(null);

  useEffect(() => {
    loadCoachData();
  }, [coachHandle]);

  const loadCoachData = async () => {
    const { supabase } = await import("./supabase");

    // Load coach profile
    const { data: coachData } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "coach")
      .single();

    if (coachData) {
      setCoach(coachData);

      // Load their packages
      const { data: pkgData } = await supabase
        .from("packages")
        .select("*")
        .eq("coach_id", coachData.id)
        .order("price", { ascending: true });

      setPackages(pkgData || []);
    }
    setLoading(false);
  };

  const handleGetStarted = (pkg) => {
    // Store coach and package info so signup can use it
    sessionStorage.setItem("selectedCoachId", coach?.id);
    sessionStorage.setItem("selectedCoachName", coach?.name);
    sessionStorage.setItem("selectedPackage", pkg.name);
    sessionStorage.setItem("selectedPackagePrice", pkg.price);
    onNavigate("signup");
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", background: COLORS.bg,
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <div style={{ color: COLORS.textMuted }}>Loading coach profile...</div>
      </div>
    );
  }

  if (!coach) {
    return (
      <div style={{
        minHeight: "100vh", background: COLORS.bg,
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <div style={{ color: COLORS.danger }}>Coach not found.</div>
      </div>
    );
  }

  // Use static testimonials and transformations for now
  const testimonials = [
    { name: "Mike Rodriguez", text: "Completely transformed my approach to fitness. Down 25 lbs in 12 weeks!", stars: 5 },
    { name: "Sarah Kim", text: "Best investment I've ever made. The personalized plan was exactly what I needed.", stars: 5 },
    { name: "Alex Martinez", text: "Gained 20 lbs of muscle in 5 months. The programming is next level.", stars: 5 },
  ];

  const transformations = [
    { before: "180 lbs", after: "155 lbs", duration: "12 weeks", name: "Mike R." },
    { before: "210 lbs", after: "175 lbs", duration: "16 weeks", name: "Sarah K." },
    { before: "165 lbs", after: "185 lbs", duration: "20 weeks", name: "Alex M." },
  ];

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", paddingBottom: 80 }}>
      {/* Hero */}
      <div style={{
        background: `linear-gradient(180deg, ${COLORS.accentBg} 0%, transparent 100%)`,
        borderBottom: `1px solid ${COLORS.border}`,
        padding: "60px 40px 48px", textAlign: "center"
      }}>
        <div style={{
          width: 100, height: 100, borderRadius: "50%",
          background: COLORS.accentBg2, border: `3px solid ${COLORS.accent}50`,
          margin: "0 auto 20px", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 44
        }}>💪</div>

        <h1 style={{ fontSize: 36, fontWeight: 900, color: COLORS.text, margin: "0 0 12px", letterSpacing: "-1px" }}>
          {coach.name}
        </h1>

        <div style={{ color: COLORS.accent, fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
          Certified Fitness Coach
        </div>

        <p style={{ color: COLORS.textMuted, maxWidth: 560, margin: "0 auto 24px", fontSize: 16, lineHeight: 1.7 }}>
          {coach.bio || "Elite fitness coach helping clients transform their bodies and mindset through personalized training and nutrition plans."}
        </p>

        <div style={{ display: "flex", gap: 32, justifyContent: "center", flexWrap: "wrap" }}>
          {[["⭐ 4.9", "Rating"], ["127+", "Reviews"], ["340+", "Clients"]].map(([v, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.text }}>{v}</div>
              <div style={{ fontSize: 12, color: COLORS.textMuted }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px" }}>

        {/* Transformations */}
        <section style={{ marginTop: 56 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, letterSpacing: "-0.5px", marginBottom: 24 }}>
            Client Transformations
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {transformations.map((t, i) => (
              <div key={i} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 24 }}>
                <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                  <div style={{ flex: 1, background: COLORS.surface2, borderRadius: 8, padding: "12px 0", textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: COLORS.textDim, fontWeight: 700, textTransform: "uppercase" }}>Before</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.danger, marginTop: 4 }}>{t.before}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", color: COLORS.accent, fontSize: 18 }}>→</div>
                  <div style={{ flex: 1, background: COLORS.surface2, borderRadius: 8, padding: "12px 0", textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: COLORS.textDim, fontWeight: 700, textTransform: "uppercase" }}>After</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.success, marginTop: 4 }}>{t.after}</div>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: COLORS.textMuted }}>{t.name} · {t.duration}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Packages */}
        <section style={{ marginTop: 56 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, letterSpacing: "-0.5px", marginBottom: 24 }}>
            Coaching Packages
          </h2>

          {packages.length === 0 && (
            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 48, textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📦</div>
              <div style={{ color: COLORS.textMuted }}>No packages available yet.</div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {packages.map((pkg, index) => (
              <div key={pkg.id} style={{
                background: COLORS.surface,
                border: `2px solid ${pkg.is_popular ? COLORS.accent : COLORS.border}`,
                borderRadius: 16, padding: 28, position: "relative"
              }}>
                {pkg.is_popular && (
                  <div style={{
                    position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)",
                    background: COLORS.accent, color: "#0A0A0B", fontSize: 11,
                    fontWeight: 800, padding: "4px 16px", borderRadius: 20,
                    letterSpacing: "0.08em", textTransform: "uppercase"
                  }}>Most Popular</div>
                )}
                <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.text, marginBottom: 4 }}>{pkg.name}</div>
                <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 20 }}>{pkg.duration}</div>
                <div style={{ marginBottom: 24 }}>
                  <span style={{ fontSize: 42, fontWeight: 900, color: pkg.is_popular ? COLORS.accent : COLORS.text, letterSpacing: "-2px" }}>
                    ${pkg.price}
                  </span>
                </div>
                {pkg.features && pkg.features.length > 0 && (
                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 10 }}>
                    {pkg.features.map((f, i) => (
                      <li key={i} style={{ display: "flex", gap: 10, fontSize: 14, color: COLORS.textMuted, alignItems: "flex-start" }}>
                        <span style={{ color: COLORS.success, fontSize: 16, lineHeight: 1.3 }}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  onClick={() => handleGetStarted(pkg)}
                  style={{
                    width: "100%", padding: "12px 0",
                    background: pkg.is_popular ? COLORS.accent : "transparent",
                    color: pkg.is_popular ? "#0A0A0B" : COLORS.text,
                    border: pkg.is_popular ? "none" : `1px solid ${COLORS.border}`,
                    borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: "pointer"
                  }}>
                  Get Started →
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section style={{ marginTop: 56 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, letterSpacing: "-0.5px", marginBottom: 24 }}>
            What clients say
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            {testimonials.map((t, i) => (
              <div key={i} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 24 }}>
                <div style={{ color: COLORS.warning, marginBottom: 12, fontSize: 16 }}>{"★".repeat(t.stars)}</div>
                <p style={{ fontSize: 14, color: COLORS.textMuted, lineHeight: 1.7, margin: "0 0 16px" }}>"{t.text}"</p>
                <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>— {t.name}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section style={{
          marginTop: 56,
          background: `linear-gradient(135deg, ${COLORS.surface2} 0%, ${COLORS.surface3} 100%)`,
          border: `1px solid ${COLORS.accent}30`, borderRadius: 20,
          padding: "48px 40px", textAlign: "center"
        }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: COLORS.text, marginBottom: 12 }}>
            Ready to transform your body?
          </h2>
          <p style={{ color: COLORS.textMuted, marginBottom: 28, fontSize: 16 }}>
            Join {coach.name}'s coaching program today
          </p>
          <button
            onClick={() => packages[0] && handleGetStarted(packages[0])}
            style={{
              background: COLORS.accent, color: "#0A0A0B",
              border: "none", borderRadius: 10, padding: "14px 40px",
              fontSize: 16, fontWeight: 800, cursor: "pointer"
            }}>
            Start Your Transformation →
          </button>
        </section>
      </div>
    </div>
  );
};



// ─────────────────────────────────────────────────────────────────────────────
// COACH DASHBOARD TABS
// ─────────────────────────────────────────────────────────────────────────────

const CoachOverview = () => (
  <div>
    <h2 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, marginBottom: 24, letterSpacing: "-0.5px" }}>Overview</h2>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 32 }}>
      <Stat label="Active Clients" value="4" icon="👥" />
      <Stat label="Revenue (Month)" value="$1,096" icon="💰" />
      <Stat label="Pending Approvals" value="1" icon="⏳" />
      <Stat label="Packages" value="3" icon="📦" />
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      {/* Recent Clients */}
      <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, margin: "0 0 16px" }}>Recent Clients</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {mockClients.slice(0, 4).map(c => (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar name={c.name} size={36} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>{c.name}</div>
                <div style={{ fontSize: 12, color: COLORS.textMuted }}>{c.package}</div>
              </div>
              <Badge variant={c.status}>{c.status}</Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Payments */}
      <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, margin: "0 0 16px" }}>Recent Payments</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {mockPayments.slice(0, 4).map(p => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8, background: COLORS.surface2,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18
              }}>💳</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>{p.client}</div>
                <div style={{ fontSize: 12, color: COLORS.textMuted }}>{p.date}</div>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.accent }}>${p.amount}</div>
                <Badge variant={p.status}>{p.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const CoachClients = ({ user }) => {
  const [filter, setFilter] = useState("all");
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Load real clients from Supabase
  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    const data = await getClients(user?.uid);
    setClients(data);
    setLoading(false);
  };

  const handleStatusUpdate = async (clientId, status) => {
    await updateClientStatus(clientId, status);
    await loadClients(); // refresh the list
  };

  const filtered = filter === "all"
    ? clients
    : clients.filter(c => c.status === filter);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, margin: 0, letterSpacing: "-0.5px" }}>
          Clients {!loading && <span style={{ fontSize: 16, color: COLORS.textMuted }}>({clients.length})</span>}
        </h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>+ Add Client</Button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["all", "active", "pending", "expired"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "6px 16px", borderRadius: 20, fontSize: 13, fontWeight: 600,
            background: filter === f ? COLORS.accentBg2 : COLORS.surface2,
            border: filter === f ? `1px solid ${COLORS.accent}30` : `1px solid ${COLORS.border}`,
            color: filter === f ? COLORS.accent : COLORS.textMuted,
            cursor: "pointer", textTransform: "capitalize"
          }}>{f}</button>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{
          background: COLORS.surface, border: `1px solid ${COLORS.border}`,
          borderRadius: 14, padding: 48, textAlign: "center"
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          <div style={{ color: COLORS.textMuted }}>Loading clients...</div>
        </div>
      )}

      {/* Empty state */}
      {!loading && clients.length === 0 && (
        <div style={{
          background: COLORS.surface, border: `2px dashed ${COLORS.border}`,
          borderRadius: 14, padding: 48, textAlign: "center"
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.text, marginBottom: 8 }}>
            No clients yet
          </div>
          <div style={{ color: COLORS.textMuted, marginBottom: 24 }}>
            Clients will appear here when they sign up and select your packages
          </div>
          <Button variant="primary" onClick={() => setShowModal(true)}>+ Add First Client</Button>
        </div>
      )}

      {/* Clients table */}
      {!loading && filtered.length > 0 && (
        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                {["Client", "Email", "Role", "Joined", "Status", "Actions"].map(h => (
                  <th key={h} style={{
                    padding: "12px 16px", fontSize: 11, fontWeight: 700,
                    color: COLORS.textDim, textAlign: "left",
                    letterSpacing: "0.08em", textTransform: "uppercase"
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c.id} style={{
                  borderBottom: i < filtered.length - 1 ? `1px solid ${COLORS.border}` : "none",
                  transition: "background 0.15s"
                }}
                  onMouseEnter={e => e.currentTarget.style.background = COLORS.surface2}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar name={c.name || c.email} size={36} />
                      <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>
                        {c.name || "No name"}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: COLORS.textMuted }}>
                    {c.email}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <Badge>{c.role}</Badge>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: COLORS.textMuted }}>
                    {new Date(c.created_at).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric"
                    })}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <Badge variant={c.status || "pending"}>
                      {c.status || "pending"}
                    </Badge>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      {(!c.status || c.status === "pending") && (
                        <>
                          <Button
                            variant="success" size="sm"
                            onClick={() => handleStatusUpdate(c.id, "active")}
                          >✓ Approve</Button>
                          <Button
                            variant="danger" size="sm"
                            onClick={() => handleStatusUpdate(c.id, "expired")}
                          >✗ Reject</Button>
                        </>
                      )}
                      {c.status === "active" && (
                        <Button
                          variant="danger" size="sm"
                          onClick={() => handleStatusUpdate(c.id, "expired")}
                        >Deactivate</Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add client modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Client">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Input label="Full Name" placeholder="Client full name" />
          <Input label="Email" placeholder="client@email.com" />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.textMuted }}>Package</label>
            <select style={{
              background: COLORS.surface2, border: `1px solid ${COLORS.border}`,
              borderRadius: 8, padding: "10px 14px", color: COLORS.text, fontSize: 14
            }}>
              {coaches[0].packages.map(p => <option key={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <Button variant="primary" style={{ flex: 1, justifyContent: "center" }}
              onClick={() => setShowModal(false)}>Add Client</Button>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const CoachWorkouts = ({ user }) => {
  const [showModal, setShowModal] = useState(false);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [planName, setPlanName] = useState("");
  const [assignTo, setAssignTo] = useState("All Clients");
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => { loadWorkouts(); }, []);

  const loadWorkouts = async () => {
    setLoading(true);
    const data = await getCoachWorkouts(user?.uid);
    setWorkouts(data.filter(w => w.type === "Workout Plan"));
    setLoading(false);
  };

  const handleFileSelect = (file) => {
    if (file) setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!planName) { alert("Please enter a plan name"); return; }
    if (!selectedFile) { alert("Please select a file"); return; }

    setUploading(true);
    const fileUrl = await uploadWorkoutFile(user?.uid, selectedFile);

    if (fileUrl) {
      await saveWorkout(user?.uid, {
        name: planName,
        type: "Workout Plan",
        file_url: fileUrl,
        assigned_to: assignTo,
        format: selectedFile.name.split(".").pop().toUpperCase()
      });
      await loadWorkouts();
      setShowModal(false);
      setPlanName("");
      setSelectedFile(null);
      setAssignTo("All Clients");
    } else {
      alert("Upload failed. Please try again.");
    }
    setUploading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this workout plan?")) {
      await deleteWorkout(id);
      await loadWorkouts();
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, margin: 0, letterSpacing: "-0.5px" }}>
          Workout Plans {!loading && <span style={{ fontSize: 16, color: COLORS.textMuted }}>({workouts.length})</span>}
        </h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>+ Upload Plan</Button>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          <div style={{ color: COLORS.textMuted }}>Loading workout plans...</div>
        </div>
      )}

      {/* Empty state */}
      {!loading && workouts.length === 0 && (
        <div style={{ background: COLORS.surface, border: `2px dashed ${COLORS.border}`, borderRadius: 14, padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏋️</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.text, marginBottom: 8 }}>No workout plans yet</div>
          <div style={{ color: COLORS.textMuted, marginBottom: 24 }}>Upload your first workout plan for your clients</div>
          <Button variant="primary" onClick={() => setShowModal(true)}>+ Upload First Plan</Button>
        </div>
      )}

      {/* Workout cards */}
      {!loading && workouts.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {workouts.map(w => (
            <div key={w.id} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: COLORS.accentBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                  📋
                </div>
                <Badge variant="pdf">{w.format || "FILE"}</Badge>
              </div>
              <h4 style={{ fontSize: 15, fontWeight: 700, color: COLORS.text, margin: "0 0 6px" }}>{w.name}</h4>
              <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 4 }}>
                Assigned to: {w.assigned_to}
              </div>
              <div style={{ fontSize: 12, color: COLORS.textDim, marginBottom: 16 }}>
                {new Date(w.created_at).toLocaleDateString()}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <a href={w.file_url} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                  <Button variant="primary" size="sm">View</Button>
                </a>
                <Button variant="danger" size="sm" onClick={() => handleDelete(w.id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setSelectedFile(null); setPlanName(""); }} title="Upload Workout Plan">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Input label="Plan Name" placeholder="e.g., Push Day A - Upper Body"
            value={planName} onChange={e => setPlanName(e.target.value)} />

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.textMuted }}>Assign To</label>
            <select
              value={assignTo}
              onChange={e => setAssignTo(e.target.value)}
              style={{ background: COLORS.surface2, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "10px 14px", color: COLORS.text, fontSize: 14 }}>
              <option>All Clients</option>
            </select>
          </div>

          {/* Drag and drop zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleFileSelect(e.dataTransfer.files[0]); }}
            style={{
              border: `2px dashed ${dragOver ? COLORS.accent : selectedFile ? COLORS.success : COLORS.border}`,
              borderRadius: 10, padding: 32, textAlign: "center", cursor: "pointer",
              background: dragOver ? COLORS.accentBg : selectedFile ? COLORS.successBg : "transparent",
              transition: "all 0.2s"
            }}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              style={{ display: "none" }}
              onChange={e => handleFileSelect(e.target.files[0])}
            />
            {selectedFile ? (
              <>
                <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.success }}>{selectedFile.name}</div>
                <div style={{ fontSize: 12, color: COLORS.textDim, marginTop: 4 }}>
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB — click to change
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📁</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.textMuted }}>Drop file here or click to upload</div>
                <div style={{ fontSize: 12, color: COLORS.textDim, marginTop: 4 }}>PDF, JPG, PNG up to 20MB</div>
              </>
            )}
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={handleUpload}
              disabled={uploading}
              style={{
                flex: 1, background: uploading ? COLORS.surface3 : COLORS.accent,
                color: uploading ? COLORS.textMuted : "#0A0A0B",
                border: "none", borderRadius: 8, padding: "11px 0",
                fontSize: 14, fontWeight: 700, cursor: uploading ? "not-allowed" : "pointer"
              }}>
              {uploading ? "Uploading..." : "Upload Plan"}
            </button>
            <Button variant="secondary" onClick={() => { setShowModal(false); setSelectedFile(null); setPlanName(""); }}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const CoachDiets = () => {
  const [showModal, setShowModal] = useState(false);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, margin: 0, letterSpacing: "-0.5px" }}>Diet Charts</h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>+ Upload Diet Chart</Button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {mockWorkouts.filter(w => w.type === "Diet Chart").map(w => (
          <div key={w.id} style={{
            background: COLORS.surface, border: `1px solid ${COLORS.border}`,
            borderRadius: 14, padding: 20
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10, background: COLORS.successBg,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22
              }}>🥗</div>
              <Badge variant={w.format.toLowerCase()}>{w.format}</Badge>
            </div>
            <h4 style={{ fontSize: 15, fontWeight: 700, color: COLORS.text, margin: "0 0 6px" }}>{w.name}</h4>
            <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 16 }}>Assigned to: {w.assignedTo}</div>
            <div style={{ display: "flex", gap: 8 }}>
              <Button variant="secondary" size="sm">View</Button>
              <Button variant="ghost" size="sm">Edit</Button>
              <Button variant="danger" size="sm">Delete</Button>
            </div>
          </div>
        ))}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Upload Diet Chart">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Input label="Diet Plan Name" placeholder="e.g., Week 1 Meal Plan - 2200 cal" />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.textMuted }}>Assign To</label>
            <select style={{
              background: COLORS.surface2, border: `1px solid ${COLORS.border}`,
              borderRadius: 8, padding: "10px 14px", color: COLORS.text, fontSize: 14
            }}>
              <option>All Clients</option>
              {mockClients.map(c => <option key={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div style={{
            border: `2px dashed ${COLORS.border}`, borderRadius: 10, padding: 32,
            textAlign: "center", cursor: "pointer"
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📁</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.textMuted }}>Upload PDF or Image</div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <Button variant="primary" style={{ flex: 1, justifyContent: "center" }} onClick={() => setShowModal(false)}>Upload</Button>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const CoachPayments = ({ user }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingProof, setViewingProof] = useState(null);

  useEffect(() => { loadPayments(); }, []);

  const loadPayments = async () => {
    setLoading(true);
    const data = await getCoachPayments(user?.uid);
    setPayments(data);
    setLoading(false);
  };

  const handleStatus = async (id, status) => {
    await updatePaymentStatus(id, status);
    await loadPayments();
  };

  const totalRevenue = payments
    .filter(p => p.status === "approved")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const pendingAmount = payments
    .filter(p => p.status === "pending")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, margin: 0, letterSpacing: "-0.5px" }}>
          Payments
        </h2>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 24 }}>
        <Stat label="Total Revenue" value={`$${totalRevenue}`} icon="💰" />
        <Stat label="Pending" value={`$${pendingAmount}`} icon="⏳" />
        <Stat label="Total Payments" value={payments.length} icon="💳" />
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          <div style={{ color: COLORS.textMuted }}>Loading payments...</div>
        </div>
      )}

      {/* Empty state */}
      {!loading && payments.length === 0 && (
        <div style={{ background: COLORS.surface, border: `2px dashed ${COLORS.border}`, borderRadius: 14, padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>💳</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.text, marginBottom: 8 }}>No payments yet</div>
          <div style={{ color: COLORS.textMuted }}>Payments will appear here when clients submit proof</div>
        </div>
      )}

      {/* Payments table */}
      {!loading && payments.length > 0 && (
        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                {["Client ID", "Package", "Amount", "Date", "Proof", "Status", "Actions"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: COLORS.textDim, textAlign: "left", letterSpacing: "0.08em", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map((p, i) => (
                <tr key={p.id} style={{
                  borderBottom: i < payments.length - 1 ? `1px solid ${COLORS.border}` : "none",
                  transition: "background 0.15s"
                }}
                  onMouseEnter={e => e.currentTarget.style.background = COLORS.surface2}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ fontSize: 13, color: COLORS.textMuted }}>
                      {p.client_id?.slice(0, 8)}...
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: COLORS.textMuted }}>
                    {p.package_name || "—"}
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 15, fontWeight: 700, color: COLORS.accent }}>
                    ${p.amount}
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: COLORS.textMuted }}>
                    {new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    {p.proof_url ? (
                      <button
                        onClick={() => setViewingProof(p.proof_url)}
                        style={{ background: COLORS.infoBg, color: COLORS.info, border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
                        👁 View
                      </button>
                    ) : (
                      <span style={{ fontSize: 12, color: COLORS.textDim }}>No proof</span>
                    )}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <Badge variant={p.status}>{p.status}</Badge>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    {p.status === "pending" && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <Button variant="success" size="sm" onClick={() => handleStatus(p.id, "approved")}>✓ Approve</Button>
                        <Button variant="danger" size="sm" onClick={() => handleStatus(p.id, "rejected")}>✗ Reject</Button>
                      </div>
                    )}
                    {p.status === "approved" && <span style={{ fontSize: 12, color: COLORS.success, fontWeight: 600 }}>✓ Approved</span>}
                    {p.status === "rejected" && <span style={{ fontSize: 12, color: COLORS.danger, fontWeight: 600 }}>✗ Rejected</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Proof viewer modal */}
      <Modal isOpen={!!viewingProof} onClose={() => setViewingProof(null)} title="Payment Proof">
        {viewingProof && (
          <div style={{ textAlign: "center" }}>
            <img
              src={viewingProof}
              alt="Payment proof"
              style={{ width: "100%", borderRadius: 8, marginBottom: 16 }}
              onError={e => e.target.style.display = "none"}
            />
            <a href={viewingProof} target="_blank" rel="noreferrer">
              <Button variant="primary">Open Full Size</Button>
            </a>
          </div>
        )}
      </Modal>
    </div>
  );
};
const ClientPayment = ({ user }) => {
  const [coachId, setCoachId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState("Transformation");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [payments, setPayments] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);
  const coach = coaches[0];

  useEffect(() => {
    loadCoachId();
    loadMyPayments();
  }, []);

const loadCoachId = async () => {
  const { supabase } = await import("./supabase");

  // Get THIS client's assigned coach from their profile
  const { data } = await supabase
    .from("profiles")
    .select("coach_id, selected_package")
    .eq("id", user?.uid)
    .single();

  if (data?.coach_id) {
    console.log("✅ My assigned coach:", data.coach_id);
    setCoachId(data.coach_id);
    // Auto-select their package if available
    if (data.selected_package) {
      setSelectedPkg(data.selected_package);
    }
  } else {
    console.warn("⚠️ No coach assigned to this client");
  }
};

  const loadMyPayments = async () => {
    if (!user?.uid) return;
    const data = await getClientPayments(user.uid);
    setPayments(data);
  };

const handleSubmit = async () => {
  if (!amount) {
    alert("Please enter the amount you transferred");
    return;
  }
  if (!selectedFile) {
    alert("Please upload your payment screenshot");
    return;
  }
  if (!coachId) {
    alert("Could not find coach. Please try again.");
    return;
  }

  setUploading(true);
  console.log("Submitting payment:", { clientId: user?.uid, coachId, amount });

  try {
    const proofUrl = await uploadPaymentProof(user?.uid, selectedFile);

    if (proofUrl) {
      await submitPayment(user?.uid, coachId, {
        package_name: selectedPkg,
        amount: Number(amount),
        proof_url: proofUrl,
        status: "pending"
      });

      await loadMyPayments();
      setShowModal(false);
      setSelectedFile(null);
      setAmount("");
      setReference("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
      console.log("✅ Payment submitted successfully!");
    } else {
      alert("Upload failed. Please try again.");
    }
  } catch (err) {
    console.error("❌ Payment submission error:", err.message);
    alert("Payment failed: " + err.message);
  }

  setUploading(false);
};

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, marginBottom: 24, letterSpacing: "-0.5px" }}>
        Make Payment
      </h2>

      {/* Success banner */}
      {success && (
        <div style={{
          background: COLORS.successBg, border: `1px solid ${COLORS.success}40`,
          borderRadius: 12, padding: 16, marginBottom: 20,
          fontSize: 14, color: COLORS.success, fontWeight: 600
        }}>
          ✅ Payment submitted! Your coach will approve it shortly.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Packages */}
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 16 }}>
            Choose Package
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {coach.packages.map(pkg => (
              <div key={pkg.id}
                onClick={() => { setSelectedPkg(pkg.name); setAmount(pkg.price.toString()); }}
                style={{
                  background: COLORS.surface,
                  border: `2px solid ${selectedPkg === pkg.name ? COLORS.accent : COLORS.border}`,
                  borderRadius: 12, padding: 18, cursor: "pointer", transition: "all 0.15s"
                }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.text }}>{pkg.name}</div>
                    <div style={{ fontSize: 13, color: COLORS.textMuted }}>{pkg.duration}</div>
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: selectedPkg === pkg.name ? COLORS.accent : COLORS.text }}>
                    ${pkg.price}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bank Details */}
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 16 }}>
            Bank Transfer Details
          </h3>
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 24, marginBottom: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                ["Bank", "Chase Bank"],
                ["Account Name", "John Carter"],
                ["Account No.", "••••••7891"],
                ["Routing No.", "••••••1234"],
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                  <span style={{ fontSize: 13, color: COLORS.textMuted }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: COLORS.warningBg, border: `1px solid ${COLORS.warning}30`, borderRadius: 10, padding: 14, marginBottom: 20, fontSize: 13, color: COLORS.warning }}>
            ⚠️ Transfer the exact amount and upload your payment screenshot below.
          </div>

          <Button variant="primary" size="lg"
            style={{ width: "100%", justifyContent: "center" }}
            onClick={() => setShowModal(true)}>
            📸 Upload Payment Proof
          </Button>
        </div>
      </div>

      {/* My payment history */}
      {payments.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 16 }}>
            My Payment History
          </h3>
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                  {["Package", "Amount", "Date", "Status"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: COLORS.textDim, textAlign: "left", letterSpacing: "0.08em", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map((p, i) => (
                  <tr key={p.id} style={{ borderBottom: i < payments.length - 1 ? `1px solid ${COLORS.border}` : "none" }}>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: COLORS.textMuted }}>{p.package_name}</td>
                    <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 700, color: COLORS.accent }}>${p.amount}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: COLORS.textMuted }}>
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Badge variant={p.status}>{p.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setSelectedFile(null); }} title="Upload Payment Proof">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: COLORS.accentBg, border: `1px solid ${COLORS.accent}30`, borderRadius: 8, padding: 12, fontSize: 13, color: COLORS.accent }}>
            📦 Selected: <strong>{selectedPkg}</strong>
          </div>

          <Input label="Amount Transferred ($)" type="number"
            placeholder="249" value={amount}
            onChange={e => setAmount(e.target.value)} />

          <Input label="Transaction Reference (optional)"
            placeholder="REF123456" value={reference}
            onChange={e => setReference(e.target.value)} />

          {/* Drag and drop */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); setSelectedFile(e.dataTransfer.files[0]); }}
            style={{
              border: `2px dashed ${dragOver ? COLORS.accent : selectedFile ? COLORS.success : COLORS.border}`,
              borderRadius: 10, padding: 32, textAlign: "center", cursor: "pointer",
              background: dragOver ? COLORS.accentBg : selectedFile ? COLORS.successBg : "transparent",
              transition: "all 0.2s"
            }}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              style={{ display: "none" }}
              onChange={e => setSelectedFile(e.target.files[0])}
            />
            {selectedFile ? (
              <>
                <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.success }}>{selectedFile.name}</div>
                <div style={{ fontSize: 12, color: COLORS.textDim, marginTop: 4 }}>Click to change</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📸</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.textMuted }}>Upload payment screenshot</div>
                <div style={{ fontSize: 12, color: COLORS.textDim, marginTop: 4 }}>JPG, PNG, PDF</div>
              </>
            )}
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={handleSubmit}
              disabled={uploading}
              style={{
                flex: 1, background: uploading ? COLORS.surface3 : COLORS.accent,
                color: uploading ? COLORS.textMuted : "#0A0A0B",
                border: "none", borderRadius: 8, padding: "11px 0",
                fontSize: 14, fontWeight: 700, cursor: uploading ? "not-allowed" : "pointer"
              }}>
              {uploading ? "Submitting..." : "Submit for Approval"}
            </button>
            <Button variant="secondary" onClick={() => { setShowModal(false); setSelectedFile(null); }}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const CoachPackages = ({ user }) => {
  const [showModal, setShowModal] = useState(false);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pkgName, setPkgName] = useState("");
  const [pkgPrice, setPkgPrice] = useState("");
  const [pkgDuration, setPkgDuration] = useState("");
  const [pkgFeatures, setPkgFeatures] = useState("");

  useEffect(() => { loadPackages(); }, []);

  const loadPackages = async () => {
    setLoading(true);
    const data = await getPackages(user?.uid);
    setPackages(data);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!pkgName || !pkgPrice || !pkgDuration) {
      alert("Please fill in all fields");
      return;
    }
    const featuresArray = pkgFeatures
      .split("\n")
      .map(f => f.trim())
      .filter(f => f.length > 0);
    await createPackage(user?.uid, {
      name: pkgName,
      price: Number(pkgPrice),
      duration: pkgDuration,
      features: featuresArray,
      is_popular: false
    });
    await loadPackages();
    setShowModal(false);
    setPkgName("");
    setPkgPrice("");
    setPkgDuration("");
    setPkgFeatures("");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this package?")) {
      await deletePackage(id);
      await loadPackages();
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, margin: 0, letterSpacing: "-0.5px" }}>
          Coaching Packages
          {!loading && <span style={{ fontSize: 16, color: COLORS.textMuted, marginLeft: 8 }}>({packages.length})</span>}
        </h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>+ Create Package</Button>
      </div>

      {loading && (
        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          <div style={{ color: COLORS.textMuted }}>Loading packages...</div>
        </div>
      )}

      {!loading && packages.length === 0 && (
        <div style={{ background: COLORS.surface, border: `2px dashed ${COLORS.border}`, borderRadius: 14, padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.text, marginBottom: 8 }}>No packages yet</div>
          <div style={{ color: COLORS.textMuted, marginBottom: 24 }}>Create your first coaching package</div>
          <Button variant="primary" onClick={() => setShowModal(true)}>+ Create First Package</Button>
        </div>
      )}

      {!loading && packages.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
          {packages.map(pkg => (
            <div key={pkg.id} style={{
              background: COLORS.surface,
              border: `2px solid ${pkg.is_popular ? COLORS.accent + "50" : COLORS.border}`,
              borderRadius: 16, padding: 24
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: COLORS.text }}>{pkg.name}</div>
                  <div style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 4 }}>{pkg.duration}</div>
                </div>
                {pkg.is_popular && <Badge variant="popular">Popular</Badge>}
              </div>
              <div style={{ fontSize: 36, fontWeight: 900, color: COLORS.accent, letterSpacing: "-1px", marginBottom: 16 }}>
                ${pkg.price}
              </div>
              {pkg.features && pkg.features.length > 0 && (
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px", display: "flex", flexDirection: "column", gap: 8 }}>
                  {pkg.features.map((f, i) => (
                    <li key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: COLORS.textMuted, alignItems: "flex-start" }}>
                      <span style={{ color: COLORS.success, flexShrink: 0 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
              )}
              <Button variant="danger" size="sm" onClick={() => handleDelete(pkg.id)}>Delete</Button>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Package">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Input label="Package Name" placeholder="e.g., Elite Coaching"
            value={pkgName} onChange={e => setPkgName(e.target.value)} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input label="Price ($)" type="number" placeholder="199"
              value={pkgPrice} onChange={e => setPkgPrice(e.target.value)} />
            <Input label="Duration" placeholder="e.g., 3 Months"
              value={pkgDuration} onChange={e => setPkgDuration(e.target.value)} />
          </div>
          <Textarea
            label="Features (one per line)"
            placeholder={"Custom workout plan\nDiet chart\nWeekly check-ins"}
            value={pkgFeatures}
            onChange={e => setPkgFeatures(e.target.value)}
          />
          <div style={{ background: COLORS.surface2, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: 12, fontSize: 13, color: COLORS.textMuted }}>
            💡 Each line becomes a feature bullet point
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <Button variant="primary" style={{ flex: 1, justifyContent: "center" }} onClick={handleCreate}>
              Create Package
            </Button>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const CoachProfile = ({ user }) => {
  const [bio, setBio] = useState(coaches[0].bio);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, margin: 0, letterSpacing: "-0.5px" }}>Coach Profile</h2>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 13, color: COLORS.accent }}>fitcoachpro.com/coach/johnfitness</span>
          {saved && <Badge variant="active">Saved!</Badge>}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24 }}>
        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 24, textAlign: "center" }}>
          <div style={{
            width: 100, height: 100, borderRadius: "50%",
            background: COLORS.accentBg2, border: `3px solid ${COLORS.accent}50`,
            margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40
          }}>💪</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 4 }}>{user?.name}</div>
          <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 20 }}>Fitness Coach</div>
          <div style={{
            border: `2px dashed ${COLORS.border}`, borderRadius: 8, padding: 16,
            cursor: "pointer", color: COLORS.textMuted, fontSize: 13
          }}>
            📷 Change Photo
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, margin: "0 0 16px" }}>Profile Info</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Input label="Display Name" defaultValue={user?.name} />
              <Input label="Coach Handle" defaultValue="johnfitness" />
              <Input label="Specialization" defaultValue="Hypertrophy, Fat Loss, Strength" />
              <Textarea label="Bio" value={bio} onChange={e => setBio(e.target.value)} />
            </div>
          </div>

          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, margin: "0 0 16px" }}>Bank Details (for payments)</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Input label="Bank Name" placeholder="e.g., Chase Bank" />
              <Input label="Account Name" placeholder="John Carter" />
              <Input label="Account Number" placeholder="••••••••••" />
              <Input label="Routing Number" placeholder="••••••••••" />
            </div>
          </div>

          <Button variant="primary" size="lg" onClick={handleSave}>Save Profile</Button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CLIENT DASHBOARD TABS
// ─────────────────────────────────────────────────────────────────────────────

const ClientOverview = () => (
  <div>
    <h2 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, marginBottom: 24, letterSpacing: "-0.5px" }}>My Dashboard</h2>

    {/* Subscription Banner */}
    <div style={{
      background: `linear-gradient(135deg, ${COLORS.accentBg2}, ${COLORS.surface2})`,
      border: `1px solid ${COLORS.accent}30`, borderRadius: 14, padding: 24, marginBottom: 24,
      display: "flex", justifyContent: "space-between", alignItems: "center"
    }}>
      <div>
        <div style={{ fontSize: 12, color: COLORS.accent, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Active Subscription</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.text }}>Transformation Plan</div>
        <div style={{ fontSize: 14, color: COLORS.textMuted, marginTop: 4 }}>3 Months · Expires June 15, 2024</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 32, fontWeight: 900, color: COLORS.accent }}>68%</div>
        <div style={{ fontSize: 12, color: COLORS.textMuted }}>Progress</div>
        <div style={{ width: 120, height: 4, background: COLORS.surface3, borderRadius: 2, marginTop: 8 }}>
          <div style={{ width: "68%", height: "100%", background: COLORS.accent, borderRadius: 2 }} />
        </div>
      </div>
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16, marginBottom: 24 }}>
      <Stat label="Current Weight" value="178 lbs" />
      <Stat label="Goal" value="Fat Loss" />
      <Stat label="Workouts" value="4" />
      <Stat label="Days Active" value="48" />
    </div>

    <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 24 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, margin: "0 0 16px" }}>Your Coach</h3>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{
          width: 60, height: 60, borderRadius: "50%",
          background: COLORS.accentBg2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28
        }}>💪</div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.text }}>John Carter</div>
          <div style={{ fontSize: 14, color: COLORS.textMuted }}>Elite Fitness Coach · ⭐ 4.9</div>
        </div>
        <Button variant="primary" size="sm" style={{ marginLeft: "auto" }}>Message Coach</Button>
      </div>
    </div>
  </div>
);

const ClientWorkouts = () => (
  <div>
    <h2 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, marginBottom: 24, letterSpacing: "-0.5px" }}>My Workout Plans</h2>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
      {mockWorkouts.filter(w => w.type === "Workout Plan").map(w => (
        <div key={w.id} style={{
          background: COLORS.surface, border: `1px solid ${COLORS.border}`,
          borderRadius: 14, padding: 20
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10, background: COLORS.accentBg,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22
            }}>📋</div>
            <Badge variant={w.format.toLowerCase()}>{w.format}</Badge>
          </div>
          <h4 style={{ fontSize: 15, fontWeight: 700, color: COLORS.text, margin: "0 0 6px" }}>{w.name}</h4>
          <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 16 }}>Added {w.date}</div>
          <Button variant="primary" size="sm">View Plan</Button>
        </div>
      ))}
    </div>
  </div>
);

const ClientDiets = () => (
  <div>
    <h2 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, marginBottom: 24, letterSpacing: "-0.5px" }}>My Diet Plan</h2>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
      {mockWorkouts.filter(w => w.type === "Diet Chart").map(w => (
        <div key={w.id} style={{
          background: COLORS.surface, border: `1px solid ${COLORS.border}`,
          borderRadius: 14, padding: 20
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10, background: COLORS.successBg,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22
            }}>🥗</div>
            <Badge variant={w.format.toLowerCase()}>{w.format}</Badge>
          </div>
          <h4 style={{ fontSize: 15, fontWeight: 700, color: COLORS.text, margin: "0 0 6px" }}>{w.name}</h4>
          <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 16 }}>Added {w.date}</div>
          <Button variant="primary" size="sm">View Chart</Button>
        </div>
      ))}
    </div>
  </div>
);

const ClientProgress = () => {
  const [showModal, setShowModal] = useState(false);
  const [weight, setWeight] = useState("");
  const [chest, setChest] = useState("");
  const [waist, setWaist] = useState("");

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, margin: 0, letterSpacing: "-0.5px" }}>My Progress</h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>+ Log Progress</Button>
      </div>

      {/* Weight Chart (simplified visual) */}
      <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 24, marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, margin: "0 0 20px" }}>Weight Trend</h3>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120 }}>
          {mockProgress.map((d, i) => {
            const min = 176, max = 186;
            const height = ((d.weight - min) / (max - min)) * 100;
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 11, color: COLORS.textMuted }}>{d.weight}</span>
                <div style={{
                  width: "100%", height: `${height}%`, minHeight: 20,
                  background: i === mockProgress.length - 1 ? COLORS.accent : COLORS.surface3,
                  borderRadius: "4px 4px 0 0", transition: "all 0.3s"
                }} />
                <span style={{ fontSize: 10, color: COLORS.textDim }}>{d.date}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress Table */}
      <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
              {["Date", "Weight", "Chest", "Waist", "Hips"].map(h => (
                <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: COLORS.textDim, textAlign: "left", letterSpacing: "0.08em", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockProgress.map((d, i) => (
              <tr key={i} style={{ borderBottom: i < mockProgress.length - 1 ? `1px solid ${COLORS.border}` : "none" }}>
                <td style={{ padding: "12px 16px", fontSize: 13, color: COLORS.textMuted }}>{d.date}</td>
                <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: COLORS.text }}>{d.weight} lbs</td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: COLORS.textMuted }}>{d.chest}"</td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: COLORS.textMuted }}>{d.waist}"</td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: COLORS.textMuted }}>{d.hips}"</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Log Progress">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Input label="Weight (lbs)" type="number" placeholder="178" value={weight} onChange={e => setWeight(e.target.value)} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <Input label="Chest (in)" type="number" placeholder="41" value={chest} onChange={e => setChest(e.target.value)} />
            <Input label="Waist (in)" type="number" placeholder="34" value={waist} onChange={e => setWaist(e.target.value)} />
            <Input label="Hips (in)" type="number" placeholder="38" />
          </div>
          <div style={{
            border: `2px dashed ${COLORS.border}`, borderRadius: 10, padding: 28,
            textAlign: "center", cursor: "pointer"
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>📸</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.textMuted }}>Upload Progress Photos</div>
            <div style={{ fontSize: 12, color: COLORS.textDim, marginTop: 4 }}>Front, side, back view</div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <Button variant="primary" style={{ flex: 1, justifyContent: "center" }} onClick={() => setShowModal(false)}>Log Progress</Button>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const ClientSubscription = () => (
  <div>
    <h2 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, marginBottom: 24, letterSpacing: "-0.5px" }}>My Subscription</h2>

    <div style={{
      background: `linear-gradient(135deg, ${COLORS.surface2} 0%, ${COLORS.surface3} 100%)`,
      border: `2px solid ${COLORS.accent}30`, borderRadius: 16, padding: 32, marginBottom: 24
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <Badge variant="active">Active</Badge>
          <h3 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, margin: "12px 0 8px" }}>Transformation Plan</h3>
          <div style={{ fontSize: 16, color: COLORS.textMuted }}>3 Months · $249</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 13, color: COLORS.textMuted }}>Expires</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.text }}>June 15, 2024</div>
        </div>
      </div>
      <div style={{ marginTop: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: COLORS.textMuted }}>Progress</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.accent }}>68%</span>
        </div>
        <div style={{ width: "100%", height: 6, background: COLORS.surface, borderRadius: 3 }}>
          <div style={{ width: "68%", height: "100%", background: COLORS.accent, borderRadius: 3 }} />
        </div>
      </div>
    </div>

    <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 24 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, margin: "0 0 16px" }}>Plan Features</h3>
      {["Custom workout plan", "Diet chart", "Bi-weekly calls", "Progress tracking", "24/7 WhatsApp support", "Meal prep guide"].map(f => (
        <div key={f} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: `1px solid ${COLORS.border}`, fontSize: 14, color: COLORS.textMuted }}>
          <span style={{ color: COLORS.success }}>✓</span> {f}
        </div>
      ))}
      <Button variant="primary" style={{ marginTop: 20, width: "100%", justifyContent: "center" }}>Upgrade Plan</Button>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────

const Dashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState("overview");

  const renderContent = () => {
    if (user?.role === "coach") {
      switch (activeTab) {
        case "overview": return <CoachOverview />;
        case "clients": return <CoachClients user={user} />;
        case "workouts": return <CoachWorkouts  user={user} />;
        case "diets": return <CoachDiets />;
        case "payments": return <CoachPayments user={user}/>;
        case "packages": return <CoachPackages user={user}/>;
        case "profile": return <CoachProfile user={user} />;
        default: return <CoachOverview />;
      }
    } else {
      switch (activeTab) {
        case "overview": return <ClientOverview />;
        case "workouts": return <ClientWorkouts />;
        case "diets": return <ClientDiets />;
        case "progress": return <ClientProgress />;
        case "subscription": return <ClientSubscription />;
        case "payment": return <ClientPayment user={user} />;
        default: return <ClientOverview />;
      }
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 64px)", background: COLORS.bg }}>
      <SidebarNav user={user} activeTab={activeTab} setActiveTab={setActiveTab} />
      <main style={{ flex: 1, padding: "32px 36px", overflowY: "auto", minWidth: 0 }}>
        {renderContent()}
      </main>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  const { user, setUser, logout, loading } = useAuth();
  const [page, setPage] = useState("landing");

  const navigate = (p) => setPage(p);

  // When user logs in redirect to dashboard
  useEffect(() => {
    if (user && page === "landing") {
      setPage("dashboard");
    }
  }, [user]);

  // Show loading screen while checking auth
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", background: "#0A0A0B",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: 16
      }}>
        <div style={{
          width: 40, height: 40, background: "#E8FF47", borderRadius: 10,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22
        }}>⚡</div>
        <div style={{ color: "#8A8A9A", fontSize: 14 }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", background: "#0A0A0B", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,800;0,9..40,900;1,9..40,400&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: #0A0A0B; }
        input, select, textarea, button { font-family: inherit; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #111113; }
        ::-webkit-scrollbar-thumb { background: #2A2A32; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #3A3A45; }
      `}</style>

      {page !== "dashboard" && (
        <TopNav user={user} onNavigate={navigate} currentPage={page} onLogout={logout} />
      )}

      {page === "landing" && <LandingPage onNavigate={navigate} />}
      {page === "login" && <AuthPage mode="login" onNavigate={navigate} onLogin={setUser} />}
      {page === "signup" && <AuthPage mode="signup" onNavigate={navigate} onLogin={setUser} />}
      {page === "public-coach" && <PublicCoachPage onNavigate={navigate} />}
      {page === "dashboard" && user && (
        <div>
          <TopNav user={user} onNavigate={navigate} currentPage={page} onLogout={logout} />
          <Dashboard user={user} />
        </div>
      )}
      {page === "dashboard" && !user && (
        <AuthPage mode="login" onNavigate={navigate} onLogin={setUser} />
      )}
    </div>
  );
}