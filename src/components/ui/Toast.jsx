import { useState, useEffect, createContext, useContext, useCallback } from "react";

const COLORS = {
  success: "#22C55E", successBg: "rgba(34,197,94,0.1)",
  danger: "#EF4444", dangerBg: "rgba(239,68,68,0.1)",
  warning: "#F59E0B", warningBg: "rgba(245,158,11,0.1)",
  info: "#3B82F6", infoBg: "rgba(59,130,246,0.1)",
  surface: "#111113", border: "#2A2A32", text: "#F5F5F7",
};

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const icons = { success: "✅", danger: "❌", warning: "⚠️", info: "ℹ️" };
  const styles = {
    success: { bg: COLORS.successBg, color: COLORS.success, border: `1px solid ${COLORS.success}40` },
    danger: { bg: COLORS.dangerBg, color: COLORS.danger, border: `1px solid ${COLORS.danger}40` },
    warning: { bg: COLORS.warningBg, color: COLORS.warning, border: `1px solid ${COLORS.warning}40` },
    info: { bg: COLORS.infoBg, color: COLORS.info, border: `1px solid ${COLORS.info}40` },
  };

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      {/* Toast container */}
      <div style={{
        position: "fixed", bottom: 24, right: 24,
        display: "flex", flexDirection: "column", gap: 10,
        zIndex: 9999, maxWidth: 360
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background: styles[t.type]?.bg || COLORS.surface,
            border: styles[t.type]?.border || `1px solid ${COLORS.border}`,
            color: styles[t.type]?.color || COLORS.text,
            borderRadius: 10, padding: "12px 16px",
            display: "flex", alignItems: "center", gap: 10,
            fontSize: 14, fontWeight: 600,
            animation: "slideIn 0.2s ease",
            boxShadow: "0 4px 20px rgba(0,0,0,0.4)"
          }}>
            <span>{icons[t.type]}</span>
            <span style={{ flex: 1 }}>{t.message}</span>
            <button onClick={() => removeToast(t.id)} style={{
              background: "none", border: "none", cursor: "pointer",
              color: "inherit", fontSize: 16, opacity: 0.7, padding: 0
            }}>×</button>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}