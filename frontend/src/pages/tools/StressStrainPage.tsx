import { useState } from "react";
import { Link } from "react-router-dom";

type UnitSystem = "SI" | "Imperial";

interface Inputs {
  force: string;
  area: string;
  modulus: string;
  length: string;
}

interface Results {
  stress: number;
  strain: number;
  deformation: number;
}

const unitLabels: Record<UnitSystem, { force: string; area: string; modulus: string; length: string; stress: string; deformation: string }> = {
  SI: { force: "N", area: "m²", modulus: "GPa", length: "m", stress: "Pa", deformation: "m" },
  Imperial: { force: "lbf", area: "in²", modulus: "psi", length: "in", stress: "psi", deformation: "in" },
};

const exampleValues: Record<UnitSystem, Inputs> = {
  SI: { force: "50000", area: "0.002", modulus: "200", length: "1.5" },
  Imperial: { force: "10000", area: "0.5", modulus: "29000000", length: "60" },
};

function calculate(inputs: Inputs, units: UnitSystem): Results | null {
  const F = parseFloat(inputs.force);
  const A = parseFloat(inputs.area);
  const E_raw = parseFloat(inputs.modulus);
  const L = parseFloat(inputs.length);

  if ([F, A, E_raw, L].some(isNaN)) return null;
  if (A <= 0 || E_raw <= 0 || L <= 0) return null;

  // Convert modulus: SI given in GPa → Pa; Imperial stays as psi
  const E = units === "SI" ? E_raw * 1e9 : E_raw;

  const stress = F / A;
  const strain = stress / E;
  const deformation = strain * L;

  return { stress, strain, deformation };
}

function fmt(n: number, decimals = 4): string {
  if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(3) + "G";
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(3) + "M";
  if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(3) + "k";
  return n.toFixed(decimals);
}

export default function StressStrainPage() {
  const [units, setUnits] = useState<UnitSystem>("SI");
  const [inputs, setInputs] = useState<Inputs>(exampleValues.SI);
  const [errors, setErrors] = useState<Partial<Inputs>>({});

  const u = unitLabels[units];
  const results = calculate(inputs, units);

  const setInput = (key: keyof Inputs) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputs((prev) => ({ ...prev, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validateInput = (key: keyof Inputs) => () => {
    const val = parseFloat(inputs[key]);
    if (isNaN(val)) {
      setErrors((prev) => ({ ...prev, [key]: "Invalid number" }));
    } else if (key !== "force" && val <= 0) {
      setErrors((prev) => ({ ...prev, [key]: "Must be positive" }));
    }
  };

  const loadExample = () => {
    setInputs(exampleValues[units]);
    setErrors({});
  };

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 24px" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32, fontSize: 13, color: "#334155" }}>
        <Link to="/tools" style={{ color: "#475569", textDecoration: "none" }}>Tools</Link>
        <span>→</span>
        <span style={{ color: "#64748b" }}>Stress & Strain Calculator</span>
      </div>

      {/* Page header */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", color: "#f59e0b", letterSpacing: "0.08em" }}>
            MECHANICS
          </div>
          <div style={{ width: 1, height: 12, backgroundColor: "rgba(255,255,255,0.1)" }} />
          <div style={{ fontSize: 11, color: "#334155" }}>Strength of Materials</div>
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
          Stress &amp; Strain Calculator
        </h1>
        <p style={{ fontSize: 15, color: "#475569", margin: 0 }}>
          Compute normal stress, axial strain, and deformation for a prismatic bar under axial loading.
        </p>
      </div>

      {/* Concept panel */}
      <ConceptPanel />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 28 }}>
        {/* Input panel */}
        <div
          style={{
            backgroundColor: "#0c1528",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 12,
            padding: 28,
          }}
        >
          {/* Unit system toggle */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontFamily: "JetBrains Mono, monospace", color: "#334155", letterSpacing: "0.06em" }}>
              INPUT PARAMETERS
            </div>
            <div style={{ display: "flex", backgroundColor: "#060b18", borderRadius: 6, padding: 2, border: "1px solid rgba(255,255,255,0.06)" }}>
              {(["SI", "Imperial"] as UnitSystem[]).map((sys) => (
                <button
                  key={sys}
                  onClick={() => {
                    setUnits(sys);
                    setInputs(exampleValues[sys]);
                    setErrors({});
                  }}
                  style={{
                    padding: "5px 14px",
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    backgroundColor: units === sys ? "#3b82f6" : "transparent",
                    color: units === sys ? "#fff" : "#475569",
                    transition: "all 0.15s ease",
                  }}
                >
                  {sys}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <InputField
              label="Applied Force"
              symbol="F"
              value={inputs.force}
              unit={u.force}
              error={errors.force}
              onChange={setInput("force")}
              onBlur={validateInput("force")}
              placeholder="e.g. 50000"
            />
            <InputField
              label="Cross-sectional Area"
              symbol="A"
              value={inputs.area}
              unit={u.area}
              error={errors.area}
              onChange={setInput("area")}
              onBlur={validateInput("area")}
              placeholder="e.g. 0.002"
              note="Must be positive"
            />
            <InputField
              label="Young's Modulus"
              symbol="E"
              value={inputs.modulus}
              unit={units === "SI" ? "GPa" : u.modulus}
              error={errors.modulus}
              onChange={setInput("modulus")}
              onBlur={validateInput("modulus")}
              placeholder={units === "SI" ? "e.g. 200 (Steel)" : "e.g. 29000000"}
            />
            <InputField
              label="Original Length"
              symbol="L"
              value={inputs.length}
              unit={u.length}
              error={errors.length}
              onChange={setInput("length")}
              onBlur={validateInput("length")}
              placeholder="e.g. 1.5"
            />
          </div>

          <button
            onClick={loadExample}
            style={{
              marginTop: 20,
              padding: "7px 16px",
              fontSize: 12,
              backgroundColor: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 6,
              color: "#64748b",
              cursor: "pointer",
            }}
          >
            Load Example Values
          </button>
        </div>

        {/* Results panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {results ? (
            <>
              <ResultsPanel results={results} units={u} unitSystem={units} />
              <StressBarChart stress={results.stress} />
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
                textAlign: "center",
              }}
            >
              Enter valid parameters to compute results.
            </div>
          )}
        </div>
      </div>

      {/* Learn more */}
      <div style={{ marginTop: 28, padding: "16px 20px", backgroundColor: "#0c1528", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, color: "#475569" }}>Related:</span>
        <Link to="/formulas" style={{ fontSize: 13, color: "#3b82f6", textDecoration: "none" }}>Formula Library</Link>
        <Link to="/tools/mohrs-circle" style={{ fontSize: 13, color: "#3b82f6", textDecoration: "none" }}>Mohr's Circle →</Link>
        <Link to="/learn" style={{ fontSize: 13, color: "#3b82f6", textDecoration: "none" }}>Strength of Materials Course →</Link>
      </div>
    </div>
  );
}

// ─── Concept Panel ─────────────────────────────────────────────────────────────

function ConceptPanel() {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        backgroundColor: "#0c1528",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 10,
        overflow: "hidden",
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          textAlign: "left",
          padding: "14px 20px",
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", fontFamily: "DM Sans, system-ui, sans-serif" }}>
            Concept &amp; Governing Equations
          </span>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: 20 }}>
          <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7, margin: "0 0 16px" }}>
            When an axial force is applied to a structural member, internal stresses are developed. For a member
            with uniform cross-section, these stresses are uniformly distributed.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {["σ = F / A", "ε = σ / E", "δ = ε · L = FL / AE"].map((eq) => (
              <div key={eq} className="formula-display" style={{ padding: "8px 16px", fontSize: 14 }}>
                {eq}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
            {[
              { sym: "σ", desc: "Normal Stress [Pa]" },
              { sym: "ε", desc: "Axial Strain [dimensionless]" },
              { sym: "δ", desc: "Axial Deformation [m]" },
              { sym: "F", desc: "Applied Axial Force [N]" },
              { sym: "A", desc: "Cross-sectional Area [m²]" },
              { sym: "E", desc: "Modulus of Elasticity [Pa]" },
              { sym: "L", desc: "Original Length [m]" },
            ].map((v) => (
              <div key={v.sym} style={{ display: "flex", gap: 10, alignItems: "baseline", fontSize: 13 }}>
                <span style={{ fontFamily: "JetBrains Mono, monospace", color: "#06b6d4", minWidth: 20 }}>{v.sym}</span>
                <span style={{ color: "#475569" }}>{v.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Input Field ───────────────────────────────────────────────────────────────

function InputField({
  label,
  symbol,
  value,
  unit,
  error,
  note,
  placeholder,
  onChange,
  onBlur,
}: {
  label: string;
  symbol: string;
  value: string;
  unit: string;
  error?: string;
  note?: string;
  placeholder: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
}) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13, color: "#06b6d4" }}>{symbol}</span>
        <span style={{ fontSize: 13, color: "#64748b" }}>{label}</span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          border: `1px solid ${error ? "#ef4444" : "rgba(255,255,255,0.08)"}`,
          borderRadius: 8,
          overflow: "hidden",
          backgroundColor: "#060b18",
          transition: "border-color 0.15s ease",
        }}
      >
        <input
          type="number"
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          style={{
            flex: 1,
            padding: "10px 14px",
            background: "none",
            border: "none",
            color: "#e2e8f0",
            fontSize: 14,
            fontFamily: "JetBrains Mono, monospace",
            outline: "none",
          }}
        />
        <div
          style={{
            padding: "10px 14px",
            borderLeft: "1px solid rgba(255,255,255,0.06)",
            fontSize: 12,
            fontFamily: "JetBrains Mono, monospace",
            color: "#334155",
            backgroundColor: "rgba(255,255,255,0.02)",
            whiteSpace: "nowrap",
          }}
        >
          {unit}
        </div>
      </div>
      {error && <div style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>{error}</div>}
      {note && !error && <div style={{ fontSize: 11, color: "#334155", marginTop: 4 }}>{note}</div>}
    </div>
  );
}

// ─── Results Panel ─────────────────────────────────────────────────────────────

function ResultsPanel({
  results,
  units,
  unitSystem,
}: {
  results: Results;
  units: (typeof unitLabels)["SI"];
  unitSystem: UnitSystem;
}) {
  const rows = [
    {
      label: "Normal Stress",
      symbol: "σ",
      value: unitSystem === "SI" ? fmt(results.stress / 1e6, 3) : fmt(results.stress, 2),
      unit: unitSystem === "SI" ? "MPa" : "psi",
      raw: fmt(results.stress),
      rawUnit: units.stress,
      color: "#f59e0b",
    },
    {
      label: "Axial Strain",
      symbol: "ε",
      value: results.strain.toExponential(4),
      unit: "—",
      raw: results.strain.toExponential(4),
      rawUnit: "dimensionless",
      color: "#3b82f6",
    },
    {
      label: "Deformation",
      symbol: "δ",
      value: fmt(results.deformation, 6),
      unit: units.deformation,
      raw: fmt(results.deformation, 6),
      rawUnit: units.deformation,
      color: "#22c55e",
    },
  ];

  return (
    <div
      style={{
        backgroundColor: "#0c1528",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 12,
        padding: 28,
      }}
    >
      <div style={{ fontSize: 12, fontFamily: "JetBrains Mono, monospace", color: "#334155", letterSpacing: "0.06em", marginBottom: 20 }}>
        RESULTS
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {rows.map((r) => (
          <div
            key={r.symbol}
            style={{
              backgroundColor: "#060b18",
              border: "1px solid rgba(255,255,255,0.05)",
              borderLeft: `3px solid ${r.color}`,
              borderRadius: "0 8px 8px 0",
              padding: "14px 16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 15, color: r.color }}>{r.symbol}</span>
                <span style={{ fontSize: 13, color: "#64748b" }}>{r.label}</span>
              </div>
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 18, fontWeight: 700, color: "#e2e8f0" }}>
                {r.value}
                <span style={{ fontSize: 12, color: "#334155", marginLeft: 6, fontWeight: 400 }}>{r.unit}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Validation note */}
      <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#22c55e" }} />
        <span style={{ fontSize: 12, color: "#22c55e" }}>All inputs valid — results computed</span>
      </div>
    </div>
  );
}

// ─── Stress Bar Visual ─────────────────────────────────────────────────────────

function StressBarChart({ stress }: { stress: number }) {
  const MPa = stress / 1e6;
  const levels = [
    { label: "Aluminum", yield: 270, color: "#a78bfa" },
    { label: "Steel (mild)", yield: 250, color: "#3b82f6" },
    { label: "Steel (high)", yield: 690, color: "#06b6d4" },
  ];

  return (
    <div
      style={{
        backgroundColor: "#0c1528",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 12,
        padding: 24,
      }}
    >
      <div style={{ fontSize: 12, fontFamily: "JetBrains Mono, monospace", color: "#334155", letterSpacing: "0.06em", marginBottom: 16 }}>
        YIELD STRENGTH COMPARISON (MPa)
      </div>
      {levels.map((mat) => {
        const ratio = Math.min(Math.abs(MPa) / mat.yield, 1);
        const stressRatio = Math.min(Math.abs(MPa) / mat.yield, 1.5);
        const overYield = Math.abs(MPa) > mat.yield;
        return (
          <div key={mat.label} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#475569", marginBottom: 4 }}>
              <span>{mat.label}</span>
              <span style={{ fontFamily: "JetBrains Mono, monospace", color: overYield ? "#ef4444" : "#64748b" }}>
                σ_y = {mat.yield} MPa {overYield ? "⚠ EXCEEDS YIELD" : ""}
              </span>
            </div>
            <div style={{ position: "relative", height: 8, backgroundColor: "#060b18", borderRadius: 4, overflow: "hidden" }}>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  height: "100%",
                  width: `${ratio * 100}%`,
                  backgroundColor: overYield ? "#ef4444" : mat.color,
                  borderRadius: 4,
                  transition: "width 0.4s ease",
                  opacity: 0.85,
                }}
              />
              {/* Current stress marker */}
              <div
                style={{
                  position: "absolute",
                  left: `${Math.min(stressRatio / 1.5, 1) * 100}%`,
                  top: -2,
                  bottom: -2,
                  width: 2,
                  backgroundColor: "#f59e0b",
                }}
              />
            </div>
          </div>
        );
      })}
      <div style={{ fontSize: 11, color: "#334155", marginTop: 8 }}>
        Applied stress: <span style={{ fontFamily: "JetBrains Mono, monospace", color: "#f59e0b" }}>{Math.abs(MPa).toFixed(2)} MPa</span>
      </div>
    </div>
  );
}
