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
    <div className="max-w-7xl mx-auto py-12 px-6">
      {/* Header */}
      <div className="mb-10">
        <div className="text-[11px] font-mono text-blue-500 tracking-widest mb-2.5">
          FORMULA LIBRARY
        </div>
        <h1 className="font-display text-[clamp(1.6rem,3vw,2.2rem)] font-bold text-slate-100 mb-3 tracking-tight">
          Engineering Formulas
        </h1>
        <p className="text-[15px] text-slate-600 m-0">
          {formulas.length} formulas across Mechanics, Fluids, Dynamics, and Statics.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-7">
        {/* Search */}
        <div className="relative flex-1 min-w-[280px] max-w-[380px]">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">
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
            className="w-full py-[9px] px-3 pl-9 bg-[#0c1528] border border-white/10 rounded-lg text-slate-200 text-sm outline-none font-sans focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
          />
        </div>

        {/* Category filters */}
        <div className="flex gap-1.5 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`py-1.5 px-3.5 rounded-md text-[13px] font-medium border cursor-pointer transition-all duration-150 focus:outline-none ${
                category === cat
                  ? "border-blue-500/40 bg-blue-500/10 text-blue-500"
                  : "border-white/10 bg-transparent text-slate-500 hover:bg-white/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="ml-auto text-xs text-slate-600 font-mono">
          {filtered.length} results
        </div>
      </div>

      {/* Formula cards */}
      <div className="flex flex-col gap-2.5">
        {filtered.map((formula) => {
          const isOpen = expanded === formula.id;
          return (
            <div
              key={formula.id}
              className="bg-[#0c1528] border border-white/5 rounded-r-xl overflow-hidden transition-colors duration-150"
              style={{ borderLeft: `3px solid ${formula.accent}` }}
            >
              {/* Header row */}
              <div
                className="flex items-center gap-5 py-4 px-5 cursor-pointer flex-wrap hover:bg-white/5 transition-colors"
                onClick={() => setExpanded(isOpen ? null : formula.id)}
              >
                {/* Formula expression */}
                <div className="font-mono text-[15px] font-semibold text-cyan-500 bg-cyan-500/10 border border-cyan-500/20 rounded-md py-1 px-3.5 whitespace-nowrap shrink-0 min-w-[200px]">
                  {formula.expression}
                </div>

                {/* Name and subject */}
                <div className="flex-1 min-w-[200px]">
                  <div className="text-[15px] font-semibold text-slate-200 font-display">
                    {formula.name}
                  </div>
                  <div className="text-xs text-slate-600 mt-1">{formula.subject}</div>
                </div>

                {/* Category badge */}
                <span
                  className="text-[10px] font-semibold py-0.5 px-2 rounded font-mono tracking-wider"
                  style={{
                    backgroundColor: `${formula.accent}15`,
                    color: formula.accent,
                    border: `1px solid ${formula.accent}30`,
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
                  className={`shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>

              {/* Expanded details */}
              {isOpen && (
                <div className="border-t border-white/5 py-5 px-5 pl-6 bg-[#060b18]/50">
                  <p className="text-sm text-slate-500 m-0 mb-5 leading-relaxed max-w-3xl">
                    {formula.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Variables */}
                    <div>
                      <div className="text-[11px] font-mono text-slate-600 tracking-wider mb-3">
                        VARIABLES
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {formula.variables.map((v) => (
                          <div
                            key={v.symbol}
                            className="flex items-baseline gap-2.5 py-1.5 px-2.5 bg-[#060b18] rounded-md border border-white/5"
                          >
                            <span className="font-mono text-sm font-semibold text-cyan-500 min-w-[32px]">
                              {v.symbol}
                            </span>
                            <span className="text-[13px] text-slate-500 flex-1">{v.name}</span>
                            <span className="text-[11px] font-mono text-slate-600">
                              {v.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Assumptions */}
                    <div>
                      <div className="text-[11px] font-mono text-slate-600 tracking-wider mb-3">
                        ASSUMPTIONS
                      </div>
                      <div className="flex flex-col gap-2">
                        {formula.assumptions.map((a) => (
                          <div key={a} className="flex items-start gap-2 text-[13px] text-slate-500">
                            <span className="mt-px shrink-0" style={{ color: formula.accent }}>✓</span>
                            {a}
                          </div>
                        ))}
                      </div>

                      {formula.calculator && (
                        <Link
                          to={formula.calculator}
                          className="inline-flex items-center gap-1.5 mt-5 py-2 px-4 bg-blue-500/10 border border-blue-500/25 rounded-md text-blue-500 text-[13px] font-medium no-underline hover:bg-blue-500/20 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
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
