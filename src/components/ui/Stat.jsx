import { COLORS } from "../../constants/colors";

const Stat = ({ label, value, icon }) => (
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

export default Stat;