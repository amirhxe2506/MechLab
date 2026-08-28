import { Link } from "react-router-dom";

// ─── Data ──────────────────────────────────────────────────────────────────────

const subjects = [
  {
    id: "statics",
    title: "Statics",
    description:
      "Equilibrium of forces, moments, and structures. Free body diagrams, trusses, and support reactions.",
    topics: 23,
    chapters: 5,
    accent: "#3b82f6",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2L2 19h20L12 2z" />
        <path d="M12 9v4M12 17h.01" />
      </svg>
    ),
    tags: ["Forces", "Moments", "Equilibrium", "Trusses"],
  },
  {
    id: "som",
    title: "Strength of Materials",
    description:
      "Stress, strain, deformation, bending, shear, and failure criteria for structural elements.",
    topics: 31,
    chapters: 7,
    accent: "#f59e0b",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="8" width="20" height="8" rx="1" />
        <path d="M6 8V6M18 8V6M6 16v2M18 16v2" />
        <path d="M9 12h6" strokeDasharray="2 2" />
      </svg>
    ),
    tags: ["Stress", "Strain", "Bending", "Mohr's Circle"],
  },
  {
    id: "fluids",
    title: "Fluid Mechanics",
    description:
      "Fluid statics, kinematics, Bernoulli equation, Reynolds number, and pipe flow analysis.",
    topics: 19,
    chapters: 4,
    accent: "#06b6d4",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2c0 0-6 6.5-6 11a6 6 0 0012 0c0-4.5-6-11-6-11z" />
        <path d="M8 15a4 4 0 008 0" />
      </svg>
    ),
    tags: ["Bernoulli", "Reynolds", "Pipe Flow", "Pressure"],
  },
];

const tools = [
  {
    id: "stress-strain",
    href: "/tools/stress-strain",
    title: "Stress & Strain",
    subtitle: "σ = F / A  ·  ε = σ / E",
    description: "Calculate normal stress, strain, and axial deformation for structural members.",
    badge: "Mechanics",
    badgeColor: "#f59e0b",
  },
  {
    id: "mohrs-circle",
    href: "/tools/mohrs-circle",
    title: "Mohr's Circle",
    subtitle: "σ₁,₂ = σC ± R",
    description: "Find principal stresses, max shear stress, and principal angles from a 2D stress state.",
    badge: "Mechanics",
    badgeColor: "#f59e0b",
  },
  {
    id: "reynolds",
    href: "/tools/reynolds",
    title: "Reynolds Number",
    subtitle: "Re = ρvD / μ",
    description: "Classify pipe flow as laminar, transitional, or turbulent. Fluid properties included.",
    badge: "Fluids",
    badgeColor: "#06b6d4",
  },
  {
    id: "vibration",
    href: "/tools/vibration",
    title: "Vibration Analysis",
    subtitle: "mẍ + cẋ + kx = 0",
    description: "SDOF system response with time-history chart. Natural frequency, damping ratio, and classification.",
    badge: "Dynamics",
    badgeColor: "#a78bfa",
  },
  {
    id: "beam",
    href: "/tools",
    title: "Beam Analysis",
    subtitle: "V, M diagrams",
    description: "Shear force and bending moment diagrams for simply supported and cantilever beams.",
    badge: "Mechanics",
    badgeColor: "#f59e0b",
  },
];

const workflow = [
  {
    step: "01",
    title: "Learn",
    description: "Study the concept, review governing equations, and understand each variable and its units.",
    color: "#3b82f6",
  },
  {
    step: "02",
    title: "Formula",
    description: "Examine the mathematical relationship, assumptions, and applicability conditions.",
    color: "#a78bfa",
  },
  {
    step: "03",
    title: "Calculate",
    description: "Enter your parameters into the interactive calculator and compute the result instantly.",
    color: "#06b6d4",
  },
  {
    step: "04",
    title: "Analyze",
    description: "Visualize the result, inspect diagrams, save your analysis, and iterate on your design.",
    color: "#22c55e",
  },
];

const recentTopics = [
  { subject: "Strength of Materials", title: "Normal Stress and Strain", type: "Topic", accent: "#f59e0b" },
  { subject: "Statics", title: "Equilibrium of Rigid Bodies", type: "Topic", accent: "#3b82f6" },
  { subject: "Fluid Mechanics", title: "Bernoulli Equation", type: "Formula", accent: "#06b6d4" },
  { subject: "Strength of Materials", title: "Shear Stress in Beams", type: "Example", accent: "#f59e0b" },
];

// ─── Component ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <SubjectsSection />
      <ToolsSection />
      <WorkflowSection />
      <RecentSection />
    </div>
  );
}

// ─── Hero ───────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section
      className="grid-bg"
      style={{
        padding: "80px 24px 100px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Radial glow at top center */}
      <div
        style={{
          position: "absolute",
          top: -120,
          left: "50%",
          transform: "translateX(-50%)",
          width: 700,
          height: 400,
          background:
            "radial-gradient(ellipse at center, rgba(59,130,246,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 64,
            alignItems: "center",
          }}
        >
          {/* Left: Text */}
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                backgroundColor: "rgba(59,130,246,0.08)",
                border: "1px solid rgba(59,130,246,0.2)",
                borderRadius: 20,
                padding: "5px 14px",
                marginBottom: 28,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#3b82f6" }} />
              <span style={{ fontSize: 12, fontWeight: 500, color: "#3b82f6", letterSpacing: "0.04em" }}>
                MECHANICAL ENGINEERING PLATFORM
              </span>
            </div>

            <h1
              style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontSize: "clamp(2.4rem, 5vw, 3.6rem)",
                fontWeight: 700,
                color: "#f1f5f9",
                lineHeight: 1.12,
                letterSpacing: "-0.035em",
                margin: "0 0 20px",
              }}
            >
              Learn.{" "}
              <span style={{ color: "#3b82f6" }}>Calculate.</span>
              <br />
              Analyze.
            </h1>

            <p
              style={{
                fontSize: 18,
                color: "#64748b",
                lineHeight: 1.7,
                margin: "0 0 36px",
                maxWidth: 460,
              }}
            >
              A practical digital workspace for Mechanical Engineering students.
              Study concepts, run calculations, and visualize results — all in one place.
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link
                to="/learn"
                style={{
                  padding: "12px 28px",
                  backgroundColor: "#3b82f6",
                  color: "#fff",
                  borderRadius: 8,
                  fontSize: 15,
                  fontWeight: 600,
                  textDecoration: "none",
                  letterSpacing: "-0.01em",
                  transition: "background-color 0.15s ease",
                }}
              >
                Explore Courses
              </Link>
              <Link
                to="/tools"
                style={{
                  padding: "12px 28px",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#e2e8f0",
                  borderRadius: 8,
                  fontSize: 15,
                  fontWeight: 500,
                  textDecoration: "none",
                  letterSpacing: "-0.01em",
                }}
              >
                Open Engineering Tools
              </Link>
            </div>

            {/* Stats row */}
            <div style={{ display: "flex", gap: 32, marginTop: 48 }}>
              {[
                { value: "5", label: "Calculators" },
                { value: "73+", label: "Topics" },
                { value: "3", label: "Courses" },
              ].map((s) => (
                <div key={s.label}>
                  <div
                    style={{
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: 22,
                      fontWeight: 600,
                      color: "#e2e8f0",
                    }}
                  >
                    {s.value}
                  </div>
                  <div style={{ fontSize: 12, color: "#334155", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Preview card */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <HeroPreviewCard />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroPreviewCard() {
  return (
    <div
      className="glow-blue"
      style={{
        backgroundColor: "#0c1528",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        padding: 24,
        width: "100%",
        maxWidth: 400,
      }}
    >
      {/* Card header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", color: "#334155", letterSpacing: "0.06em", marginBottom: 4 }}>
            STRESS ANALYSIS
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>Mohr's Circle</div>
        </div>
        <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#22c55e" }} />
      </div>

      {/* Input preview */}
      <div
        style={{
          backgroundColor: "#060b18",
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.05)",
          padding: 14,
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: 11, color: "#334155", fontFamily: "JetBrains Mono, monospace", marginBottom: 10 }}>
          INPUT PARAMETERS
        </div>
        {[
          { label: "σx", value: "250", unit: "MPa" },
          { label: "σy", value: "−100", unit: "MPa" },
          { label: "τxy", value: "75", unit: "MPa" },
        ].map((r) => (
          <div
            key={r.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "5px 0",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13, color: "#06b6d4" }}>
              {r.label}
            </span>
            <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13, color: "#e2e8f0" }}>
              {r.value}{" "}
              <span style={{ color: "#334155", fontSize: 11 }}>{r.unit}</span>
            </span>
          </div>
        ))}
      </div>

      {/* Mini Mohr's Circle SVG */}
      <MiniMohrsCircle />

      {/* Results */}
      <div
        style={{
          marginTop: 16,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
        }}
      >
        {[
          { label: "σ₁", value: "277.8", unit: "MPa", color: "#22c55e" },
          { label: "σ₂", value: "−127.8", unit: "MPa", color: "#ef4444" },
          { label: "τmax", value: "202.8", unit: "MPa", color: "#f59e0b" },
          { label: "θp", value: "16.8", unit: "°", color: "#06b6d4" },
        ].map((r) => (
          <div
            key={r.label}
            style={{
              backgroundColor: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: 6,
              padding: "8px 10px",
            }}
          >
            <div style={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", color: "#334155" }}>
              {r.label}
            </div>
            <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 14, fontWeight: 600, color: r.color }}>
              {r.value}{" "}
              <span style={{ fontSize: 10, color: "#334155" }}>{r.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniMohrsCircle() {
  const W = 248, H = 140;
  const cx = W / 2, cy = H / 2;
  const R = 55;
  const sigmaX = 250, sigmaY = -100, tauXY = 75;
  const sigmaC = (sigmaX + sigmaY) / 2;
  const actualR = Math.sqrt(Math.pow((sigmaX - sigmaY) / 2, 2) + Math.pow(tauXY, 2));
  const scale = R / actualR;
  const ptA = { x: cx + (sigmaX - sigmaC) * scale, y: cy - tauXY * scale };
  const ptB = { x: cx + (sigmaY - sigmaC) * scale, y: cy + tauXY * scale };

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      <rect width={W} height={H} fill="#060b18" rx="6" />
      {/* σ axis */}
      <line x1={10} y1={cy} x2={W - 10} y2={cy} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      {/* τ axis */}
      <line x1={cx} y1={10} x2={cx} y2={H - 10} stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="3 3" />
      {/* Circle */}
      <circle cx={cx} cy={cy} r={R} fill="rgba(59,130,246,0.06)" stroke="#3b82f6" strokeWidth="1.5" />
      {/* Diameter */}
      <line x1={ptA.x} y1={ptA.y} x2={ptB.x} y2={ptB.y} stroke="rgba(59,130,246,0.3)" strokeWidth="1" strokeDasharray="3 3" />
      {/* Point A */}
      <circle cx={ptA.x} cy={ptA.y} r={3.5} fill="#06b6d4" />
      {/* Point B */}
      <circle cx={ptB.x} cy={ptB.y} r={3.5} fill="#f59e0b" />
      {/* σ1 marker */}
      <circle cx={cx + R} cy={cy} r={3} fill="none" stroke="#22c55e" strokeWidth="1.5" />
      {/* σ2 marker */}
      <circle cx={cx - R} cy={cy} r={3} fill="none" stroke="#ef4444" strokeWidth="1.5" />
      {/* Labels */}
      <text x={W - 18} y={cy - 6} fill="#334155" fontSize="10" fontFamily="JetBrains Mono">σ</text>
      <text x={cx + 5} y={18} fill="#334155" fontSize="10" fontFamily="JetBrains Mono">τ</text>
      <text x={ptA.x + 6} y={ptA.y - 5} fill="#06b6d4" fontSize="9" fontFamily="JetBrains Mono">A</text>
      <text x={ptB.x + 6} y={ptB.y + 12} fill="#f59e0b" fontSize="9" fontFamily="JetBrains Mono">B</text>
    </svg>
  );
}

// ─── Subjects ──────────────────────────────────────────────────────────────────

function SubjectsSection() {
  return (
    <section style={{ padding: "80px 24px", backgroundColor: "#0c1528" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <SectionHeader
          label="COURSES"
          title="Engineering Subjects"
          description="Start with core Mechanical Engineering disciplines. Each subject contains structured chapters, worked examples, and integrated calculators."
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {subjects.map((s) => (
            <Link key={s.id} to="/learn" style={{ textDecoration: "none" }}>
              <div
                style={{
                  backgroundColor: "#060b18",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderTop: `2px solid ${s.accent}`,
                  borderRadius: 10,
                  padding: 28,
                  height: "100%",
                  cursor: "pointer",
                  transition: "border-color 0.2s ease, transform 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = s.accent;
                  el.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = "rgba(255,255,255,0.06)";
                  el.style.transform = "translateY(0)";
                  el.style.borderTopColor = s.accent;
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 8,
                    backgroundColor: `${s.accent}15`,
                    border: `1px solid ${s.accent}30`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: s.accent,
                    marginBottom: 18,
                  }}
                >
                  {s.icon}
                </div>

                <h3
                  style={{
                    fontFamily: "DM Sans, system-ui, sans-serif",
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#e2e8f0",
                    margin: "0 0 10px",
                  }}
                >
                  {s.title}
                </h3>

                <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.65, margin: "0 0 20px" }}>
                  {s.description}
                </p>

                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
                  {s.tags.map((t) => (
                    <span
                      key={t}
                      style={{
                        fontSize: 11,
                        padding: "3px 8px",
                        borderRadius: 4,
                        backgroundColor: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        color: "#475569",
                        fontFamily: "JetBrains Mono, monospace",
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 16,
                    paddingTop: 16,
                    borderTop: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <span style={{ fontSize: 12, color: "#334155" }}>
                    <span style={{ color: "#64748b", fontWeight: 600 }}>{s.chapters}</span> chapters
                  </span>
                  <span style={{ fontSize: 12, color: "#334155" }}>
                    <span style={{ color: "#64748b", fontWeight: 600 }}>{s.topics}</span> topics
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Tools ─────────────────────────────────────────────────────────────────────

function ToolsSection() {
  return (
    <section style={{ padding: "80px 24px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <SectionHeader
          label="ENGINEERING TOOLS"
          title="Featured Calculators"
          description="Interactive engineering calculators with real-time results, unit handling, and visual outputs."
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {tools.slice(0, 3).map((t) => (
            <ToolCard key={t.id} tool={t} />
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginTop: 16 }}>
          {tools.slice(3).map((t) => (
            <ToolCard key={t.id} tool={t} />
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 36 }}>
          <Link
            to="/tools"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 24px",
              backgroundColor: "rgba(59,130,246,0.1)",
              border: "1px solid rgba(59,130,246,0.25)",
              color: "#3b82f6",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            View All Engineering Tools →
          </Link>
        </div>
      </div>
    </section>
  );
}

function ToolCard({ tool }: { tool: (typeof tools)[0] }) {
  return (
    <Link to={tool.href} style={{ textDecoration: "none" }}>
      <div
        style={{
          backgroundColor: "#0c1528",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 10,
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          transition: "border-color 0.2s ease",
          cursor: "pointer",
          height: "100%",
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = "rgba(59,130,246,0.3)")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.06)")}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                fontFamily: "JetBrains Mono, monospace",
                padding: "2px 7px",
                borderRadius: 4,
                backgroundColor: `${tool.badgeColor}15`,
                color: tool.badgeColor,
                border: `1px solid ${tool.badgeColor}30`,
                letterSpacing: "0.04em",
              }}
            >
              {tool.badge}
            </span>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2">
            <path d="M7 17L17 7M17 7H7M17 7v10" />
          </svg>
        </div>

        <div>
          <h3 style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 16, fontWeight: 600, color: "#e2e8f0", margin: "0 0 4px" }}>
            {tool.title}
          </h3>
          <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "#06b6d4", marginBottom: 8 }}>
            {tool.subtitle}
          </div>
          <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.6, margin: 0 }}>{tool.description}</p>
        </div>
      </div>
    </Link>
  );
}

// ─── Workflow ──────────────────────────────────────────────────────────────────

function WorkflowSection() {
  return (
    <section style={{ padding: "80px 24px", backgroundColor: "#0c1528" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <SectionHeader
          label="HOW IT WORKS"
          title="One Integrated Workflow"
          description="MechLab connects educational content directly to practical engineering calculations. Every topic feeds into a calculator that feeds into visualization."
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 0,
            position: "relative",
          }}
        >
          {/* Connector line */}
          <div
            style={{
              position: "absolute",
              top: 28,
              left: "12.5%",
              right: "12.5%",
              height: 1,
              background: "linear-gradient(90deg, #3b82f6, #a78bfa, #06b6d4, #22c55e)",
              opacity: 0.3,
              zIndex: 0,
            }}
          />

          {workflow.map((w, i) => (
            <div
              key={i}
              style={{
                position: "relative",
                zIndex: 1,
                padding: "0 24px 0",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  backgroundColor: `${w.color}12`,
                  border: `2px solid ${w.color}40`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <span
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: 15,
                    fontWeight: 600,
                    color: w.color,
                  }}
                >
                  {w.step}
                </span>
              </div>

              <h3
                style={{
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  fontSize: 18,
                  fontWeight: 700,
                  color: w.color,
                  margin: "0 0 12px",
                  letterSpacing: "-0.02em",
                }}
              >
                {w.title}
              </h3>

              <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.65, margin: 0 }}>
                {w.description}
              </p>
            </div>
          ))}
        </div>

        {/* Full workflow label */}
        <div
          style={{
            marginTop: 56,
            padding: "18px 28px",
            backgroundColor: "#060b18",
            border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          {["Learn a concept", "Understand the formula", "Study an example", "Enter parameters", "Compute result", "Visualize", "Save analysis"].map(
            (step, i, arr) => (
              <span key={i} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ fontSize: 13, color: "#334155" }}>{step}</span>
                {i < arr.length - 1 && (
                  <span style={{ color: "#1e3a5f", fontSize: 12 }}>→</span>
                )}
              </span>
            )
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Recent ────────────────────────────────────────────────────────────────────

function RecentSection() {
  return (
    <section style={{ padding: "80px 24px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 36 }}>
          <SectionHeader
            label="RECENT CONTENT"
            title="Recently Added"
            description=""
            compact
          />
          <Link to="/learn" style={{ fontSize: 13, color: "#3b82f6", textDecoration: "none" }}>
            View all →
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {recentTopics.map((t, i) => (
            <div
              key={i}
              style={{
                backgroundColor: "#0c1528",
                border: "1px solid rgba(255,255,255,0.06)",
                borderLeft: `3px solid ${t.accent}`,
                borderRadius: "0 8px 8px 0",
                padding: "16px 18px",
                cursor: "pointer",
                transition: "background-color 0.15s ease",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.backgroundColor = "#111e35")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.backgroundColor = "#0c1528")}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  fontFamily: "JetBrains Mono, monospace",
                  color: t.accent,
                  letterSpacing: "0.06em",
                  marginBottom: 8,
                }}
              >
                {t.type.toUpperCase()}
              </div>
              <div style={{ fontSize: 14, fontWeight: 500, color: "#e2e8f0", lineHeight: 1.4, marginBottom: 8 }}>
                {t.title}
              </div>
              <div style={{ fontSize: 12, color: "#334155" }}>{t.subject}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function SectionHeader({
  label,
  title,
  description,
  compact = false,
}: {
  label: string;
  title: string;
  description: string;
  compact?: boolean;
}) {
  return (
    <div style={{ marginBottom: compact ? 0 : 48 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.1em",
          color: "#3b82f6",
          fontFamily: "JetBrains Mono, monospace",
          marginBottom: 12,
        }}
      >
        {label}
      </div>
      <h2
        style={{
          fontFamily: "DM Sans, system-ui, sans-serif",
          fontSize: compact ? 24 : "clamp(1.5rem, 3vw, 2rem)",
          fontWeight: 700,
          color: "#f1f5f9",
          margin: "0 0 12px",
          letterSpacing: "-0.03em",
        }}
      >
        {title}
      </h2>
      {description && (
        <p style={{ fontSize: 15, color: "#475569", lineHeight: 1.7, margin: 0, maxWidth: 560 }}>
          {description}
        </p>
      )}
    </div>
  );
}
