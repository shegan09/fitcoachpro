import { COLORS } from "../../constants/colors";

const Button = ({ children, variant = "primary", size = "md", onClick, style: extraStyle = {} }) => {
  const sizes = {
    sm: { padding: "7px 16px", fontSize: 13 },
    md: { padding: "10px 22px", fontSize: 14 },
    lg: { padding: "14px 32px", fontSize: 15 }
  };
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
      onMouseEnter={e => { if (variant === "primary") e.currentTarget.style.background = COLORS.accentDim; }}
      onMouseLeave={e => { if (variant === "primary") e.currentTarget.style.background = COLORS.accent; }}
    >{children}</button>
  );
};

export default Button;