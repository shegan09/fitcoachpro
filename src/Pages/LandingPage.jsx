import { COLORS } from "../constants/colors";
import Button from "../components/ui/Button";

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
              borderRadius: 16, padding: 28, transition: "border-color 0.2s"
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
        padding: "64px 40px", textAlign: "center",
        maxWidth: 1020, marginLeft: "auto", marginRight: "auto"
      }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, color: COLORS.text, letterSpacing: "-1px", marginBottom: 16 }}>
          Ready to go professional?
        </h2>
        <p style={{ color: COLORS.textMuted, fontSize: 17, marginBottom: 32 }}>
          Join 500+ coaches who've upgraded from messy WhatsApp groups.
        </p>
        <Button variant="primary" size="lg" onClick={() => onNavigate("signup")}>
          Create Your Account — Free
        </Button>
      </section>
    </div>
  );
};

export default LandingPage;