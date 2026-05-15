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

export default Avatar;