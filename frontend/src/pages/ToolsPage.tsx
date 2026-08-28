import { Link } from "react-router-dom";

const tools = [
  {
    id: "stress-strain",
    href: "/tools/stress-strain",
    title: "Stress & Strain Calculator",
    formula: "σ = F / A  ·  ε = σ / E  ·  δ = ε · L",
    description:
      "Compute normal stress, axial strain, and deformation for prismatic bars under axial loading. Supports SI and Imperial units.",
    subject: "Strength of Materials",
    badge: "Mechanics",
    badgeColor: "#f59e0b",
    inputs: ["Force (F)", "Area (A)", "Young's Modulus (E)", "Length (L)"],
    outputs: ["Normal Stress (σ)", "Axial Strain (ε)", "Deformation (δ)"],
    features: ["Unit conversion", "Input validation", "Formula display"],
  },
  {
    id: "mohrs-circle",
    href: "/tools/mohrs-circle",
    title: "Mohr's Circle",
    formula: "σ₁,₂ = σC ± R  ·  R = √[((σx−σy)/2)² + τxy²]",
    description:
      "Interactive Mohr's Circle visualization for 2D stress transformation. Computes principal stresses, max shear stress, and principal angles.",
    subject: "Strength of Materials",
    badge: "Mechanics",
    badgeColor: "#f59e0b",
    inputs: ["Normal Stress σx", "Normal Stress σy", "Shear Stress τxy"],
    outputs: ["Principal Stress σ₁", "Principal Stress σ₂", "Max Shear τmax", "Principal Angle θp"],
    features: ["SVG visualization", "Real-time update", "Angle display"],
  },
  {
    id: "reynolds",
    href: "/tools/reynolds",
    title: "Reynolds Number",
    formula: "Re = ρ · v · D / μ",
    description:
      "Calculate the Reynolds number for pipe flow and classify the regime as laminar, transitional, or turbulent. Includes common fluid presets.",
    subject: "Fluid Mechanics",
    badge: "Fluids",
    badgeColor: "#06b6d4",
    inputs: ["Density (ρ)", "Velocity (v)", "Diameter (D)", "Viscosity (μ)"],
    outputs: ["Reynolds Number (Re)", "Flow Classification", "Regime Description"],
    features: ["Fluid presets", "Flow regime indicator", "Critical Re display"],
  },
  {
    id: "vibration",
    href: "/tools/vibration",
    title: "Vibration Analysis (SDOF)",
    formula: "mẍ + cẋ + kx = 0  ·  ωn = √(k/m)",
    description:
      "Analyze a single-degree-of-freedom mass-spring-damper system. Computes natural frequency, damping ratio, and plots the time-domain response.",
    subject: "Mechanical Vibrations",
    badge: "Dynamics",
    badgeColor: "#a78bfa",
    inputs: ["Mass (m)", "Spring Stiffness (k)", "Damping (c)", "Initial Conditions"],
    outputs: ["Natural Frequency ωn", "Damped Frequency ωd", "Damping Ratio ζ", "System Type"],
    features: ["Time-history chart", "Damping classification", "Interactive parameters"],
  },
  {
    id: "beam",
    href: "/tools",
    title: "Beam Analysis",
    formula: "EI·d²y/dx² = M(x)",
    description:
      "Shear force and bending moment diagrams for simply supported and cantilever beams with point loads and distributed loads.",
    subject: "Strength of Materials",
    badge: "Mechanics",
    badgeColor: "#f59e0b",
    inputs: ["Beam Length", "Support Type", "Load Type", "Load Magnitude"],
    outputs: ["Reactions", "Shear Force Diagram", "Bending Moment Diagram", "Deflection"],
    features: ["SFD/BMD plots", "Reaction forces", "Max moment location"],
    comingSoon: true,
  },
];

export default function ToolsPage() {
  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 24px" }}>
      {/* Header */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", color: "#3b82f6", letterSpacing: "0.1em", marginBottom: 10 }}>
          ENGINEERING TOOLS
        </div>
        <h1
          style={{
            fontFamily: "DM Sans, system-ui, sans-serif",
            fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
            fontWeight: 700,
            color: "#f1f5f9",
            margin: "0 0 12px",
            letterSpacing: "-0.03em",
          }}
        >
          Calculator Suite
        </h1>
        <p style={{ fontSize: 15, color: "#475569", margin: 0, maxWidth: 560 }}>
          Interactive engineering calculators with real-time results, unit handling, input validation, and visualizations.
        </p>
      </div>

      {/* Info bar */}
      <div
        style={{
          display: "flex",
          gap: 24,
          padding: "14px 20px",
          backgroundColor: "rgba(59,130,246,0.05)",
          border: "1px solid rgba(59,130,246,0.15)",
          borderRadius: 8,
          marginBottom: 32,
          flexWrap: "wrap",
        }}
      >
        {[
          { label: "Calculators", value: "5" },
          { label: "Unit Systems", value: "SI + Imperial" },
          { label: "Subjects", value: "3" },
          { label: "Visualizations", value: "Charts + SVG" },
        ].map((s) => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 14, fontWeight: 600, color: "#3b82f6" }}>
              {s.value}
            </span>
            <span style={{ fontSize: 13, color: "#475569" }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Tools grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {tools.map((tool) => (
          <div
            key={tool.id}
            style={{
              backgroundColor: "#0c1528",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 12,
              overflow: "hidden",
              opacity: tool.comingSoon ? 0.6 : 1,
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 0 }}>
              {/* Left: main info */}
              <div style={{ padding: 28, borderRight: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: 4,
                      fontFamily: "JetBrains Mono, monospace",
                      backgroundColor: `${tool.badgeColor}12`,
                      color: tool.badgeColor,
                      border: `1px solid ${tool.badgeColor}25`,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {tool.badge}
                  </span>
                  <span style={{ fontSize: 12, color: "#334155" }}>{tool.subject}</span>
                  {tool.comingSoon && (
                    <span
                      style={{
                        fontSize: 10,
                        padding: "2px 7px",
                        borderRadius: 4,
                        backgroundColor: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "#475569",
                        fontFamily: "JetBrains Mono, monospace",
                      }}
                    >
                      COMING SOON
                    </span>
                  )}
                </div>

                <h2
                  style={{
                    fontFamily: "DM Sans, system-ui, sans-serif",
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#f1f5f9",
                    margin: "0 0 8px",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {tool.title}
                </h2>

                {/* Formula */}
                <div
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: 13,
                    color: "#06b6d4",
                    backgroundColor: "rgba(6,182,212,0.05)",
                    border: "1px solid rgba(6,182,212,0.1)",
                    borderRadius: 6,
                    padding: "7px 12px",
                    marginBottom: 14,
                    display: "inline-block",
                  }}
                >
                  {tool.formula}
                </div>

                <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.65, margin: "0 0 20px" }}>
                  {tool.description}
                </p>

                <div style={{ display: "flex", gap: 16 }}>
                  {/* Inputs */}
                  <div>
                    <div style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", color: "#334155", letterSpacing: "0.06em", marginBottom: 8 }}>
                      INPUTS
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {tool.inputs.map((inp) => (
                        <div key={inp} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b" }}>
                          <span style={{ color: "#1e3a5f" }}>→</span> {inp}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ width: 1, backgroundColor: "rgba(255,255,255,0.05)" }} />

                  {/* Outputs */}
                  <div>
                    <div style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", color: "#334155", letterSpacing: "0.06em", marginBottom: 8 }}>
                      OUTPUTS
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {tool.outputs.map((out) => (
                        <div key={out} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b" }}>
                          <span style={{ color: "#22c55e" }}>←</span> {out}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: features + CTA */}
              <div
                style={{
                  padding: 24,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  backgroundColor: "#060b18",
                }}
              >
                <div>
                  <div style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", color: "#334155", letterSpacing: "0.06em", marginBottom: 12 }}>
                    FEATURES
                  </div>
                  {tool.features.map((f) => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontSize: 13, color: "#475569" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {f}
                    </div>
                  ))}
                </div>

                <Link
                  to={tool.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "11px 20px",
                    backgroundColor: tool.comingSoon ? "rgba(255,255,255,0.04)" : "#3b82f6",
                    color: tool.comingSoon ? "#334155" : "#fff",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    textDecoration: "none",
                    marginTop: 20,
                    pointerEvents: tool.comingSoon ? "none" : "auto",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {tool.comingSoon ? "Coming Soon" : "Open Calculator →"}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
