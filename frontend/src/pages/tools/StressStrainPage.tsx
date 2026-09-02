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
    <div className="max-w-7xl mx-auto py-12 px-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8 text-[13px] text-slate-600">
        <Link to="/tools" className="text-slate-500 hover:text-slate-400 no-underline transition-colors">Tools</Link>
        <span>→</span>
        <span className="text-slate-400">Stress & Strain Calculator</span>
      </div>

      {/* Page header */}
      <div className="mb-9">
        <div className="flex items-center gap-3 mb-2.5">
          <div className="text-[11px] font-mono text-amber-500 tracking-[0.08em]">
            MECHANICS
          </div>
          <div className="w-px h-3 bg-white/10" />
          <div className="text-[11px] text-slate-500">Strength of Materials</div>
        </div>
        <h1 className="font-display text-[clamp(1.5rem,3vw,2rem)] font-bold text-slate-100 mb-2.5 tracking-tight">
          Stress &amp; Strain Calculator
        </h1>
        <p className="text-[15px] text-slate-500 m-0">
          Compute normal stress, axial strain, and deformation for a prismatic bar under axial loading.
        </p>
      </div>

      {/* Concept panel */}
      <ConceptPanel />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-7">
        {/* Input panel */}
        <div className="bg-[#0c1528] border border-white/5 rounded-xl p-7">
          {/* Unit system toggle */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-xs font-mono text-slate-600 tracking-wider">
              INPUT PARAMETERS
            </div>
            <div className="flex bg-[#060b18] rounded-md p-0.5 border border-white/5">
              {(["SI", "Imperial"] as UnitSystem[]).map((sys) => (
                <button
                  key={sys}
                  onClick={() => {
                    setUnits(sys);
                    setInputs(exampleValues[sys]);
                    setErrors({});
                  }}
                  className={`py-1 px-3.5 rounded text-xs font-semibold border-none cursor-pointer transition-all duration-150 focus:outline-none ${
                    units === sys
                      ? "bg-blue-500 text-white shadow-sm"
                      : "bg-transparent text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {sys}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
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
            className="mt-5 py-1.5 px-4 text-xs bg-white/5 border border-white/10 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/10 cursor-pointer transition-colors focus:outline-none"
          >
            Load Example Values
          </button>
        </div>

        {/* Results panel */}
        <div className="flex flex-col gap-4">
          {results ? (
            <>
              <ResultsPanel results={results} units={u} unitSystem={units} />
              <StressBarChart stress={results.stress} />
            </>
          ) : (
            <div className="bg-[#0c1528] border border-white/5 rounded-xl p-10 flex items-center justify-center text-slate-600 text-sm text-center h-full min-h-[200px]">
              Enter valid parameters to compute results.
            </div>
          )}
        </div>
      </div>

      {/* Learn more */}
      <div className="mt-7 py-4 px-5 bg-[#0c1528] border border-white/5 rounded-lg flex items-center gap-4 flex-wrap">
        <span className="text-[13px] text-slate-500">Related:</span>
        <Link to="/formulas" className="text-[13px] text-blue-500 hover:text-blue-400 no-underline transition-colors">Formula Library</Link>
        <Link to="/tools/mohrs-circle" className="text-[13px] text-blue-500 hover:text-blue-400 no-underline transition-colors">Mohr's Circle →</Link>
        <Link to="/learn" className="text-[13px] text-blue-500 hover:text-blue-400 no-underline transition-colors">Strength of Materials Course →</Link>
      </div>
    </div>
  );
}

// ─── Concept Panel ─────────────────────────────────────────────────────────────

function ConceptPanel() {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-[#0c1528] border border-white/5 rounded-xl overflow-hidden transition-colors duration-200">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left py-3.5 px-5 bg-transparent border-none cursor-pointer flex items-center justify-between hover:bg-white/5 transition-colors focus:outline-none"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-semibold text-slate-200 font-display">
            Concept &amp; Governing Equations
          </span>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#475569"
          strokeWidth="2"
          className={`transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="border-t border-white/5 p-5 bg-[#060b18]/50">
          <p className="text-sm text-slate-500 leading-relaxed m-0 mb-4 max-w-3xl">
            When an axial force is applied to a structural member, internal stresses are developed. For a member
            with uniform cross-section, these stresses are uniformly distributed.
          </p>
          <div className="flex gap-3 flex-wrap">
            {["σ = F / A", "ε = σ / E", "δ = ε · L = FL / AE"].map((eq) => (
              <div key={eq} className="py-2 px-4 bg-[#0c1528] border border-white/5 rounded-md font-mono text-sm text-cyan-500">
                {eq}
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {[
              { sym: "σ", desc: "Normal Stress [Pa]" },
              { sym: "ε", desc: "Axial Strain [dimensionless]" },
              { sym: "δ", desc: "Axial Deformation [m]" },
              { sym: "F", desc: "Applied Axial Force [N]" },
              { sym: "A", desc: "Cross-sectional Area [m²]" },
              { sym: "E", desc: "Modulus of Elasticity [Pa]" },
              { sym: "L", desc: "Original Length [m]" },
            ].map((v) => (
              <div key={v.sym} className="flex gap-2.5 items-baseline text-[13px]">
                <span className="font-mono text-cyan-500 min-w-[20px]">{v.sym}</span>
                <span className="text-slate-500">{v.desc}</span>
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
      <div className="flex items-center gap-2 mb-1.5">
        <span className="font-mono text-[13px] text-cyan-500">{symbol}</span>
        <span className="text-[13px] text-slate-500">{label}</span>
      </div>
      <div
        className={`flex items-stretch border rounded-lg overflow-hidden bg-[#060b18] transition-colors focus-within:ring-1 focus-within:ring-cyan-500/50 ${
          error ? "border-red-500/50" : "border-white/10"
        }`}
      >
        <input
          type="number"
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className="flex-1 py-2.5 px-3.5 bg-transparent border-none text-slate-200 text-sm font-mono outline-none"
        />
        <div className="py-2.5 px-3.5 border-l border-white/5 text-xs font-mono text-slate-500 bg-white/5 whitespace-nowrap flex items-center">
          {unit}
        </div>
      </div>
      {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
      {note && !error && <div className="text-[11px] text-slate-600 mt-1">{note}</div>}
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
      color: "border-l-amber-500",
      symColor: "text-amber-500",
    },
    {
      label: "Axial Strain",
      symbol: "ε",
      value: results.strain.toExponential(4),
      unit: "—",
      raw: results.strain.toExponential(4),
      rawUnit: "dimensionless",
      color: "border-l-blue-500",
      symColor: "text-blue-500",
    },
    {
      label: "Deformation",
      symbol: "δ",
      value: fmt(results.deformation, 6),
      unit: units.deformation,
      raw: fmt(results.deformation, 6),
      rawUnit: units.deformation,
      color: "border-l-green-500",
      symColor: "text-green-500",
    },
  ];

  return (
    <div className="bg-[#0c1528] border border-white/5 rounded-xl p-7">
      <div className="text-xs font-mono text-slate-600 tracking-wider mb-5">
        RESULTS
      </div>

      <div className="flex flex-col gap-3">
        {rows.map((r) => (
          <div
            key={r.symbol}
            className={`bg-[#060b18] border border-white/5 border-l-[3px] rounded-r-lg p-3.5 ${r.color}`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className={`font-mono text-[15px] ${r.symColor}`}>{r.symbol}</span>
                <span className="text-[13px] text-slate-500">{r.label}</span>
              </div>
              <div className="font-mono text-lg font-bold text-slate-200">
                {r.value}
                <span className="text-xs text-slate-500 ml-1.5 font-normal">{r.unit}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Validation note */}
      <div className="mt-4 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
        <span className="text-xs text-green-500">All inputs valid — results computed</span>
      </div>
    </div>
  );
}

// ─── Stress Bar Visual ─────────────────────────────────────────────────────────

function StressBarChart({ stress }: { stress: number }) {
  const MPa = stress / 1e6;
  const levels = [
    { label: "Aluminum", yield: 270, color: "bg-purple-500" },
    { label: "Steel (mild)", yield: 250, color: "bg-blue-500" },
    { label: "Steel (high)", yield: 690, color: "bg-cyan-500" },
  ];

  return (
    <div className="bg-[#0c1528] border border-white/5 rounded-xl p-6">
      <div className="text-xs font-mono text-slate-600 tracking-wider mb-4">
        YIELD STRENGTH COMPARISON (MPa)
      </div>
      {levels.map((mat) => {
        const ratio = Math.min(Math.abs(MPa) / mat.yield, 1);
        const stressRatio = Math.min(Math.abs(MPa) / mat.yield, 1.5);
        const overYield = Math.abs(MPa) > mat.yield;
        return (
          <div key={mat.label} className="mb-3.5">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>{mat.label}</span>
              <span className={`font-mono ${overYield ? "text-red-500" : "text-slate-500"}`}>
                σ_y = {mat.yield} MPa {overYield ? "⚠ EXCEEDS YIELD" : ""}
              </span>
            </div>
            <div className="relative h-2 bg-[#060b18] rounded-full overflow-hidden">
              <div
                className={`absolute left-0 top-0 h-full rounded-full transition-all duration-400 ease-out opacity-85 ${
                  overYield ? "bg-red-500" : mat.color
                }`}
                style={{ width: `${ratio * 100}%` }}
              />
              {/* Current stress marker */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-amber-500"
                style={{
                  left: `${Math.min(stressRatio / 1.5, 1) * 100}%`,
                  marginTop: -2,
                  marginBottom: -2,
                }}
              />
            </div>
          </div>
        );
      })}
      <div className="text-[11px] text-slate-500 mt-2">
        Applied stress: <span className="font-mono text-amber-500">{Math.abs(MPa).toFixed(2)} MPa</span>
      </div>
    </div>
  );
}
