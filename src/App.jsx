import { useState, useEffect, useRef } from "react";
import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from "firebase/auth";

const COLORS = {
  bg: "#0A0A0B",
  surface: "#111113",
  surface2: "#18181C",
  surface3: "#1E1E24",
  border: "#2A2A32",
  borderHover: "#3A3A45",
  accent: "#E8FF47",
  accentDim: "#C8DF30",
  accentBg: "rgba(232,255,71,0.08)",
  accentBg2: "rgba(232,255,71,0.15)",
  text: "#F5F5F7",
  textMuted: "#8A8A9A",
  textDim: "#5A5A6A",
  success: "#22C55E",
  successBg: "rgba(34,197,94,0.1)",
  danger: "#EF4444",
  dangerBg: "rgba(239,68,68,0.1)",
  warning: "#F59E0B",
  warningBg: "rgba(245,158,11,0.1)",
  info: "#3B82F6",
  infoBg: "rgba(59,130,246,0.1)",
  purple: "#A78BFA",
  purpleBg: "rgba(167,139,250,0.1)",
};

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
// UTILITY COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

const Badge = ({ children, variant = "default" }) => {
  const variants = {
    default: { bg: COLORS.surface3, color: COLORS.textMuted },
    active: { bg: COLORS.successBg, color: COLORS.success },
    pending: { bg: COLORS.warningBg, color: COLORS.warning },
    expired: { bg: COLORS.dangerBg, color: COLORS.danger },
    approved: { bg: COLORS.successBg, color: COLORS.success },
    popular: { bg: COLORS.accentBg2, color: COLORS.accent },
    pdf: { bg: COLORS.infoBg, color: COLORS.info },
    image: { bg: COLORS.purpleBg, color: COLORS.purple },
  };
  const style = variants[variant] || variants.default;
  return (
    <span style={{
      background: style.bg, color: style.color,
      padding: "3px 10px", borderRadius: 20, fontSize: 11,
      fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase"
    }}>{children}</span>
  );
};

const Stat = ({ label, value, icon, color = COLORS.accent }) => (
  <div style={{
    background: COLORS.surface2, border: `1px solid ${COLORS.border}`,
    borderRadius: 12, padding: "20px 24px", flex: 1, minWidth: 0
  }}>
    <div style={{ color: COLORS.textMuted, fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontSize: 32, fontWeight: 700, color: COLORS.text, letterSpacing: "-1px" }}>{value}</span>
      {icon && <span style={{ fontSize: 20 }}>{icon}</span>}
    </div>
  </div>
);

const Avatar = ({ name, size = 40 }) => {
  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const colors = ["#E8FF47","#A78BFA","#22C55E","#3B82F6","#F59E0B","#EF4444"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `${color}20`, border: `2px solid ${color}40`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.35, fontWeight: 700, color, flexShrink: 0
    }}>{initials}</div>
  );
};

const Input = ({ label, ...props }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    {label && <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.textMuted, letterSpacing: "0.04em" }}>{label}</label>}
    <input {...props} style={{
      background: COLORS.surface2, border: `1px solid ${COLORS.border}`,
      borderRadius: 8, padding: "10px 14px", color: COLORS.text,
      fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box",
      transition: "border-color 0.2s", ...props.style
    }}
      onFocus={e => e.target.style.borderColor = COLORS.accent}
      onBlur={e => e.target.style.borderColor = COLORS.border}
    />
  </div>
);

const Textarea = ({ label, ...props }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    {label && <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.textMuted, letterSpacing: "0.04em" }}>{label}</label>}
    <textarea {...props} style={{
      background: COLORS.surface2, border: `1px solid ${COLORS.border}`,
      borderRadius: 8, padding: "10px 14px", color: COLORS.text,
      fontSize: 14, outline: "none", width: "100%", resize: "vertical",
      minHeight: 100, boxSizing: "border-box", fontFamily: "inherit", ...props.style
    }}
      onFocus={e => e.target.style.borderColor = COLORS.accent}
      onBlur={e => e.target.style.borderColor = COLORS.border}
    />
  </div>
);

const Button = ({ children, variant = "primary", size = "md", onClick, style: extraStyle = {} }) => {
  const sizes = { sm: { padding: "7px 16px", fontSize: 13 }, md: { padding: "10px 22px", fontSize: 14 }, lg: { padding: "14px 32px", fontSize: 15 } };
  const variants = {
    primary: { background: COLORS.accent, color: "#0A0A0B", border: "none" },
    secondary: { background: "transparent", color: COLORS.text, border: `1px solid ${COLORS.border}` },
    danger: { background: COLORS.dangerBg, color: COLORS.danger, border: `1px solid ${COLORS.danger}40` },
    ghost: { background: "transparent", color: COLORS.textMuted, border: "none" },
    success: { background: COLORS.successBg, color: COLORS.success, border: `1px solid ${COLORS.success}40` },
  };
  return (
    <button onClick={onClick} style={{
      ...sizes[size], ...variants[variant], borderRadius: 8,
      fontWeight: 700, cursor: "pointer", display: "inline-flex",
      alignItems: "center", gap: 8, letterSpacing: "0.02em",
      transition: "all 0.15s", whiteSpace: "nowrap", ...extraStyle
    }}
      onMouseEnter={e => { if (variant === "primary") e.target.style.background = COLORS.accentDim; }}
      onMouseLeave={e => { if (variant === "primary") e.target.style.background = COLORS.accent; }}
    >{children}</button>
  );
};

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: 20
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: COLORS.surface, border: `1px solid ${COLORS.border}`,
        borderRadius: 16, padding: 32, width: "100%", maxWidth: 520,
        maxHeight: "90vh", overflowY: "auto"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: COLORS.text }}>{title}</h3>
          <button onClick={onClose} style={{
            background: COLORS.surface2, border: `1px solid ${COLORS.border}`,
            borderRadius: 6, width: 32, height: 32, cursor: "pointer",
            color: COLORS.textMuted, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center"
          }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// NAV
// ─────────────────────────────────────────────────────────────────────────────

const TopNav = ({ user, onNavigate, currentPage }) => {
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: `${COLORS.bg}ee`, backdropFilter: "blur(20px)",
      borderBottom: `1px solid ${COLORS.border}`,
      padding: "0 32px", height: 64,
      display: "flex", alignItems: "center", justifyContent: "space-between"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => onNavigate("landing")}>
        <div style={{
          width: 32, height: 32, background: COLORS.accent, borderRadius: 8,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#0A0A0B" strokeWidth="2" />
          </svg>
        </div>
        <span style={{ fontWeight: 800, fontSize: 18, color: COLORS.text, letterSpacing: "-0.5px" }}>FitCoach<span style={{ color: COLORS.accent }}>Pro</span></span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {!user ? (
          <>
            <Button variant="ghost" size="sm" onClick={() => onNavigate("login")}>Sign In</Button>
            <Button variant="primary" size="sm" onClick={() => onNavigate("signup")}>Get Started</Button>
          </>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              background: COLORS.accentBg, border: `1px solid ${COLORS.accent}30`,
              borderRadius: 20, padding: "4px 12px", fontSize: 12,
              color: COLORS.accent, fontWeight: 600
            }}>{user.role === "coach" ? "🏋️ Coach" : "💪 Client"}</div>
            <button onClick={() => onNavigate("dashboard")} style={{
              display: "flex", alignItems: "center", gap: 8,
              background: COLORS.surface2, border: `1px solid ${COLORS.border}`,
              borderRadius: 8, padding: "6px 14px", cursor: "pointer",
              color: COLORS.text, fontSize: 13, fontWeight: 600
            }}>
              <Avatar name={user.name} size={24} />
              {user.name.split(" ")[0]}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

const SidebarNav = ({ user, activeTab, setActiveTab }) => {
  const coachItems = [
    { id: "overview", label: "Overview", icon: "⬡" },
    { id: "clients", label: "Clients", icon: "👥" },
    { id: "workouts", label: "Workout Plans", icon: "🏋️" },
    { id: "diets", label: "Diet Charts", icon: "🥗" },
    { id: "payments", label: "Payments", icon: "💳" },
    { id: "packages", label: "Packages", icon: "📦" },
    { id: "profile", label: "Coach Profile", icon: "✦" },
  ];
  const clientItems = [
    { id: "overview", label: "My Dashboard", icon: "⬡" },
    { id: "workouts", label: "My Workouts", icon: "🏋️" },
    { id: "diets", label: "My Diet Plan", icon: "🥗" },
    { id: "progress", label: "My Progress", icon: "📈" },
    { id: "subscription", label: "Subscription", icon: "💎" },
    { id: "payment", label: "Make Payment", icon: "💳" },
  ];
  const items = user?.role === "coach" ? coachItems : clientItems;

  return (
    <aside style={{
      width: 240, background: COLORS.surface,
      borderRight: `1px solid ${COLORS.border}`,
      padding: "24px 16px", display: "flex", flexDirection: "column",
      gap: 4, flexShrink: 0, minHeight: "calc(100vh - 64px)"
    }}>
      <div style={{ padding: "0 8px 16px", borderBottom: `1px solid ${COLORS.border}`, marginBottom: 8 }}>
        <div style={{ fontSize: 11, color: COLORS.textDim, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          {user?.role === "coach" ? "Coach Portal" : "Client Portal"}
        </div>
      </div>
      {items.map(item => (
        <button key={item.id} onClick={() => setActiveTab(item.id)} style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "10px 12px", borderRadius: 8, cursor: "pointer",
          background: activeTab === item.id ? COLORS.accentBg2 : "transparent",
          border: activeTab === item.id ? `1px solid ${COLORS.accent}30` : "1px solid transparent",
          color: activeTab === item.id ? COLORS.accent : COLORS.textMuted,
          fontWeight: activeTab === item.id ? 700 : 500,
          fontSize: 14, textAlign: "left", transition: "all 0.15s"
        }}>
          <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{item.icon}</span>
          {item.label}
        </button>
      ))}

      <div style={{ marginTop: "auto", padding: "16px 0 0", borderTop: `1px solid ${COLORS.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px" }}>
          <Avatar name={user?.name || "User"} size={32} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{user?.name?.split(" ")[0]}</div>
            <div style={{ fontSize: 11, color: COLORS.textDim }}>{user?.role}</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// LANDING PAGE
// ─────────────────────────────────────────────────────────────────────────────

const LandingPage = ({ onNavigate }) => {
  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh" }}>
      {/* Hero */}
      <section style={{
        padding: "120px 40px 100px", textAlign: "center",
        maxWidth: 900, margin: "0 auto",
        background: `radial-gradient(ellipse 60% 40% at 50% 0%, ${COLORS.accentBg} 0%, transparent 70%)`
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: COLORS.accentBg, border: `1px solid ${COLORS.accent}40`,
          borderRadius: 20, padding: "6px 16px", marginBottom: 32,
          fontSize: 13, color: COLORS.accent, fontWeight: 600
        }}>
          ⚡ The Professional Fitness Coaching Platform
        </div>
        <h1 style={{
          fontSize: "clamp(42px, 7vw, 80px)", fontWeight: 900,
          color: COLORS.text, margin: "0 0 24px",
          letterSpacing: "-3px", lineHeight: 1.05
        }}>
          Stop coaching on<br />
          <span style={{ color: COLORS.accent }}>WhatsApp.</span>
        </h1>
        <p style={{
          fontSize: 20, color: COLORS.textMuted, maxWidth: 580,
          margin: "0 auto 48px", lineHeight: 1.7
        }}>
          FitCoachPro gives elite fitness coaches a professional platform to manage clients, deliver programs, and scale their business — without the chaos.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <Button variant="primary" size="lg" onClick={() => onNavigate("signup")}>Start Free Trial →</Button>
          <Button variant="secondary" size="lg" onClick={() => onNavigate("public-coach")}>See a Coach Profile</Button>
        </div>
        <div style={{ display: "flex", gap: 32, justifyContent: "center", marginTop: 64, flexWrap: "wrap" }}>
          {[["500+", "Active Coaches"], ["12,000+", "Clients Managed"], ["$4M+", "Payments Processed"]].map(([v, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.text }}>{v}</div>
              <div style={{ fontSize: 13, color: COLORS.textMuted }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "80px 40px", maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: 36, fontWeight: 800, color: COLORS.text, letterSpacing: "-1px", marginBottom: 60 }}>
          Everything you need to run a<br /><span style={{ color: COLORS.accent }}>premium coaching business</span>
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          {[
            { icon: "🎯", title: "Client Management", desc: "Approve registrations, track progress, manage active/inactive clients from one dashboard." },
            { icon: "🏋️", title: "Program Delivery", desc: "Upload workout plans and diet charts as PDFs, images, or text. Assign to individual clients or all." },
            { icon: "📈", title: "Progress Tracking", desc: "Clients upload photos and measurements. Visualize their transformation journey over time." },
            { icon: "💳", title: "Payment System", desc: "Manual bank transfer with screenshot uploads. Approve/reject payment proofs instantly." },
            { icon: "🌐", title: "Public Coach Page", desc: "Your own branded profile page at fitcoachpro.com/coach/yourname with packages and testimonials." },
            { icon: "📦", title: "Package Builder", desc: "Create multiple coaching packages with custom pricing, features, and durations." },
          ].map(f => (
            <div key={f.title} style={{
              background: COLORS.surface, border: `1px solid ${COLORS.border}`,
              borderRadius: 16, padding: 28,
              transition: "border-color 0.2s"
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = COLORS.accent + "50"}
              onMouseLeave={e => e.currentTarget.style.borderColor = COLORS.border}
            >
              <div style={{ fontSize: 36, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: COLORS.text, margin: "0 0 10px" }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: COLORS.textMuted, margin: 0, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        margin: "0 40px 80px",
        background: `linear-gradient(135deg, ${COLORS.surface2} 0%, ${COLORS.surface3} 100%)`,
        border: `1px solid ${COLORS.border}`, borderRadius: 24,
        padding: "64px 40px", textAlign: "center", maxWidth: 1020, marginLeft: "auto", marginRight: "auto"
      }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, color: COLORS.text, letterSpacing: "-1px", marginBottom: 16 }}>
          Ready to go professional?
        </h2>
        <p style={{ color: COLORS.textMuted, fontSize: 17, marginBottom: 32 }}>Join 500+ coaches who've upgraded from messy WhatsApp groups.</p>
        <Button variant="primary" size="lg" onClick={() => onNavigate("signup")}>Create Your Account — Free</Button>
      </section>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// AUTH PAGES
// ─────────────────────────────────────────────────────────────────────────────


const AuthPage = ({ mode, onNavigate, onLogin }) => {
  const [role, setRole] = useState("coach");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    // Basic validation
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
        // Create new account
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Save their name to Firebase profile
        await updateProfile(userCredential.user, { displayName: name });
      } else {
        // Sign in existing account
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }

      const firebaseUser = userCredential.user;

      // Build user object for the app
      const user = {
        name: firebaseUser.displayName || email.split("@")[0],
        email: firebaseUser.email,
        uid: firebaseUser.uid,
        role: role,
      };

      onLogin(user);
      onNavigate("dashboard");

    } catch (err) {
      // Show friendly error messages
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
          <p style={{ color: COLORS.textMuted, fontSize: 14, margin: 0 }}>
            {mode === "login" ? "Sign in to your dashboard" : "Start your fitness coaching journey"}
          </p>
        </div>

        {/* Role Toggle */}
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

        {/* Error Message */}
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
              fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
              width: "100%", marginTop: 4
            }}
          >
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

const PublicCoachPage = ({ onNavigate }) => {
  const coach = coaches[0];
  const [selectedPkg, setSelectedPkg] = useState(null);

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", paddingBottom: 80 }}>
      {/* Hero Section */}
      <div style={{
        background: `linear-gradient(180deg, ${COLORS.accentBg} 0%, transparent 100%)`,
        borderBottom: `1px solid ${COLORS.border}`, padding: "60px 40px 48px",
        textAlign: "center"
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
          fitcoachpro.com/coach/{coach.handle}
        </div>
        <p style={{ color: COLORS.textMuted, maxWidth: 560, margin: "0 auto 20px", fontSize: 16, lineHeight: 1.7 }}>
          {coach.bio}
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          {coach.specialties.map(s => <Badge key={s}>{s}</Badge>)}
        </div>
        <div style={{ display: "flex", gap: 32, justifyContent: "center", marginTop: 32 }}>
          {[["⭐ " + coach.rating, "Rating"], [coach.reviews, "Reviews"], [coach.clients + "+", "Clients"]].map(([v, l]) => (
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
            {coach.transformations.map((t, i) => (
              <div key={i} style={{
                background: COLORS.surface, border: `1px solid ${COLORS.border}`,
                borderRadius: 14, padding: 24
              }}>
                <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                  <div style={{ flex: 1, background: COLORS.surface2, borderRadius: 8, padding: "12px 0", textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: COLORS.textDim, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Before</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.danger, marginTop: 4 }}>{t.before}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", color: COLORS.accent, fontSize: 18 }}>→</div>
                  <div style={{ flex: 1, background: COLORS.surface2, borderRadius: 8, padding: "12px 0", textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: COLORS.textDim, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>After</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.success, marginTop: 4 }}>{t.after}</div>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: COLORS.textMuted }}>
                  {t.name} · {t.duration}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Packages */}
        <section style={{ marginTop: 56 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, letterSpacing: "-0.5px", marginBottom: 24 }}>
            Coaching Packages
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {coach.packages.map(pkg => (
              <div key={pkg.id} style={{
                background: COLORS.surface,
                border: `2px solid ${pkg.popular ? COLORS.accent : COLORS.border}`,
                borderRadius: 16, padding: 28, position: "relative"
              }}>
                {pkg.popular && (
                  <div style={{
                    position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)",
                    background: COLORS.accent, color: "#0A0A0B", fontSize: 11,
                    fontWeight: 800, padding: "4px 16px", borderRadius: 20, letterSpacing: "0.08em", textTransform: "uppercase"
                  }}>Most Popular</div>
                )}
                <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.text, marginBottom: 4 }}>{pkg.name}</div>
                <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 20 }}>{pkg.duration}</div>
                <div style={{ marginBottom: 24 }}>
                  <span style={{ fontSize: 42, fontWeight: 900, color: pkg.popular ? COLORS.accent : COLORS.text, letterSpacing: "-2px" }}>${pkg.price}</span>
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 10 }}>
                  {pkg.features.map(f => (
                    <li key={f} style={{ display: "flex", gap: 10, fontSize: 14, color: COLORS.textMuted, alignItems: "flex-start" }}>
                      <span style={{ color: COLORS.success, fontSize: 16, lineHeight: 1.3 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={pkg.popular ? "primary" : "secondary"}
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => { setSelectedPkg(pkg); onNavigate("signup"); }}
                >
                  Get Started
                </Button>
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
            {coach.testimonials.map((t, i) => (
              <div key={i} style={{
                background: COLORS.surface, border: `1px solid ${COLORS.border}`,
                borderRadius: 14, padding: 24
              }}>
                <div style={{ color: COLORS.warning, marginBottom: 12, fontSize: 16 }}>{"★".repeat(t.stars)}</div>
                <p style={{ fontSize: 14, color: COLORS.textMuted, lineHeight: 1.7, margin: "0 0 16px" }}>"{t.text}"</p>
                <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>— {t.name}</div>
              </div>
            ))}
          </div>
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

const CoachClients = () => {
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);

  const filtered = filter === "all" ? mockClients : mockClients.filter(c => c.status === filter);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, margin: 0, letterSpacing: "-0.5px" }}>Clients</h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>+ Add Client</Button>
      </div>

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

      <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
              {["Client", "Package", "Goal", "Progress", "Status", "Actions"].map(h => (
                <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: COLORS.textDim, textAlign: "left", letterSpacing: "0.08em", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr key={c.id} style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${COLORS.border}` : "none" }}>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar name={c.name} size={34} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: COLORS.textMuted }}>{c.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "14px 16px", fontSize: 13, color: COLORS.textMuted }}>{c.package}</td>
                <td style={{ padding: "14px 16px", fontSize: 13, color: COLORS.textMuted }}>{c.goal}</td>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, height: 4, background: COLORS.surface3, borderRadius: 2, minWidth: 60 }}>
                      <div style={{ width: `${c.progress}%`, height: "100%", background: COLORS.accent, borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 12, color: COLORS.textMuted, minWidth: 30 }}>{c.progress}%</span>
                  </div>
                </td>
                <td style={{ padding: "14px 16px" }}><Badge variant={c.status}>{c.status}</Badge></td>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    {c.status === "pending" && (
                      <>
                        <Button variant="success" size="sm">✓</Button>
                        <Button variant="danger" size="sm">✗</Button>
                      </>
                    )}
                    <Button variant="secondary" size="sm">View</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
            <Button variant="primary" style={{ flex: 1, justifyContent: "center" }} onClick={() => setShowModal(false)}>Add Client</Button>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const CoachWorkouts = () => {
  const [showModal, setShowModal] = useState(false);
  const [uploadType, setUploadType] = useState("Workout Plan");

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, margin: 0, letterSpacing: "-0.5px" }}>Workout Plans</h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>+ Upload Plan</Button>
      </div>

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
            <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 16 }}>Assigned to: {w.assignedTo}</div>
            <div style={{ display: "flex", gap: 8 }}>
              <Button variant="secondary" size="sm">View</Button>
              <Button variant="ghost" size="sm">Edit</Button>
              <Button variant="danger" size="sm">Delete</Button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Upload Workout Plan">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Input label="Plan Name" placeholder="e.g., Push Day A - Upper Body" />
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
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = COLORS.accent + "60"}
            onMouseLeave={e => e.currentTarget.style.borderColor = COLORS.border}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>📁</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.textMuted }}>Drop files here or click to upload</div>
            <div style={{ fontSize: 12, color: COLORS.textDim, marginTop: 4 }}>PDF, JPG, PNG up to 20MB</div>
          </div>
          <Textarea label="Notes (optional)" placeholder="Any instructions for the client..." />
          <div style={{ display: "flex", gap: 12 }}>
            <Button variant="primary" style={{ flex: 1, justifyContent: "center" }} onClick={() => setShowModal(false)}>Upload Plan</Button>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
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

const CoachPayments = () => (
  <div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, margin: 0, letterSpacing: "-0.5px" }}>Payments</h2>
      <div style={{ display: "flex", gap: 12 }}>
        <Stat label="Total Revenue" value="$1,096" />
        <Stat label="Pending" value="$99" />
      </div>
    </div>

    <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
            {["Client", "Package", "Amount", "Date", "Proof", "Status", "Actions"].map(h => (
              <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: COLORS.textDim, textAlign: "left", letterSpacing: "0.08em", textTransform: "uppercase" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {mockPayments.map((p, i) => (
            <tr key={p.id} style={{ borderBottom: i < mockPayments.length - 1 ? `1px solid ${COLORS.border}` : "none" }}>
              <td style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Avatar name={p.client} size={30} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>{p.client}</span>
                </div>
              </td>
              <td style={{ padding: "14px 16px", fontSize: 13, color: COLORS.textMuted }}>{p.package}</td>
              <td style={{ padding: "14px 16px", fontSize: 15, fontWeight: 700, color: COLORS.accent }}>${p.amount}</td>
              <td style={{ padding: "14px 16px", fontSize: 13, color: COLORS.textMuted }}>{p.date}</td>
              <td style={{ padding: "14px 16px" }}>
                <button style={{
                  background: COLORS.infoBg, color: COLORS.info, border: "none",
                  borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer", fontWeight: 600
                }}>View Proof</button>
              </td>
              <td style={{ padding: "14px 16px" }}><Badge variant={p.status}>{p.status}</Badge></td>
              <td style={{ padding: "14px 16px" }}>
                {p.status === "pending" && (
                  <div style={{ display: "flex", gap: 6 }}>
                    <Button variant="success" size="sm">✓ Approve</Button>
                    <Button variant="danger" size="sm">✗ Reject</Button>
                  </div>
                )}
                {p.status === "approved" && <span style={{ fontSize: 12, color: COLORS.textDim }}>Completed</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const CoachPackages = () => {
  const [showModal, setShowModal] = useState(false);
  const [pkgName, setPkgName] = useState("");
  const [pkgPrice, setPkgPrice] = useState("");
  const [pkgDuration, setPkgDuration] = useState("");

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, margin: 0, letterSpacing: "-0.5px" }}>Coaching Packages</h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>+ Create Package</Button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
        {coaches[0].packages.map(pkg => (
          <div key={pkg.id} style={{
            background: COLORS.surface,
            border: `2px solid ${pkg.popular ? COLORS.accent + "50" : COLORS.border}`,
            borderRadius: 16, padding: 24
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 800, color: COLORS.text }}>{pkg.name}</div>
                <div style={{ fontSize: 13, color: COLORS.textMuted }}>{pkg.duration}</div>
              </div>
              {pkg.popular && <Badge variant="popular">Popular</Badge>}
            </div>
            <div style={{ fontSize: 36, fontWeight: 900, color: COLORS.accent, letterSpacing: "-1px", marginBottom: 20 }}>${pkg.price}</div>
            <div style={{ display: "flex", gap: 8 }}>
              <Button variant="secondary" size="sm">Edit</Button>
              <Button variant="danger" size="sm">Delete</Button>
            </div>
          </div>
        ))}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Package">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Input label="Package Name" placeholder="e.g., Elite Coaching" value={pkgName} onChange={e => setPkgName(e.target.value)} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input label="Price ($)" type="number" placeholder="199" value={pkgPrice} onChange={e => setPkgPrice(e.target.value)} />
            <Input label="Duration" placeholder="e.g., 3 Months" value={pkgDuration} onChange={e => setPkgDuration(e.target.value)} />
          </div>
          <Textarea label="Features (one per line)" placeholder="Custom workout plan&#10;Diet chart&#10;Weekly check-ins" />
          <div style={{ display: "flex", gap: 12 }}>
            <Button variant="primary" style={{ flex: 1, justifyContent: "center" }} onClick={() => setShowModal(false)}>Create Package</Button>
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

const ClientPayment = () => {
  const [showModal, setShowModal] = useState(false);
  const coach = coaches[0];

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, marginBottom: 24, letterSpacing: "-0.5px" }}>Make Payment</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 16 }}>Choose Package</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {coach.packages.map(pkg => (
              <div key={pkg.id} style={{
                background: COLORS.surface, border: `1px solid ${pkg.popular ? COLORS.accent + "40" : COLORS.border}`,
                borderRadius: 12, padding: 18, cursor: "pointer"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.text }}>{pkg.name}</div>
                    <div style={{ fontSize: 13, color: COLORS.textMuted }}>{pkg.duration}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: 24, fontWeight: 900, color: pkg.popular ? COLORS.accent : COLORS.text }}>${pkg.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 16 }}>Payment Instructions</h3>
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 24, marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.8 }}>
              <div style={{ fontWeight: 700, color: COLORS.text, marginBottom: 12 }}>Bank Transfer Details</div>
              <div><strong style={{ color: COLORS.text }}>Bank:</strong> Chase Bank</div>
              <div><strong style={{ color: COLORS.text }}>Name:</strong> John Carter</div>
              <div><strong style={{ color: COLORS.text }}>Account:</strong> ••••••7891</div>
              <div><strong style={{ color: COLORS.text }}>Routing:</strong> ••••••1234</div>
            </div>
          </div>
          <div style={{
            background: COLORS.warningBg, border: `1px solid ${COLORS.warning}30`,
            borderRadius: 10, padding: 16, marginBottom: 20, fontSize: 13, color: COLORS.warning
          }}>
            ⚠️ Transfer exact amount and upload your payment screenshot for approval.
          </div>
          <Button variant="primary" size="lg" style={{ width: "100%", justifyContent: "center" }} onClick={() => setShowModal(true)}>
            Upload Payment Proof
          </Button>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Upload Payment Proof">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.textMuted }}>Selected Package</label>
            <select style={{
              background: COLORS.surface2, border: `1px solid ${COLORS.border}`,
              borderRadius: 8, padding: "10px 14px", color: COLORS.text, fontSize: 14
            }}>
              {coach.packages.map(p => <option key={p.id}>{p.name} — ${p.price}</option>)}
            </select>
          </div>
          <Input label="Amount Transferred ($)" type="number" placeholder="249" />
          <Input label="Transaction Reference (optional)" placeholder="REF123456" />
          <div style={{
            border: `2px dashed ${COLORS.border}`, borderRadius: 10, padding: 32,
            textAlign: "center", cursor: "pointer"
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📸</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.textMuted }}>Upload Payment Screenshot</div>
            <div style={{ fontSize: 12, color: COLORS.textDim, marginTop: 4 }}>JPG, PNG, PDF</div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <Button variant="primary" style={{ flex: 1, justifyContent: "center" }} onClick={() => setShowModal(false)}>Submit for Approval</Button>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────

const Dashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState("overview");

  const renderContent = () => {
    if (user?.role === "coach") {
      switch (activeTab) {
        case "overview": return <CoachOverview />;
        case "clients": return <CoachClients />;
        case "workouts": return <CoachWorkouts />;
        case "diets": return <CoachDiets />;
        case "payments": return <CoachPayments />;
        case "packages": return <CoachPackages />;
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
        case "payment": return <ClientPayment />;
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
  const [page, setPage] = useState("landing");
  const [user, setUser] = useState(null);

  const navigate = (p) => setPage(p);
  const login = (u) => setUser(u);

  return (
    <div style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", background: COLORS.bg, minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,800;0,9..40,900;1,9..40,400&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: ${COLORS.bg}; }
        input, select, textarea, button { font-family: inherit; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: ${COLORS.surface}; }
        ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: ${COLORS.borderHover}; }
      `}</style>

      {page !== "dashboard" && (
        <TopNav user={user} onNavigate={navigate} currentPage={page} />
      )}

      {page === "landing" && <LandingPage onNavigate={navigate} />}
      {page === "login" && <AuthPage mode="login" onNavigate={navigate} onLogin={login} />}
      {page === "signup" && <AuthPage mode="signup" onNavigate={navigate} onLogin={login} />}
      {page === "public-coach" && <PublicCoachPage onNavigate={navigate} />}
      {page === "dashboard" && user && (
        <div>
          <TopNav user={user} onNavigate={navigate} currentPage={page} />
          <Dashboard user={user} />
        </div>
      )}
      {page === "dashboard" && !user && (
        <AuthPage mode="login" onNavigate={navigate} onLogin={login} />
      )}
    </div>
  );
}
