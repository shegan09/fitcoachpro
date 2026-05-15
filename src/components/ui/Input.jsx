import { COLORS } from "../../constants/colors";

export const Input = ({ label, ...props }) => (
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

export const Textarea = ({ label, ...props }) => (
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