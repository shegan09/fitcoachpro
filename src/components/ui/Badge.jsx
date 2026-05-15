import { COLORS } from "../../constants/colors";

const Badge = ({ children, variant = "default" }) => {
  const variants = {
    default: { bg: COLORS.surface3, color: COLORS.textMuted },
    active: { bg: COLORS.successBg, color: COLORS.success },
    pending: { bg: COLORS.warningBg, color: COLORS.warning },
    expired: { bg: COLORS.dangerBg, color: COLORS.danger },
    approved: { bg: COLORS.successBg, color: COLORS.success },
    rejected: { bg: COLORS.dangerBg, color: COLORS.danger },
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

export default Badge;