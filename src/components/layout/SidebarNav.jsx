import { COLORS } from "../../constants/colors";
import Avatar from "../ui/Avatar";

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

const SidebarNav = ({ user, activeTab, setActiveTab }) => {
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

export default SidebarNav;