import { Link } from "react-router-dom";

const sections = [
  {
    title: "Platform",
    links: [
      { label: "Learn", href: "/learn" },
      { label: "Engineering Tools", href: "/tools" },
      { label: "Formula Library", href: "/formulas" },
    ],
  },
  {
    title: "Subjects",
    links: [
      { label: "Statics", href: "/learn" },
      { label: "Strength of Materials", href: "/learn" },
      { label: "Fluid Mechanics", href: "/learn" },
    ],
  },
  {
    title: "Tools",
    links: [
      { label: "Stress & Strain", href: "/tools/stress-strain" },
      { label: "Mohr's Circle", href: "/tools/mohrs-circle" },
      { label: "Reynolds Number", href: "/tools/reynolds" },
      { label: "Vibration Analysis", href: "/tools/vibration" },
    ],
  },
];

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "#060b18",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "56px 24px 32px",
        marginTop: "auto",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: 40,
            marginBottom: 48,
          }}
        >
          {/* Brand */}
          <div>
            <div
              style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontWeight: 700,
                fontSize: 20,
                color: "#e2e8f0",
                letterSpacing: "-0.025em",
                marginBottom: 12,
              }}
            >
              Mech<span style={{ color: "#3b82f6" }}>Lab</span>
            </div>
            <p style={{ color: "#475569", fontSize: 14, lineHeight: 1.7, maxWidth: 260, margin: 0 }}>
              A digital engineering workspace for Mechanical Engineering students.
              Learn, calculate, and analyze in one integrated platform.
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <span
                style={{
                  fontSize: 11,
                  fontFamily: "JetBrains Mono, monospace",
                  color: "#334155",
                  backgroundColor: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  padding: "3px 8px",
                  borderRadius: 4,
                }}
              >
                CS50x Final Project
              </span>
            </div>
          </div>

          {sections.map((s) => (
            <div key={s.title}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#334155",
                  marginBottom: 16,
                }}
              >
                {s.title}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {s.links.map((l) => (
                  <Link
                    key={l.label}
                    to={l.href}
                    style={{
                      fontSize: 14,
                      color: "#475569",
                      textDecoration: "none",
                      transition: "color 0.15s ease",
                    }}
                    onMouseEnter={(e) => ((e.target as HTMLAnchorElement).style.color = "#94a3b8")}
                    onMouseLeave={(e) => ((e.target as HTMLAnchorElement).style.color = "#475569")}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.05)",
            paddingTop: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <p style={{ margin: 0, fontSize: 13, color: "#334155" }}>
            © 2024 MechLab. Built for CS50x Final Project.
          </p>
          <div style={{ display: "flex", gap: 24 }}>
            <span style={{ fontSize: 13, color: "#334155" }}>
              React + Vite + Python + Django
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
