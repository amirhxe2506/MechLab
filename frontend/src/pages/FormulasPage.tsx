import { useState } from "react";
import { Link } from "react-router-dom";

const formulas = [
  {
    id: "normal-stress",
    name: "Normal Stress",
    expression: "σ = F / A",
    description: "Stress developed when a force acts perpendicular to a cross-sectional area.",
    subject: "Strength of Materials",
    category: "Mechanics",
    accent: "#f59e0b",
    variables: [
      { symbol: "σ", name: "Normal Stress", unit: "Pa (N/m²)" },
      { symbol: "F", name: "Applied Force", unit: "N" },
      { symbol: "A", name: "Cross-sectional Area", unit: "m²" },
    ],
    assumptions: ["Uniform stress distribution", "Force perpendicular to cross-section", "Linear elastic material"],
    calculator: "/tools/stress-strain",
  },
  {
    id: "strain",
    name: "Axial Strain",
    expression: "ε = δ / L = σ / E",
    description: "Deformation per unit length of a member under axial loading.",
    subject: "Strength of Materials",
    category: "Mechanics",
    accent: "#f59e0b",
    variables: [
      { symbol: "ε", name: "Axial Strain", unit: "dimensionless" },
      { symbol: "δ", name: "Deformation", unit: "m" },
      { symbol: "L", name: "Original Length", unit: "m" },
      { symbol: "E", name: "Young's Modulus (Elasticity)", unit: "Pa" },
    ],
    assumptions: ["Homogeneous material", "Isotropic behavior", "Small deformations"],
    calculator: "/tools/stress-strain",
  },
  {
    id: "hooke",
    name: "Hooke's Law",
    expression: "σ = E · ε",
    description: "Linear relationship between stress and strain in the elastic region.",
    subject: "Strength of Materials",
    category: "Mechanics",
    accent: "#f59e0b",
    variables: [
      { symbol: "σ", name: "Normal Stress", unit: "Pa" },
      { symbol: "E", name: "Modulus of Elasticity", unit: "Pa" },
      { symbol: "ε", name: "Axial Strain", unit: "dimensionless" },
    ],
    assumptions: ["Within proportional limit", "Linearly elastic material"],
    calculator: "/tools/stress-strain",
  },
  {
    id: "principal-stresses",
    name: "Principal Stresses",
    expression: "σ₁,₂ = (σx + σy)/2 ± √[((σx−σy)/2)² + τxy²]",
    description: "Maximum and minimum normal stresses on a rotated plane in 2D stress state.",
    subject: "Strength of Materials",
    category: "Mechanics",
    accent: "#f59e0b",
    variables: [
      { symbol: "σ₁", name: "Maximum Principal Stress", unit: "Pa" },
      { symbol: "σ₂", name: "Minimum Principal Stress", unit: "Pa" },
      { symbol: "σx", name: "Normal Stress in x", unit: "Pa" },
      { symbol: "σy", name: "Normal Stress in y", unit: "Pa" },
      { symbol: "τxy", name: "Shear Stress", unit: "Pa" },
    ],
    assumptions: ["Plane stress state (σz = 0)", "Linear elastic"],
    calculator: "/tools/mohrs-circle",
  },
  {
    id: "max-shear",
    name: "Maximum Shear Stress",
    expression: "τmax = √[((σx−σy)/2)² + τxy²]",
    description: "Largest shear stress in a 2D stress state. Equal to the radius of Mohr's Circle.",
    subject: "Strength of Materials",
    category: "Mechanics",
    accent: "#f59e0b",
    variables: [
      { symbol: "τmax", name: "Maximum Shear Stress", unit: "Pa" },
      { symbol: "σx", name: "Normal Stress in x", unit: "Pa" },
      { symbol: "σy", name: "Normal Stress in y", unit: "Pa" },
      { symbol: "τxy", name: "Shear Stress", unit: "Pa" },
    ],
    assumptions: ["Plane stress state"],
    calculator: "/tools/mohrs-circle",
  },
  {
    id: "reynolds",
    name: "Reynolds Number",
    expression: "Re = ρ · v · D / μ",
    description: "Dimensionless ratio of inertial to viscous forces. Determines flow regime.",
    subject: "Fluid Mechanics",
    category: "Fluids",
    accent: "#06b6d4",
    variables: [
      { symbol: "Re", name: "Reynolds Number", unit: "dimensionless" },
      { symbol: "ρ", name: "Fluid Density", unit: "kg/m³" },
      { symbol: "v", name: "Mean Flow Velocity", unit: "m/s" },
      { symbol: "D", name: "Characteristic Length (Diameter)", unit: "m" },
      { symbol: "μ", name: "Dynamic Viscosity", unit: "Pa·s" },
    ],
    assumptions: ["Incompressible flow", "Newtonian fluid", "Internal pipe flow (Re < 2300 → laminar, Re > 4000 → turbulent)"],
    calculator: "/tools/reynolds",
  },
  {
    id: "bernoulli",
    name: "Bernoulli Equation",
    expression: "P + ½ρv² + ρgh = constant",
    description: "Conservation of energy for steady, incompressible, inviscid flow along a streamline.",
    subject: "Fluid Mechanics",
    category: "Fluids",
    accent: "#06b6d4",
    variables: [
      { symbol: "P", name: "Static Pressure", unit: "Pa" },
      { symbol: "ρ", name: "Fluid Density", unit: "kg/m³" },
      { symbol: "v", name: "Flow Velocity", unit: "m/s" },
      { symbol: "g", name: "Gravitational Acceleration", unit: "m/s²" },
      { symbol: "h", name: "Elevation Head", unit: "m" },
    ],
    assumptions: ["Steady flow", "Incompressible fluid", "Inviscid flow", "Along a streamline"],
    calculator: "/tools/reynolds",
  },
  {
    id: "natural-frequency",
    name: "Natural Frequency (SDOF)",
    expression: "ωn = √(k / m)",
    description: "Undamped natural frequency of a single-degree-of-freedom mass-spring system.",
    subject: "Vibrations",
    category: "Dynamics",
    accent: "#a78bfa",
    variables: [
      { symbol: "ωn", name: "Natural Frequency", unit: "rad/s" },
      { symbol: "k", name: "Spring Stiffness", unit: "N/m" },
      { symbol: "m", name: "Mass", unit: "kg" },
    ],
    assumptions: ["Undamped system", "Linear spring", "Single degree of freedom"],
    calculator: "/tools/vibration",
  },
  {
    id: "damping-ratio",
    name: "Damping Ratio",
    expression: "ζ = c / (2√(km))",
    description: "Dimensionless measure of damping relative to critical damping.",
    subject: "Vibrations",
    category: "Dynamics",
    accent: "#a78bfa",
    variables: [
      { symbol: "ζ", name: "Damping Ratio", unit: "dimensionless" },
      { symbol: "c", name: "Damping Coefficient", unit: "N·s/m" },
      { symbol: "k", name: "Spring Stiffness", unit: "N/m" },
      { symbol: "m", name: "Mass", unit: "kg" },
    ],
    assumptions: ["Viscous damping", "Single degree of freedom"],
    calculator: "/tools/vibration",
  },
  {
    id: "moment-equilibrium",
    name: "Moment Equilibrium",
    expression: "ΣM = 0",
    description: "Sum of all moments about any point must equal zero for a body in static equilibrium.",
    subject: "Statics",
    category: "Statics",
    accent: "#3b82f6",
    variables: [
      { symbol: "ΣM", name: "Sum of Moments", unit: "N·m" },
      { symbol: "F", name: "Applied Force", unit: "N" },
      { symbol: "d", name: "Moment Arm (perpendicular distance)", unit: "m" },
    ],
    assumptions: ["Rigid body", "Equilibrium conditions"],
    calculator: null,
  },
];

const categories = ["All", "Mechanics", "Fluids", "Dynamics", "Statics"];

export default function FormulasPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = formulas.filter((f) => {
    const matchSearch =
      search === "" ||
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.expression.toLowerCase().includes(search.toLowerCase()) ||
      f.subject.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || f.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 24px" }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", color: "#3b82f6", letterSpacing: "0.1em", marginBottom: 10 }}>
          FORMULA LIBRARY
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
          Engineering Formulas
        </h1>
        <p style={{ fontSize: 15, color: "#475569", margin: 0 }}>
          {formulas.length} formulas across Mechanics, Fluids, Dynamics, and Statics.
        </p>
      </div>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 28,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {/* Search */}
        <div style={{ position: "relative", flex: "1 1 280px", maxWidth: 380 }}>
          <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#334155" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search formulas..."
            style={{
              width: "100%",
              padding: "9px 12px 9px 36px",
              backgroundColor: "#0c1528",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8,
              color: "#e2e8f0",
              fontSize: 14,
              outline: "none",
              fontFamily: "Inter, system-ui, sans-serif",
            }}
          />
        </div>

        {/* Category filters */}
        <div style={{ display: "flex", gap: 6 }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                padding: "7px 14px",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 500,
                border: "1px solid",
                borderColor: category === cat ? "rgba(59,130,246,0.4)" : "rgba(255,255,255,0.07)",
                backgroundColor: category === cat ? "rgba(59,130,246,0.1)" : "transparent",
                color: category === cat ? "#3b82f6" : "#475569",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ marginLeft: "auto", fontSize: 12, color: "#334155", fontFamily: "JetBrains Mono, monospace" }}>
          {filtered.length} results
        </div>
      </div>

      {/* Formula cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map((formula) => {
          const isOpen = expanded === formula.id;
          return (
            <div
              key={formula.id}
              style={{
                backgroundColor: "#0c1528",
                border: "1px solid rgba(255,255,255,0.07)",
                borderLeft: `3px solid ${formula.accent}`,
                borderRadius: "0 10px 10px 0",
                overflow: "hidden",
                transition: "border-color 0.15s ease",
              }}
            >
              {/* Header row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  padding: "16px 20px",
                  cursor: "pointer",
                  flexWrap: "wrap",
                }}
                onClick={() => setExpanded(isOpen ? null : formula.id)}
              >
                {/* Formula expression */}
                <div
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#06b6d4",
                    backgroundColor: "rgba(6,182,212,0.06)",
                    border: "1px solid rgba(6,182,212,0.12)",
                    borderRadius: 6,
                    padding: "5px 14px",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    minWidth: 200,
                  }}
                >
                  {formula.expression}
                </div>

                {/* Name and subject */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0", fontFamily: "DM Sans, system-ui, sans-serif" }}>
                    {formula.name}
                  </div>
                  <div style={{ fontSize: 12, color: "#334155", marginTop: 3 }}>{formula.subject}</div>
                </div>

                {/* Category badge */}
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 4,
                    fontFamily: "JetBrains Mono, monospace",
                    backgroundColor: `${formula.accent}12`,
                    color: formula.accent,
                    border: `1px solid ${formula.accent}25`,
                    letterSpacing: "0.04em",
                  }}
                >
                  {formula.category.toUpperCase()}
                </span>

                {/* Expand icon */}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#475569"
                  strokeWidth="2"
                  style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease", flexShrink: 0 }}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>

              {/* Expanded details */}
              {isOpen && (
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "20px 20px 20px 23px" }}>
                  <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 20px", lineHeight: 1.65 }}>
                    {formula.description}
                  </p>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                    {/* Variables */}
                    <div>
                      <div style={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", color: "#334155", letterSpacing: "0.06em", marginBottom: 12 }}>
                        VARIABLES
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {formula.variables.map((v) => (
                          <div
                            key={v.symbol}
                            style={{
                              display: "flex",
                              alignItems: "baseline",
                              gap: 10,
                              padding: "7px 10px",
                              backgroundColor: "#060b18",
                              borderRadius: 6,
                              border: "1px solid rgba(255,255,255,0.04)",
                            }}
                          >
                            <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 14, fontWeight: 600, color: "#06b6d4", minWidth: 32 }}>
                              {v.symbol}
                            </span>
                            <span style={{ fontSize: 13, color: "#64748b", flex: 1 }}>{v.name}</span>
                            <span style={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", color: "#334155" }}>
                              {v.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Assumptions */}
                    <div>
                      <div style={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", color: "#334155", letterSpacing: "0.06em", marginBottom: 12 }}>
                        ASSUMPTIONS
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {formula.assumptions.map((a) => (
                          <div key={a} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "#64748b" }}>
                            <span style={{ color: formula.accent, marginTop: 1, flexShrink: 0 }}>✓</span>
                            {a}
                          </div>
                        ))}
                      </div>

                      {formula.calculator && (
                        <Link
                          to={formula.calculator}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            marginTop: 20,
                            padding: "8px 16px",
                            backgroundColor: "rgba(59,130,246,0.1)",
                            border: "1px solid rgba(59,130,246,0.25)",
                            borderRadius: 6,
                            color: "#3b82f6",
                            fontSize: 13,
                            fontWeight: 500,
                            textDecoration: "none",
                          }}
                        >
                          Open Calculator →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
