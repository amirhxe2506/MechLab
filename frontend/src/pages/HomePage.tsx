import { Link } from "react-router-dom";
import { useState } from "react";
import { AnimatedArrow } from "../components/AnimatedArrow";
import heroTurbine from "../assets/images/hero-turbine.png";

// ─── Data ──────────────────────────────────────────────────────────────────────

const subjects = [
  {
    id: "statics",

    title: "Statics",

    description:
      "Equilibrium of forces, moments, and structures. Free body diagrams, trusses, and support reactions.",

    topics: 23,

    chapters: 5,

    accent: "var(--color-primary)",

    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
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

    accent: "var(--color-accent)",

    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
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

    accent: "var(--color-primary)",

    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M12 2c0 0-6 6.5-6 11a6 6 0 0012 0c0-4.5-6-11-6-11z" />
        <path d="M8 15a4 4 0 008 0" />
      </svg>
    ),

    tags: ["Bernoulli", "Reynolds", "Pipe Flow", "Pressure"],
  },
  {
    id: "mechanical-design",
    title: "Mechanical Design",
    description: "Design of mechanical systems, machine elements, fatigue analysis, and material selection.",
    topics: 25,
    chapters: 6,
    accent: "var(--color-accent)",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    tags: ["Gears", "Fatigue", "Shafts", "Bearings"],
  },
]

const tools = [
  {
    id: "stress-strain",

    href: "/tools/stress-strain",

    title: "Stress & Strain",

    subtitle: "σ = F / A  ·  ε = σ / E",

    description:
      "Calculate normal stress, strain, and axial deformation for structural members.",

    badge: "Strength of Materials",

    badgeColor: "var(--color-accent)",
  },

  {
    id: "mohrs-circle",

    href: "/tools/mohrs-circle",

    title: "Mohr's Circle",

    subtitle: "σ₁,₂ = σC ± R",

    description:
      "Find principal stresses, max shear stress, and principal angles from a 2D stress state.",

    badge: "Strength of Materials",

    badgeColor: "var(--color-accent)",
  },

  {
    id: "reynolds",

    href: "/tools/reynolds",

    title: "Reynolds Number",

    subtitle: "Re = ρvD / μ",

    description:
      "Classify pipe flow as laminar, transitional, or turbulent. Fluid properties included.",

    badge: "Fluid Mechanics",

    badgeColor: "var(--color-primary)",
  },

  {
    id: "vibration",

    href: "/tools/vibration",

    title: "Vibration Analysis",

    subtitle: "mẍ + cẋ + kx = 0",

    description:
      "SDOF system response with time-history chart. Natural frequency, damping ratio, and classification.",

    badge: "Mechanical Design",

    badgeColor: "var(--color-primary)",
  },

  {
    id: "beam",

    href: "/tools/beam",

    title: "Beam Analysis",

    subtitle: "V(x), M(x) diagrams",

    description:
      "Shear force and bending moment diagrams for simply supported and cantilever beams.",

    badge: "Strength of Materials",

    badgeColor: "var(--color-accent)",
  },

  {
    id: "bernoulli",

    href: "/tools/bernoulli",

    title: "Bernoulli Flow",

    subtitle: "P₁ + ½ρv₁² + ρgz₁ = Const.",

    description:
      "Solve streamline energy equation for pressure, velocity, or elevation with head breakdown.",

    badge: "Fluid Mechanics",

    badgeColor: "var(--color-primary)",
  },
]

const workflow = [
  {
    step: "01",

    title: "Learn",

    description:
      "Study the concept, review governing equations, understand each variable and its units, and examine the mathematical relationships and assumptions.",

    color: "var(--color-primary)",
  },

  {
    step: "02",

    title: "Calculate",

    description:
      "Enter your parameters into the interactive calculator and compute the result instantly with full unit handling.",

    color: "var(--color-primary)",
  },

  {
    step: "03",

    title: "Analyze",

    description:
      "Visualize the result, inspect diagrams, save your analysis, and iterate on your design.",

    color: "var(--color-success)",
  },
]

const videos = [
  {
    title: "Introduction to Statics",
    subtitle: "Lecturer: TBD",
  },
  {
    title: "Shear and Moment Diagrams",
    subtitle: "Lecturer: TBD",
  },
  {
    title: "Understanding Mohr's Circle",
    subtitle: "Lecturer: TBD",
  },
]

const recentTopics = [
  {
    subject: "Strength of Materials",
    title: "Normal Stress and Strain",
    type: "Topic",
    accent: "var(--color-accent)",
  },

  {
    subject: "Statics",
    title: "Equilibrium of Rigid Bodies",
    type: "Topic",
    accent: "var(--color-primary)",
  },

  {
    subject: "Fluid Mechanics",
    title: "Bernoulli Equation",
    type: "Formula",
    accent: "var(--color-primary)",
  },

  {
    subject: "Strength of Materials",
    title: "Shear Stress in Beams",
    type: "Example",
    accent: "var(--color-accent)",
  },
]

// ─── Component ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <WorkflowSection />
      <SubjectsSection />
      <ToolsSection />
      <VideoPreviewSection />
      <RecentSection />
    </div>
  )
}

// ─── Hero ───────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section
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
            "radial-gradient(ellipse at center, rgba(47, 93, 124, 0.12) 0%, transparent 70%)",

          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 64,
            alignItems: "center",
          }}
        >
          {/* Top Section: Split Layout */}
          <div className="flex flex-col md:flex-row gap-12 w-full pt-5 pb-5" style={{ alignItems: "center" }}>
            
            {/* Left Column: Text & Stats */}
            <div className="flex flex-col gap-10 w-full md:w-[50%]">
              
              {/* Title Section */}
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--color-accent)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: 24,
                    fontFamily: "Inter, system-ui, sans-serif"
                  }}
                >
                  MECHANICAL ENGINEERING
                </div>

                <h1
                  style={{
                    fontFamily: "Inter, system-ui, sans-serif",
                    fontSize: "clamp(3rem, 5vw, 4.5rem)",
                    fontWeight: 800,
                    color: "var(--color-foreground)",
                    lineHeight: 1.1,
                    margin: "0 0 24px",
                    letterSpacing: "-0.02em"
                  }}
                >
                  Precision tools for<br />
                  <span style={{ color: "var(--color-primary)" }}>
                    mechanical engineering students.
                  </span>
                </h1>

                <p
                  style={{
                    fontSize: 18,
                    color: "var(--color-muted-foreground)",
                    lineHeight: 1.6,
                    margin: "0 0 40px",
                    maxWidth: 480,
                    fontFamily: "Inter, system-ui, sans-serif",
                  }}
                >
                  Study core mechanical engineering topics, work through interactive calculators, and visualize the results — all in one place.
                </p>

                {/* Mobile-only Turbine Image */}
                <div className="w-full flex md:hidden justify-center my-10 px-6">
                  <img 
                    src={heroTurbine} 
                    alt="Mechanical turbine cutaway" 
                    style={{
                      width: "100%",
                      height: "auto",
                      maxWidth: 550,
                      display: "block",
                      objectFit: "contain"
                    }}
                  />
                </div>

                <Link
                  to="/tools"
                  className="btn-primary btn-with-arrow"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "16px 32px",
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-primary-foreground)",
                    borderRadius: 8,
                    fontSize: 16,
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  <span>Explore Tools</span>
                  <AnimatedArrow />
                </Link>
              </div>

              {/* Stats Row */}
              <div className="flex flex-wrap gap-6 md:gap-12" style={{ borderTop: "1px solid var(--line-subtle)", paddingTop: 32 }}>
                {[
                  { value: `${tools.length}+`, label: "Engineering Calculators" },
                  { value: `${subjects.length}`, label: "Subject Areas", color: "var(--color-primary)" },
                  { value: `${subjects.reduce((sum, s) => sum + s.topics, 0)}+`, label: "Topics Covered" },
                ].map((s) => (
                  <div key={s.label}>
                    <div
                      style={{
                        fontFamily: "Inter, system-ui, sans-serif",
                        fontSize: 28,
                        fontWeight: 700,
                        color: s.color || "var(--color-foreground)",
                        marginBottom: 8,
                      }}
                    >
                      {s.value}
                    </div>
                    <div style={{ 
                      fontSize: 13, 
                      color: "var(--color-muted-foreground)", 
                      fontFamily: "Inter, system-ui, sans-serif",
                    }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Turbine Image (Desktop Only) */}
            <div 
              className="hidden md:flex w-full md:w-[50%] justify-end relative" 
              style={{ alignItems: "flex-start", marginTop: "-60px" }}
            >
              <img 
                src={heroTurbine} 
                alt="Mechanical turbine cutaway" 
                style={{
                  width: "125%", // Scale beyond the column width to fill the right side
                  height: "auto",
                  maxWidth: 1100,
                  display: "block",
                  objectFit: "contain",
                  transform: "translateY(-40px) translateX(5%)"
                }}
              />
            </div>
            
          </div>

          {/* Bottom Section: Preview Cards Deck */}
          <div style={{ width: "100%" }}>
            <PreviewCardDeck />
          </div>
        </div>
      </div>
    </section>
  )
}

function HeroPreviewCard() {
  return (
    <div
      className="glow-blue w-full max-w-sm shrink-0"
      style={{
        backgroundColor: "var(--surface-strong)",
        border: "1px solid var(--line-card)",
        borderRadius: 12,
        padding: 24,
        height: 480,
        display: "flex",
        flexDirection: "column"
      }}
    >
      {/* Card header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontFamily: "JetBrains Mono, monospace",
              color: "var(--color-muted-foreground)",
              letterSpacing: "0.06em",
              marginBottom: 4,
            }}
          >
            STRESS ANALYSIS
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-foreground)" }}>
            Mohr's Circle
          </div>
        </div>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: "var(--color-success)",
          }}
        />
      </div>

      {/* Input preview */}
      <div
        style={{
          backgroundColor: "var(--color-background)",

          borderRadius: 8,

          border: "1px solid var(--line-subtle)",

          padding: 14,

          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: "var(--color-muted-foreground)",
            fontFamily: "JetBrains Mono, monospace",
            marginBottom: 10,
          }}
        >
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

              borderBottom: "1px solid var(--line-subtle)",
            }}
          >
            <span
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 13,
                color: "var(--color-primary)",
              }}
            >
              {r.label}
            </span>
            <span
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 13,
                color: "var(--color-foreground)",
              }}
            >
              {r.value}{" "}
              <span style={{ color: "var(--color-muted-foreground)", fontSize: 11 }}>{r.unit}</span>
            </span>
          </div>
        ))}
      </div>

      {/* Mini Mohr's Circle SVG */}
      <MiniMohrsCircle />

      {/* Results */}
      <div
        style={{
          marginTop: "auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
        }}
      >
        {[
          { label: "σ₁", value: "277.8", unit: "MPa", color: "var(--color-success)" },

          { label: "σ₂", value: "−127.8", unit: "MPa", color: "var(--color-danger)" },

          { label: "τmax", value: "202.8", unit: "MPa", color: "var(--color-accent)" },

          { label: "θp", value: "16.8", unit: "°", color: "var(--color-primary)" },
        ].map((r) => (
          <div
            key={r.label}
            style={{
              backgroundColor: "var(--primary-soft)",

              border: "1px solid var(--line-subtle)",

              borderRadius: 6,

              padding: "8px 10px",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontFamily: "JetBrains Mono, monospace",
                color: "var(--color-muted-foreground)",
              }}
            >
              {r.label}
            </div>
            <div
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 14,
                fontWeight: 600,
                color: r.color,
              }}
            >
              {r.value}{" "}
              <span style={{ fontSize: 10, color: "var(--color-muted-foreground)" }}>{r.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MiniMohrsCircle() {
  const W = 248,
    H = 140

  const cx = W / 2,
    cy = H / 2

  const R = 55

  const sigmaX = 250,
    sigmaY = -100,
    tauXY = 75

  const sigmaC = (sigmaX + sigmaY) / 2

  const actualR = Math.sqrt(
    Math.pow((sigmaX - sigmaY) / 2, 2) + Math.pow(tauXY, 2),
  )

  const scale = R / actualR

  const ptA = { x: cx + (sigmaX - sigmaC) * scale, y: cy - tauXY * scale }

  const ptB = { x: cx + (sigmaY - sigmaC) * scale, y: cy + tauXY * scale }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-auto"
      style={{ display: "block", maxWidth: "100%" }}
    >
      <rect width={W} height={H} fill="var(--color-background)" rx="6" />
      {/* σ axis */}
      <line
        x1={10}
        y1={cy}
        x2={W - 10}
        y2={cy}
        stroke="var(--line-subtle)"
        strokeWidth="1"
      />
      {/* τ axis */}
      <line
        x1={cx}
        y1={10}
        x2={cx}
        y2={H - 10}
        stroke="var(--line-subtle)"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      {/* Circle */}
      <circle
        cx={cx}
        cy={cy}
        r={R}
        fill="rgba(47, 93, 124, 0.06)"
        stroke="var(--color-primary)"
        strokeWidth="1.5"
      />
      {/* Diameter */}
      <line
        x1={ptA.x}
        y1={ptA.y}
        x2={ptB.x}
        y2={ptB.y}
        stroke="rgba(47, 93, 124, 0.30)"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      {/* Point A */}
      <circle cx={ptA.x} cy={ptA.y} r={3.5} fill="var(--color-primary)" />
      {/* Point B */}
      <circle cx={ptB.x} cy={ptB.y} r={3.5} fill="var(--color-accent)" />
      {/* σ1 marker */}
      <circle
        cx={cx + R}
        cy={cy}
        r={3}
        fill="none"
        stroke="var(--color-success)"
        strokeWidth="1.5"
      />
      {/* σ2 marker */}
      <circle
        cx={cx - R}
        cy={cy}
        r={3}
        fill="none"
        stroke="var(--color-danger)"
        strokeWidth="1.5"
      />
      {/* Labels */}
      <text
        x={W - 18}
        y={cy - 6}
        fill="var(--color-muted-foreground)"
        fontSize="10"
        fontFamily="JetBrains Mono"
      >
        σ
      </text>
      <text
        x={cx + 5}
        y={18}
        fill="var(--color-muted-foreground)"
        fontSize="10"
        fontFamily="JetBrains Mono"
      >
        τ
      </text>
      <text
        x={ptA.x + 6}
        y={ptA.y - 5}
        fill="var(--color-primary)"
        fontSize="9"
        fontFamily="JetBrains Mono"
      >
        A
      </text>
      <text
        x={ptB.x + 6}
        y={ptB.y + 12}
        fill="var(--color-accent)"
        fontSize="9"
        fontFamily="JetBrains Mono"
      >
        B
      </text>
    </svg>
  )
}

// ─── Subjects ──────────────────────────────────────────────────────────────────

function SubjectsSection() {
  return (
    <section style={{ padding: "80px 24px", backgroundColor: "var(--color-background)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "end", marginBottom: 56 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-accent)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>
              SUBJECT AREAS
            </div>
            <h2 style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "clamp(2rem, 3vw, 2.5rem)", fontWeight: 700, color: "var(--color-foreground)", lineHeight: 1.2, margin: 0 }}>
              Core Subjects,<br />Structured for Study
            </h2>
          </div>
          <div>
            <p style={{ fontSize: 15, color: "var(--color-muted-foreground)", lineHeight: 1.6, margin: "0 0 24px", maxWidth: 400 }}>
              Start with core Mechanical Engineering disciplines. Each subject contains structured chapters, worked examples, and integrated calculators.
            </p>
            <Link
              to="/learn"
              className="btn-secondary btn-with-arrow"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "10px 24px",
                backgroundColor: "transparent",
                border: "1px solid var(--primary-line)",
                color: "var(--color-primary)",
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              <span>View All Subjects</span>
              <AnimatedArrow />
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {subjects.map((s) => (
            <Link key={s.id} to="/learn" style={{ textDecoration: "none" }}>
              <div
                style={{
                  backgroundColor: "var(--surface-strong)",
                  border: "1px solid var(--line-subtle)",
                  borderRadius: 10,
                  padding: 28,
                  height: "100%",

                  cursor: "pointer",

                  transition: "border-color 0.2s ease, transform 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLDivElement

                  el.style.borderColor = s.accent

                  el.style.transform = "translateY(-2px)"
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLDivElement

                  el.style.borderColor = "var(--line-subtle)"

                  el.style.transform = "translateY(0)"
                }}
              >
                <div
                  style={{
                    width: 44,

                    height: 44,

                    borderRadius: 8,

                    backgroundColor: `color-mix(in srgb, ${s.accent} 10%, transparent)`,

                    border: `1px solid color-mix(in srgb, ${s.accent} 22%, transparent)`,

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

                    color: "var(--color-foreground)",

                    margin: "0 0 10px",
                  }}
                >
                  {s.title}
                </h3>

                <p
                  style={{
                    fontSize: 14,
                    color: "var(--color-muted-foreground)",
                    lineHeight: 1.65,
                    margin: "0 0 20px",
                  }}
                >
                  {s.description}
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    flexWrap: "wrap",
                    marginBottom: 20,
                  }}
                >
                  {s.tags.map((t) => (
                    <span
                      key={t}
                      style={{
                        fontSize: 11,

                        padding: "3px 8px",

                        borderRadius: 4,

                        backgroundColor: "var(--line-subtle)",

                        border: "1px solid var(--line-card)",

                        color: "var(--color-muted-foreground)",

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

                    borderTop: "1px solid var(--line-subtle)",
                  }}
                >
                  <span style={{ fontSize: 12, color: "var(--color-muted-foreground)" }}>
                    <span style={{ color: "var(--color-muted-foreground)", fontWeight: 600 }}>
                      {s.chapters}
                    </span>{" "}
                    chapters
                  </span>
                  <span style={{ fontSize: 12, color: "var(--color-muted-foreground)" }}>
                    <span style={{ color: "var(--color-muted-foreground)", fontWeight: 600 }}>
                      {s.topics}
                    </span>{" "}
                    topics
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
          }}
        >
          {tools.slice(0, 3).map((t) => (
            <ToolCard key={t.id} tool={t} />
          ))}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 16,
            marginTop: 16,
          }}
        >
          {tools.slice(3).map((t) => (
            <ToolCard key={t.id} tool={t} />
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 36 }}>
          <Link
            to="/tools"
            className="btn-secondary btn-with-arrow"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 24px",
              backgroundColor: "var(--primary-soft)",
              border: "1px solid var(--primary-line)",
              color: "var(--color-primary)",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            <span>View All Engineering Tools</span>
            <AnimatedArrow />
          </Link>
        </div>
      </div>
    </section>
  )
}

function ToolCard({ tool }: { tool: typeof tools[0] }) {
  return (
    <Link to={tool.href} style={{ textDecoration: "none" }}>
      <div
        style={{
          backgroundColor: "var(--surface-strong)",

          border: "1px solid var(--line-card)",

          borderRadius: 10,

          padding: 24,

          display: "flex",

          flexDirection: "column",

          gap: 12,

          transition: "border-color 0.2s ease",

          cursor: "pointer",

          height: "100%",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLDivElement).style.borderColor =
            "var(--primary-line)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLDivElement).style.borderColor =
            "var(--line-subtle)")
        }
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <div>
            <span
              style={{
                fontSize: 10,

                fontWeight: 600,

                fontFamily: "JetBrains Mono, monospace",

                padding: "2px 7px",

                borderRadius: 4,

                backgroundColor: `color-mix(in srgb, ${tool.badgeColor} 10%, transparent)`,

                color: tool.badgeColor,

                border: `1px solid color-mix(in srgb, ${tool.badgeColor} 22%, transparent)`,

                letterSpacing: "0.04em",
              }}
            >
              {tool.badge}
            </span>
          </div>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-muted-foreground)"
            strokeWidth="2"
          >
            <path d="M7 17L17 7M17 7H7M17 7v10" />
          </svg>
        </div>

        <div>
          <h3
            style={{
              fontFamily: "DM Sans, system-ui, sans-serif",
              fontSize: 16,
              fontWeight: 600,
              color: "var(--color-foreground)",
              margin: "0 0 4px",
            }}
          >
            {tool.title}
          </h3>
          <div
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 12,
              color: "var(--color-primary)",
              marginBottom: 8,
            }}
          >
            {tool.subtitle}
          </div>
          <p
            style={{
              fontSize: 13,
              color: "var(--color-muted-foreground)",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {tool.description}
          </p>
        </div>
      </div>
    </Link>
  )
}

// ─── Workflow ──────────────────────────────────────────────────────────────────

function WorkflowSection() {
  return (
    <section style={{ padding: "80px 24px", backgroundColor: "var(--color-background)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <SectionHeader
          label="HOW IT WORKS"
          title="One Integrated Workflow"
          description="MechLab connects educational content directly to practical engineering calculations. Every topic feeds into a calculator that feeds into visualization."
        />

        <div
          style={{
            display: "grid",

            gridTemplateColumns: "repeat(3, 1fr)",

            gap: 0,

            position: "relative",
          }}
        >
          {/* Connector line */}
          <div
            style={{
              position: "absolute",

              top: 28,

              left: "16.6%",

              right: "16.6%",

              height: 1,

              background:
                "linear-gradient(90deg, var(--color-primary), var(--color-primary), #22c55e)",

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

                  backgroundColor: `color-mix(in srgb, ${w.color} 10%, transparent)`,

                  border: `2px solid color-mix(in srgb, ${w.color} 28%, transparent)`,

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

              <p
                style={{
                  fontSize: 13,
                  color: "var(--color-muted-foreground)",
                  lineHeight: 1.65,
                  margin: 0,
                }}
              >
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

            backgroundColor: "var(--surface-strong)",

            border: "1px solid var(--line-subtle)",

            borderRadius: 8,

            display: "flex",

            alignItems: "center",

            justifyContent: "center",

            gap: 16,

            flexWrap: "wrap",
          }}
        >
          {[
            "Learn a concept",
            "Study the formula",
            "Enter parameters",
            "Compute result",
            "Visualize",
            "Save analysis",
          ].map((step, i, arr) => (
            <span
              key={i}
              style={{ display: "flex", alignItems: "center", gap: 16 }}
            >
              <span style={{ fontSize: 13, color: "var(--color-muted-foreground)" }}>{step}</span>
              {i < arr.length - 1 && (
                <span style={{ color: "var(--color-primary)", fontSize: 12 }}>→</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Videos ────────────────────────────────────────────────────────────────────

function VideoPreviewSection() {
  return (
    <section style={{ padding: "80px 24px", backgroundColor: "var(--color-background)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <SectionHeader
          label="VIDEO LIBRARY"
          title="Lectures & Archives"
          description="Access recorded lectures and practical demonstrations for core mechanical engineering subjects."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((v, i) => (
            <Link key={i} to="/videos" style={{ textDecoration: "none" }}>
              <div
                style={{
                  backgroundColor: "var(--surface-strong)",
                  border: "1px solid var(--line-card)",
                  borderRadius: 10,
                  overflow: "hidden",
                  transition: "border-color 0.2s ease",
                  cursor: "pointer",
                  height: "100%",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.borderColor =
                    "var(--primary-line)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.borderColor =
                    "var(--line-subtle)")
                }
              >
                <div 
                  className="w-full aspect-video flex items-center justify-center relative"
                  style={{ backgroundColor: "var(--surface-subtle)" }}
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--color-card)", border: "1px solid var(--line-card)", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--color-foreground)" style={{ marginLeft: 2 }}>
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                </div>
                <div style={{ padding: "20px 24px" }}>
                  <h3
                    style={{
                      fontFamily: "DM Sans, system-ui, sans-serif",
                      fontSize: 16,
                      fontWeight: 600,
                      color: "var(--color-foreground)",
                      margin: "0 0 6px",
                    }}
                  >
                    {v.title}
                  </h3>
                  <div style={{ fontSize: 13, color: "var(--color-muted-foreground)" }}>
                    {v.subtitle}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 36 }}>
          <Link
            to="/videos"
            className="btn-secondary btn-with-arrow"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 24px",
              backgroundColor: "transparent",
              border: "1px solid var(--primary-line)",
              color: "var(--color-primary)",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            <span>View All Videos</span>
            <AnimatedArrow />
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─── Recent ────────────────────────────────────────────────────────────────────

function RecentSection() {
  return (
    <section style={{ padding: "80px 24px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: 36,
          }}
        >
          <SectionHeader
            label="START HERE"
            title="Featured Topics"
            description=""
            compact
          />
          <Link
            to="/learn"
            className="btn-secondary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              height: 40,
              padding: "0 24px",
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              backgroundColor: "var(--line-subtle)",
              border: "1px solid var(--line-subtle)",
              color: "var(--color-foreground)",
              textDecoration: "none",
              marginTop: 16
            }}
          >
            Browse All Content
          </Link>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 12,
          }}
        >
          {recentTopics.map((t, i) => (
            <div
              key={i}
              style={{
                backgroundColor: "var(--surface-strong)",

                border: "1px solid var(--line-subtle)",

                borderLeft: `3px solid ${t.accent}`,

                borderRadius: "0 8px 8px 0",

                padding: "16px 18px",

                cursor: "pointer",

                transition: "background-color 0.15s ease",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLDivElement).style.backgroundColor =
                  "var(--surface-subtle)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLDivElement).style.backgroundColor =
                  "var(--surface-strong)")
              }
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
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: "var(--color-foreground)",
                  lineHeight: 1.4,
                  marginBottom: 8,
                }}
              >
                {t.title}
              </div>
              <div style={{ fontSize: 12, color: "var(--color-muted-foreground)" }}>{t.subject}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function SectionHeader({
  label,

  title,

  description,

  compact = false,
}: {
  label: string

  title: string

  description: string

  compact?: boolean
}) {
  return (
    <div style={{ marginBottom: compact ? 0 : 48 }}>
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: "var(--color-accent)",
          fontFamily: "Inter, system-ui, sans-serif",
          textTransform: "uppercase",
          marginBottom: 16,
        }}
      >
        {label}
      </div>
      <h2
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: compact ? 24 : "clamp(1.5rem, 3vw, 2rem)",
          fontWeight: 700,
          color: "var(--color-foreground)",
          margin: "0 0 12px",
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </h2>
      {description && (
        <p
          style={{
            fontSize: 15,
            color: "var(--color-muted-foreground)",
            lineHeight: 1.7,
            margin: 0,
            maxWidth: 560,
          }}
        >
          {description}
        </p>
      )}
    </div>
  )
}

function BeamPreviewCard() {
  return (
    <div
      className="w-full max-w-sm shrink-0"
      style={{
        backgroundColor: "var(--surface-strong)",
        border: "1px solid var(--line-card)",
        borderRadius: 12,
        padding: 24,
        height: 480,
        display: "flex",
        flexDirection: "column"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", color: "var(--color-muted-foreground)", letterSpacing: "0.06em", marginBottom: 4 }}>STRUCTURAL</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-foreground)" }}>Beam Calculator</div>
        </div>
        <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "var(--color-accent)" }} />
      </div>
      <div style={{ backgroundColor: "var(--color-background)", borderRadius: 8, border: "1px solid var(--line-subtle)", padding: 14, marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: "var(--color-muted-foreground)", fontFamily: "JetBrains Mono, monospace", marginBottom: 10 }}>PARAMETERS</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: "1px solid var(--line-subtle)" }}>
          <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13, color: "var(--color-primary)" }}>Length</span>
          <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13, color: "var(--color-foreground)" }}>10 <span style={{ color: "var(--color-muted-foreground)", fontSize: 11 }}>m</span></span>
        </div>
      </div>
      
      {/* Beam SVG */}
      <div style={{ flex: 1, borderRadius: 8, marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--color-background)", border: "1px solid var(--line-subtle)" }}>
        <svg viewBox="0 0 248 140" className="w-full h-auto" style={{ display: "block", maxWidth: "100%" }}>
          {/* Beam body */}
          <rect x="24" y="65" width="200" height="10" fill="rgba(47, 93, 124, 0.2)" stroke="var(--color-primary)" strokeWidth="2" rx="2" />
          
          {/* Left Pin Support */}
          <polygon points="34,75 24,95 44,95" fill="none" stroke="var(--color-muted-foreground)" strokeWidth="1.5" />
          <line x1="20" y1="95" x2="48" y2="95" stroke="var(--color-muted-foreground)" strokeWidth="2" />
          
          {/* Right Roller Support */}
          <polygon points="214,75 204,90 224,90" fill="none" stroke="var(--color-muted-foreground)" strokeWidth="1.5" />
          <circle cx="209" cy="93" r="2" fill="var(--color-muted-foreground)" />
          <circle cx="219" cy="93" r="2" fill="var(--color-muted-foreground)" />
          <line x1="200" y1="96" x2="228" y2="96" stroke="var(--color-muted-foreground)" strokeWidth="2" />
          
          {/* Point Load Arrow */}
          <line x1="124" y1="20" x2="124" y2="60" stroke="var(--color-accent)" strokeWidth="3" />
          <polygon points="124,65 118,55 130,55" fill="var(--color-accent)" />
          <text x="124" y="15" fill="var(--color-accent)" fontSize="12" fontWeight="bold" fontFamily="JetBrains Mono" textAnchor="middle">P = 50 kN</text>
          
          {/* Dimension Lines */}
          <line x1="34" y1="105" x2="34" y2="120" stroke="var(--line-subtle)" strokeWidth="1" />
          <line x1="124" y1="105" x2="124" y2="120" stroke="var(--line-subtle)" strokeWidth="1" />
          <line x1="214" y1="105" x2="214" y2="120" stroke="var(--line-subtle)" strokeWidth="1" />
          
          {/* Arrows for dimensions */}
          <line x1="34" y1="112" x2="124" y2="112" stroke="var(--color-muted-foreground)" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="124" y1="112" x2="214" y2="112" stroke="var(--color-muted-foreground)" strokeWidth="1" strokeDasharray="2 2" />
          
          <text x="79" y="125" fill="var(--color-muted-foreground)" fontSize="10" fontFamily="JetBrains Mono" textAnchor="middle">5m</text>
          <text x="169" y="125" fill="var(--color-muted-foreground)" fontSize="10" fontFamily="JetBrains Mono" textAnchor="middle">5m</text>
        </svg>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", backgroundColor: "rgba(47, 93, 124, 0.10)", border: "1px solid rgba(47, 93, 124, 0.20)", borderRadius: 6, padding: "10px 14px" }}>
        <span style={{ fontSize: 12, color: "var(--color-muted-foreground)" }}>Max Moment</span>
        <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13, fontWeight: 600, color: "var(--color-primary)" }}>125.0 kN·m</span>
      </div>
    </div>
  );
}

function VibrationPreviewCard() {
  return (
    <div
      className="w-full max-w-sm shrink-0"
      style={{
        backgroundColor: "var(--surface-strong)",
        border: "1px solid var(--line-card)",
        borderRadius: 12,
        padding: 24,
        height: 480,
        display: "flex",
        flexDirection: "column"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", color: "var(--color-muted-foreground)", letterSpacing: "0.06em", marginBottom: 4 }}>DYNAMICS</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-foreground)" }}>Vibration Analysis</div>
        </div>
        <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "var(--color-danger)" }} />
      </div>
      <div style={{ backgroundColor: "var(--color-background)", borderRadius: 8, border: "1px solid var(--line-subtle)", padding: 14, marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: "var(--color-muted-foreground)", fontFamily: "JetBrains Mono, monospace", marginBottom: 10 }}>PARAMETERS</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: "1px solid var(--line-subtle)" }}>
          <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13, color: "var(--color-primary)" }}>Mass (m)</span>
          <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13, color: "var(--color-foreground)" }}>50 <span style={{ color: "var(--color-muted-foreground)", fontSize: 11 }}>kg</span></span>
        </div>
      </div>
      
      {/* Vibration SVG */}
      <div style={{ flex: 1, borderRadius: 8, marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--color-background)", border: "1px solid var(--line-subtle)" }}>
        <svg viewBox="0 0 248 140" className="w-full h-auto" style={{ display: "block", maxWidth: "100%" }}>
          {/* Ceiling line */}
          <line x1="64" y1="20" x2="184" y2="20" stroke="var(--color-muted-foreground)" strokeWidth="2" />
          {/* Hatches for ceiling */}
          {[64, 74, 84, 94, 104, 114, 124, 134, 144, 154, 164, 174].map((x) => (
            <line key={x} x1={x} y1="20" x2={x + 8} y2="10" stroke="var(--color-muted-foreground)" strokeWidth="1" />
          ))}
          
          {/* Spring (Left) */}
          <path d="M94 20 V 30 L 84 35 L 104 45 L 84 55 L 104 65 L 84 75 L 104 85 L 94 90 V 100" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <text x="74" y="65" fill="var(--color-primary)" fontSize="12" fontWeight="bold" fontFamily="JetBrains Mono" textAnchor="end">k</text>
          
          {/* Damper (Right) */}
          <line x1="154" y1="20" x2="154" y2="45" stroke="var(--color-danger)" strokeWidth="2" />
          <path d="M144 45 H 164 V 75 H 144 Z" fill="none" stroke="var(--color-danger)" strokeWidth="2" />
          <line x1="154" y1="55" x2="154" y2="100" stroke="var(--color-danger)" strokeWidth="2" />
          <line x1="148" y1="55" x2="160" y2="55" stroke="var(--color-danger)" strokeWidth="3" />
          <text x="174" y="65" fill="var(--color-danger)" fontSize="12" fontWeight="bold" fontFamily="JetBrains Mono" textAnchor="start">c</text>
          
          {/* Mass Block */}
          <rect x="84" y="100" width="80" height="30" fill="rgba(61, 113, 146, 0.15)" stroke="var(--color-primary)" strokeWidth="2" rx="4" />
          <text x="124" y="120" fill="var(--color-foreground)" fontSize="14" fontWeight="bold" fontFamily="JetBrains Mono" textAnchor="middle">m</text>
          
          {/* Coordinate System x(t) */}
          <line x1="194" y1="100" x2="194" y2="130" stroke="var(--color-muted-foreground)" strokeWidth="1.5" strokeDasharray="2 2" />
          <polygon points="194,130 190,124 198,124" fill="var(--color-muted-foreground)" />
          <text x="202" y="120" fill="var(--color-muted-foreground)" fontSize="12" fontFamily="JetBrains Mono">x</text>
        </svg>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", backgroundColor: "color-mix(in srgb, var(--color-danger) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--color-danger) 20%, transparent)", borderRadius: 6, padding: "10px 14px" }}>
        <span style={{ fontSize: 12, color: "var(--color-muted-foreground)" }}>Nat. Freq (ωn)</span>
        <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13, fontWeight: 600, color: "var(--color-danger)" }}>14.1 rad/s</span>
      </div>
    </div>
  );
}

function PreviewCardDeck() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const cards = [
    <HeroPreviewCard key="1" />,
    <BeamPreviewCard key="2" />,
    <VibrationPreviewCard key="3" />
  ];

  return (
    <div 
      className="flex flex-col lg:flex-row items-center w-full justify-center" 
      style={{ 
        padding: "40px 0",
        marginTop: "60px"
      }}
    >
      {cards.map((card, idx) => {
        const isHovered = hoveredIndex === idx;
        const isOtherHovered = hoveredIndex !== null && hoveredIndex !== idx;
        
        return (
          <div
            key={idx}
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => setHoveredIndex(isHovered ? null : idx)}
            className={idx === 0 ? "relative" : "relative -mt-[240px] lg:mt-0 lg:-ml-32"}
            style={{
              transition: "all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)",
              zIndex: isHovered ? 50 : idx, // bring to front when hovered
              transform: isHovered 
                ? "translateY(-20px) scale(1.05)" 
                : isOtherHovered 
                  ? "scale(0.95)" 
                  : "scale(1)",
              opacity: 1, // Keep full opacity to prevent overlapping cards from bleeding through each other
              filter: isHovered ? "drop-shadow(0 30px 50px rgba(47, 93, 124, 0.3))" : "drop-shadow(0 10px 20px rgba(0,0,0,0.05))",
              cursor: "pointer"
            }}
          >
            {card}
          </div>
        );
      })}
    </div>
  );
}
