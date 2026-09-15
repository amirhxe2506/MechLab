import { Link } from "react-router-dom"
import { AnimatedArrow } from "../components/AnimatedArrow"

interface ToolItem {
  id: string

  href: string

  title: string

  formula: string

  description: string

  subject: string

  badge: string

  badgeColor: string

  inputs: string[]

  outputs: string[]

  features: string[]

  comingSoon?: boolean
}

const tools: ToolItem[] = [
  {
    id: "stress-strain",

    href: "/tools/stress-strain",

    title: "Stress & Strain Calculator",

    formula: "σ = F / A  ·  ε = σ / E  ·  δ = ε · L",

    description:
      "Compute normal stress, axial strain, and deformation for prismatic bars under axial loading. Supports SI and Imperial units.",

    subject: "Strength of Materials",

    badge: "Mechanics",

    badgeColor: "var(--color-accent)",

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

    badgeColor: "var(--color-accent)",

    inputs: ["Normal Stress σx", "Normal Stress σy", "Shear Stress τxy"],

    outputs: [
      "Principal Stress σ₁",
      "Principal Stress σ₂",
      "Max Shear τmax",
      "Principal Angle θp",
    ],

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

    badgeColor: "var(--color-primary)",

    inputs: ["Density (ρ)", "Velocity (v)", "Diameter (D)", "Viscosity (μ)"],

    outputs: [
      "Reynolds Number (Re)",
      "Flow Classification",
      "Regime Description",
    ],

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

    badgeColor: "var(--color-primary)",

    inputs: [
      "Mass (m)",
      "Spring Stiffness (k)",
      "Damping (c)",
      "Initial Conditions",
    ],

    outputs: [
      "Natural Frequency ωn",
      "Damped Frequency ωd",
      "Damping Ratio ζ",
      "System Type",
    ],

    features: [
      "Time-history chart",
      "Damping classification",
      "Interactive parameters",
    ],
  },

  {
    id: "beam",

    href: "/tools/beam",

    title: "Beam Analysis",

    formula: "EI·d²y/dx² = M(x)  ·  dM/dx = V(x)",

    description:
      "Shear force and bending moment diagrams for simply supported and cantilever beams with point loads and distributed loads.",

    subject: "Strength of Materials",

    badge: "Mechanics",

    badgeColor: "var(--color-accent)",

    inputs: [
      "Beam Length",
      "Support Type",
      "Load Positions",
      "Load Magnitudes",
    ],

    outputs: [
      "Reactions",
      "Shear Force Diagram",
      "Bending Moment Diagram",
      "Max Moment",
    ],

    features: ["SFD/BMD plots", "Reaction forces", "Max moment location"],
  },

  {
    id: "bernoulli",

    href: "/tools/bernoulli",

    title: "Bernoulli Flow Calculator",

    formula: "P₁ + ½ρv₁² + ρgz₁ = P₂ + ½ρv₂² + ρgz₂",

    description:
      "Solve Bernoulli's energy equation along a streamline for steady, incompressible flow with head breakdown.",

    subject: "Fluid Mechanics",

    badge: "Fluids",

    badgeColor: "var(--color-primary)",

    inputs: ["Density (ρ)", "Station 1 (P₁, v₁, z₁)", "Station 2 parameters"],

    outputs: [
      "Target Unknown",
      "Total Energy Head",
      "Head Breakdown (P/γ, v²/2g, z)",
    ],

    features: [
      "Fluid presets",
      "Energy conservation check",
      "Head distribution",
    ],
  },
]

export default function ToolsPage() {
  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      {/* Header */}
      <div 
        className="mb-12"
        style={{
          background: "var(--color-card)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid var(--color-border)",
          borderRadius: 24,
          padding: "40px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)"
        }}
      >
        <div className="text-[11px] font-mono text-primary tracking-widest mb-2.5">
          ENGINEERING TOOLS
        </div>
        <h1 className="font-display text-[clamp(1.6rem,3vw,2.2rem)] font-bold text-foreground mb-3 tracking-tight">
          Calculator Suite
        </h1>
        <p className="text-[15px] text-muted-foreground m-0 max-w-xl">
          Interactive engineering calculators with real-time results, unit
          handling, input validation, and visualizations.
        </p>
      </div>

      {/* Info bar */}
      <div className="flex flex-wrap gap-6 py-3.5 px-5 bg-primary/5 border border-primary/15 rounded-lg mb-8">
        {[
          { label: "Calculators", value: "5" },

          { label: "Unit Systems", value: "SI + Imperial" },

          { label: "Subjects", value: "3" },

          { label: "Visualizations", value: "Charts + SVG" },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold text-primary">
              {s.value}
            </span>
            <span className="text-[13px] text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Tools grid */}
      <div className="flex flex-col gap-4">
        {tools.map((tool) => (
          <div
            key={tool.id}
            className={`bg-card border border-border rounded-xl overflow-hidden ${
              tool.comingSoon ? "opacity-60" : "card-interactive"
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-0">
              {/* Left: main info */}
              <div className="p-7 border-b md:border-b-0 md:border-r border-border">
                <div className="flex items-center gap-3 mb-3.5">
                  <span
                    className="text-[10px] font-semibold py-0.5 px-2 rounded font-mono tracking-wider"
                    style={{
                      backgroundColor: `${tool.badgeColor}12`,

                      color: tool.badgeColor,

                      border: `1px solid ${tool.badgeColor}25`,
                    }}
                  >
                    {tool.badge}
                  </span>
                  <span className="text-xs text-muted-foreground">{tool.subject}</span>
                  {tool.comingSoon && (
                    <span className="text-[10px] py-0.5 px-1.5 rounded bg-secondary border border-border text-muted-foreground font-mono">
                      COMING SOON
                    </span>
                  )}
                </div>

                <h2 className="font-display text-xl font-bold text-foreground mb-2 tracking-tight">
                  {tool.title}
                </h2>

                {/* Formula */}
                <div className="font-mono text-[13px] text-primary bg-primary/5 border border-primary/10 rounded-md py-1.5 px-3 mb-3.5 inline-block">
                  {tool.formula}
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed m-0 mb-5">
                  {tool.description}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                  {/* Inputs */}
                  <div className="flex-1">
                    <div className="text-[10px] font-mono text-muted-foreground tracking-wider mb-2">
                      INPUTS
                    </div>
                    <div className="flex flex-col gap-1">
                      {tool.inputs.map((inp) => (
                        <div
                          key={inp}
                          className="flex items-center gap-1.5 text-xs text-muted-foreground"
                        >
                          <span className="text-primary flex items-center">
                            <svg width="14" height="14" viewBox="0 0 14 14">
                              <circle
                                cx="7"
                                cy="7"
                                r="5.5"
                                stroke="currentColor"
                                strokeWidth="1.2"
                                fill="none"
                              />
                              <line
                                x1="4.5"
                                y1="4.5"
                                x2="9.5"
                                y2="9.5"
                                stroke="currentColor"
                                strokeWidth="1.2"
                              />
                              <line
                                x1="9.5"
                                y1="4.5"
                                x2="4.5"
                                y2="9.5"
                                stroke="currentColor"
                                strokeWidth="1.2"
                              />
                            </svg>
                          </span>{" "}
                          {inp}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="hidden sm:block w-px bg-border" />

                  {/* Outputs */}
                  <div className="flex-1">
                    <div className="text-[10px] font-mono text-muted-foreground tracking-wider mb-2">
                      OUTPUTS
                    </div>
                    <div className="flex flex-col gap-1">
                      {tool.outputs.map((out) => (
                        <div
                          key={out}
                          className="flex items-center gap-1.5 text-xs text-muted-foreground"
                        >
                          <span className="text-success flex items-center">
                            <svg width="14" height="14" viewBox="0 0 14 14">
                              <circle
                                cx="7"
                                cy="7"
                                r="5.5"
                                stroke="currentColor"
                                strokeWidth="1.2"
                                fill="none"
                              />
                              <circle cx="7" cy="7" r="2" fill="currentColor" />
                            </svg>
                          </span>{" "}
                          {out}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: features + CTA */}
              <div className="p-6 flex flex-col justify-between bg-secondary">
                <div>
                  <div className="text-[10px] font-mono text-muted-foreground tracking-wider mb-3">
                    FEATURES
                  </div>
                  {tool.features.map((f) => (
                    <div
                      key={f}
                      className="flex items-center gap-2 mb-2 text-[13px] text-slate-500"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        className="text-success"
                        strokeWidth="2.5"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {f}
                    </div>
                  ))}
                </div>

                <Link
                  to={tool.href}
                  className={`flex items-center justify-center gap-2 py-2.5 px-5 rounded-lg text-sm font-semibold no-underline mt-5 tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    tool.comingSoon
                      ? "bg-secondary text-muted-foreground pointer-events-none"
                      : "btn-primary bg-primary text-primary-foreground pointer-events-auto btn-with-arrow"
                  }`}
                >
                  {tool.comingSoon ? (
                    "Coming Soon"
                  ) : (
                    <>
                      <span>Open Calculator</span>
                      <AnimatedArrow />
                    </>
                  )}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
