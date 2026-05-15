import { COLORS } from "../../constants/colors";

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
            color: COLORS.textMuted, fontSize: 18, display: "flex",
            alignItems: "center", justifyContent: "center"
          }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;