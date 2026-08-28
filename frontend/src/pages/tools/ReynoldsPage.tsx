import { useState, useMemo } from "react";
import { Link } from "react-router-dom";

const fluidPresets = [
  { name: "Water (20°C)", rho: 998.2, mu: 0.001002 },
  { name: "Air (20°C)", rho: 1.204, mu: 0.00001825 },
  { name: "Engine Oil", rho: 870, mu: 0.1 },
  { name: "Glycerol (25°C)", rho: 1261, mu: 0.954 },
  { name: "Mercury (20°C)", rho: 13546, mu: 0.00157 },
];

interface Inputs {
  rho: string;
  v: string;
  D: string;
  mu: string;
}

function getFlowRegime(Re: number): {
  label: string;
  description: string;
  color: string;
  critical: string;
} {
  if (Re < 2300)
    return {
      label: "Laminar",
      description: "Smooth, ordered flow. Fluid moves in parallel layers with no disruption between them.",
      color: "#22c55e",
      critical: "Re < 2300",
    };
  if (Re < 4000)
    return {
      label: "Transitional",
      description: "Unstable flow between laminar and turbulent. Neither regime is fully established.",
      color: "#f59e0b",
      critical: "2300 ≤ Re < 4000",
    };
  return {
    label: "Turbulent",
    description: "Chaotic, irregular flow with eddies and mixing across the pipe cross-section.",
    color: "#ef4444",
    critical: "Re ≥ 4000",
  };
}

export default function ReynoldsPage() {
  const [inputs, setInputs] = useState<Inputs>({ rho: "998.2", v: "2.5", D: "0.05", mu: "0.001002" });
  const [selectedFluid, setSelectedFluid] = useState(0);

  const Re = useMemo(() => {
    const rho = parseFloat(inputs.rho);
    const v = parseFloat(inputs.v);
    const D = parseFloat(inputs.D);
    const mu = parseFloat(inputs.mu);
    if ([rho, v, D, mu].some(isNaN) || mu <= 0 || D <= 0 || rho <= 0 || v <= 0) return null;
    return (rho * v * D) / mu;
  }, [inputs]);

  const regime = Re !== null ? getFlowRegime(Re) : null;

  const setInput = (key: keyof Inputs) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputs((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const applyPreset = (i: number) => {
    const p = fluidPresets[i];
    setSelectedFluid(i);
    setInputs((prev) => ({ ...prev, rho: String(p.rho), mu: String(p.mu) }));
  };

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 24px" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32, fontSize: 13, color: "#334155" }}>
        <Link to="/tools" style={{ color: "#475569", textDecoration: "none" }}>Tools</Link>
        <span>→</span>
        <span style={{ color: "#64748b" }}>Reynolds Number</span>
      </div>

      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", color: "#06b6d4", letterSpacing: "0.08em", marginBottom: 10 }}>
          FLUIDS · PIPE FLOW
        </div>
        <h1
          style={{
            fontFamily: "DM Sans, system-ui, sans-serif",
            fontSize: "clamp(1.5rem, 3vw, 2rem)",
            fontWeight: 700,
            color: "#f1f5f9",
            margin: "0 0 10px",
            letterSpacing: "-0.03em",
          }}
        >
          Reynolds Number Calculator
        </h1>
        <p style={{ fontSize: 15, color: "#475569", margin: 0 }}>
          Determine the flow regime — laminar, transitional, or turbulent — for pipe flow.
        </p>
      </div>

      {/* Formula */}
      <div style={{ display: "flex", gap: 12, marginBottom: 32, flexWrap: "wrap" }}>
        <div className="formula-display">Re = ρ · v · D / μ</div>
        <div className="formula-display" style={{ fontSize: 13 }}>ν = μ / ρ &nbsp;&nbsp; Re = v · D / ν</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Left: inputs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Fluid presets */}
          <div
            style={{
              backgroundColor: "#0c1528",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 12,
              padding: 24,
            }}
          >
            <div style={{ fontSize: 12, fontFamily: "JetBrains Mono, monospace", color: "#334155", letterSpacing: "0.06em", marginBottom: 14 }}>
              FLUID PRESETS
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {fluidPresets.map((f, i) => (
                <button
                  key={f.name}
                  onClick={() => applyPreset(i)}
                  style={{
                    padding: "9px 14px",
                    textAlign: "left",
                    backgroundColor: selectedFluid === i ? "rgba(6,182,212,0.1)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${selectedFluid === i ? "rgba(6,182,212,0.3)" : "rgba(255,255,255,0.06)"}`,
                    borderRadius: 6,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ fontSize: 13, color: selectedFluid === i ? "#06b6d4" : "#64748b" }}>{f.name}</span>
                  <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "#334155" }}>
                    μ={f.mu} Pa·s
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Parameters */}
          <div
            style={{
              backgroundColor: "#0c1528",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 12,
              padding: 24,
            }}
          >
            <div style={{ fontSize: 12, fontFamily: "JetBrains Mono, monospace", color: "#334155", letterSpacing: "0.06em", marginBottom: 18 }}>
              FLOW PARAMETERS
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {([
                { key: "rho", sym: "ρ", label: "Fluid Density", unit: "kg/m³", placeholder: "e.g. 998.2" },
                { key: "v", sym: "v", label: "Mean Velocity", unit: "m/s", placeholder: "e.g. 2.5" },
                { key: "D", sym: "D", label: "Pipe Diameter", unit: "m", placeholder: "e.g. 0.05" },
                { key: "mu", sym: "μ", label: "Dynamic Viscosity", unit: "Pa·s", placeholder: "e.g. 0.001002" },
              ] as const).map((f) => (
                <div key={f.key}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 14, color: "#06b6d4" }}>{f.sym}</span>
                    <span style={{ fontSize: 12, color: "#64748b" }}>{f.label}</span>
                  </div>
                  <div style={{ display: "flex", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, overflow: "hidden", backgroundColor: "#060b18" }}>
                    <input
                      type="number"
                      value={inputs[f.key]}
                      onChange={setInput(f.key)}
                      placeholder={f.placeholder}
                      style={{ flex: 1, padding: "10px 12px", background: "none", border: "none", color: "#e2e8f0", fontSize: 14, fontFamily: "JetBrains Mono, monospace", outline: "none" }}
                    />
                    <div style={{ padding: "10px 12px", borderLeft: "1px solid rgba(255,255,255,0.06)", fontSize: 11, fontFamily: "JetBrains Mono, monospace", color: "#334155", backgroundColor: "rgba(255,255,255,0.02)", whiteSpace: "nowrap" }}>
                      {f.unit}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: result */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {Re !== null && regime ? (
            <>
              {/* Main Re result */}
              <div
                style={{
                  backgroundColor: "#0c1528",
                  border: `1px solid ${regime.color}30`,
                  borderTop: `3px solid ${regime.color}`,
                  borderRadius: 12,
                  padding: 32,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", color: "#334155", letterSpacing: "0.08em", marginBottom: 16 }}>
                  REYNOLDS NUMBER
                </div>
                <div
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: "clamp(2.5rem, 6vw, 4rem)",
                    fontWeight: 700,
                    color: "#f1f5f9",
                    letterSpacing: "-0.04em",
                    lineHeight: 1,
                    marginBottom: 8,
                  }}
                >
                  {Re.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </div>
                <div style={{ fontSize: 12, color: "#334155", marginBottom: 24 }}>dimensionless</div>

                {/* Flow regime badge */}
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 24px",
                    backgroundColor: `${regime.color}12`,
                    border: `1px solid ${regime.color}35`,
                    borderRadius: 20,
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: regime.color }} />
                  <span style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 18, fontWeight: 700, color: regime.color }}>
                    {regime.label} Flow
                  </span>
                </div>

                <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.65, margin: "16px 0 0" }}>
                  {regime.description}
                </p>
              </div>

              {/* Flow regime scale */}
              <div
                style={{
                  backgroundColor: "#0c1528",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 12,
                  padding: 24,
                }}
              >
                <div style={{ fontSize: 12, fontFamily: "JetBrains Mono, monospace", color: "#334155", letterSpacing: "0.06em", marginBottom: 16 }}>
                  FLOW REGIME SCALE
                </div>
                <FlowRegimeScale Re={Re} />
              </div>

              {/* Summary table */}
              <div
                style={{
                  backgroundColor: "#0c1528",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 12,
                  padding: 24,
                }}
              >
                <div style={{ fontSize: 12, fontFamily: "JetBrains Mono, monospace", color: "#334155", letterSpacing: "0.06em", marginBottom: 16 }}>
                  COMPUTED VALUES
                </div>
                {[
                  { label: "Reynolds Number", val: Re.toFixed(1), sym: "Re" },
                  { label: "Kinematic Viscosity", val: (parseFloat(inputs.mu) / parseFloat(inputs.rho)).toExponential(4), sym: "ν", unit: "m²/s" },
                  { label: "Flow Regime", val: regime.label, sym: "—", colored: regime.color },
                  { label: "Critical Re Range", val: regime.critical, sym: "—" },
                ].map((r) => (
                  <div
                    key={r.sym + r.label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "9px 0",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      fontSize: 13,
                    }}
                  >
                    <span style={{ color: "#475569" }}>{r.label}</span>
                    <span
                      style={{
                        fontFamily: "JetBrains Mono, monospace",
                        color: r.colored ?? "#e2e8f0",
                        fontWeight: 600,
                      }}
                    >
                      {r.val} {r.unit ?? ""}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div
              style={{
                backgroundColor: "#0c1528",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 12,
                padding: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#334155",
                fontSize: 14,
              }}
            >
              Enter valid positive values to compute Re.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FlowRegimeScale({ Re }: { Re: number }) {
  const maxRe = Math.max(Re * 1.3, 6000);
  const laminarEnd = 2300 / maxRe;
  const transEnd = 4000 / maxRe;
  const rePos = Math.min(Re / maxRe, 0.98);

  return (
    <div>
      {/* Bar */}
      <div style={{ position: "relative", height: 24, borderRadius: 12, overflow: "hidden", marginBottom: 8 }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${laminarEnd * 100}%`, backgroundColor: "#22c55e" }} />
        <div style={{ position: "absolute", left: `${laminarEnd * 100}%`, top: 0, bottom: 0, width: `${(transEnd - laminarEnd) * 100}%`, backgroundColor: "#f59e0b" }} />
        <div style={{ position: "absolute", left: `${transEnd * 100}%`, top: 0, bottom: 0, right: 0, backgroundColor: "#ef4444" }} />
        {/* Marker */}
        <div
          style={{
            position: "absolute",
            left: `${rePos * 100}%`,
            top: -4,
            bottom: -4,
            width: 3,
            backgroundColor: "#ffffff",
            borderRadius: 2,
            boxShadow: "0 0 8px rgba(255,255,255,0.5)",
          }}
        />
      </div>

      {/* Labels */}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontFamily: "JetBrains Mono, monospace", color: "#334155", marginTop: 6 }}>
        <span>0</span>
        <span style={{ color: "#22c55e" }}>Laminar ≤ 2300</span>
        <span style={{ color: "#f59e0b" }}>Trans.</span>
        <span style={{ color: "#ef4444" }}>Turbulent ≥ 4000</span>
        <span>{(maxRe / 1000).toFixed(0)}k</span>
      </div>

      <div style={{ marginTop: 12, fontSize: 12, color: "#475569" }}>
        Current:{" "}
        <span style={{ fontFamily: "JetBrains Mono, monospace", color: "#e2e8f0", fontWeight: 600 }}>
          Re = {Re.toFixed(0)}
        </span>
      </div>
    </div>
  );
}
