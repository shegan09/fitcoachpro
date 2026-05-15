import { COLORS } from "../../constants/colors";
import Avatar from "../ui/Avatar";
import Button from "../ui/Button";

const TopNav = ({ user, onNavigate, onLogout }) => {
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: `${COLORS.bg}ee`, backdropFilter: "blur(20px)",
      borderBottom: `1px solid ${COLORS.border}`,
      padding: "0 32px", height: 64,
      display: "flex", alignItems: "center", justifyContent: "space-between"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
        onClick={() => onNavigate("landing")}>
        <div style={{
          width: 32, height: 32, background: COLORS.accent, borderRadius: 8,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#0A0A0B" />
          </svg>
        </div>
        <span style={{ fontWeight: 800, fontSize: 18, color: COLORS.text, letterSpacing: "-0.5px" }}>
          FitCoach<span style={{ color: COLORS.accent }}>Pro</span>
        </span>
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
            }}>
              {user.role === "coach" ? "🏋️ Coach" : "💪 Client"}
            </div>
            <button onClick={() => onNavigate("dashboard")} style={{
              display: "flex", alignItems: "center", gap: 8,
              background: COLORS.surface2, border: `1px solid ${COLORS.border}`,
              borderRadius: 8, padding: "6px 14px", cursor: "pointer",
              color: COLORS.text, fontSize: 13, fontWeight: 600
            }}>
              <Avatar name={user.name} size={24} />
              {user.name.split(" ")[0]}
            </button>
            <button onClick={onLogout} style={{
              display: "flex", alignItems: "center", gap: 6,
              background: COLORS.dangerBg, border: `1px solid ${COLORS.danger}30`,
              borderRadius: 8, padding: "6px 14px", cursor: "pointer",
              color: COLORS.danger, fontSize: 13, fontWeight: 600
            }}>
              🚪 Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default TopNav;