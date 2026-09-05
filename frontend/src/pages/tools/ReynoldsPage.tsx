import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { EngineeringValue } from "../../components/EngineeringValue";
import { useDebounce } from "../../hooks/useDebounce";

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
  border: string;
  bg: string;
  critical: string;
} {
  if (Re < 2300)
    return {
      label: "Laminar",
      description: "Smooth, ordered flow. Fluid moves in parallel layers with no disruption between them.",
      color: "text-green-500",
      border: "border-green-500",
      bg: "bg-green-500",
      critical: "Re < 2300",
    };
  if (Re < 4000)
    return {
      label: "Transitional",
      description: "Unstable flow between laminar and turbulent. Neither regime is fully established.",
      color: "text-amber-500",
      border: "border-amber-500",
      bg: "bg-amber-500",
      critical: "2300 ≤ Re < 4000",
    };
  return {
    label: "Turbulent",
    description: "Chaotic, irregular flow with eddies and mixing across the pipe cross-section.",
    color: "text-red-500",
    border: "border-red-500",
    bg: "bg-red-500",
    critical: "Re ≥ 4000",
  };
}

export default function ReynoldsPage() {
  const [inputs, setInputs] = useState<Inputs>({ rho: "998.2", v: "2.5", D: "0.05", mu: "0.001002" });
  const [selectedFluid, setSelectedFluid] = useState(0);

  const debouncedInputs = useDebounce(inputs, 300);

  const Re = useMemo(() => {
    const rho = parseFloat(debouncedInputs.rho);
    const v = parseFloat(debouncedInputs.v);
    const D = parseFloat(debouncedInputs.D);
    const mu = parseFloat(debouncedInputs.mu);
    if ([rho, v, D, mu].some(isNaN) || mu <= 0 || D <= 0 || rho <= 0 || v <= 0) return null;
    return (rho * v * D) / mu;
  }, [debouncedInputs]);

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
    <div className="max-w-7xl mx-auto py-12 px-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8 text-[13px] text-slate-600">
        <Link to="/tools" className="text-slate-500 hover:text-slate-400 no-underline transition-colors">Tools</Link>
        <span>→</span>
        <span className="text-slate-400">Reynolds Number</span>
      </div>

      <div className="mb-9">
        <div className="text-[11px] font-mono text-cyan-500 tracking-[0.08em] mb-2.5">
          FLUIDS · PIPE FLOW
        </div>
        <h1 className="font-display text-[clamp(1.5rem,3vw,2rem)] font-bold text-slate-100 mb-2.5 tracking-tight">
          Reynolds Number Calculator
        </h1>
        <p className="text-[15px] text-slate-500 m-0">
          Determine the flow regime — laminar, transitional, or turbulent — for pipe flow.
        </p>
      </div>

      {/* Formula */}
      <div className="flex gap-3 mb-8 flex-wrap">
        <div className="py-2 px-4 bg-[#0c1528] border border-white/5 rounded-md font-mono text-[15px] text-cyan-500">
          Re = ρ · v · D / μ
        </div>
        <div className="py-2 px-4 bg-[#0c1528] border border-white/5 rounded-md font-mono text-[13px] text-cyan-500 flex items-center">
          ν = μ / ρ &nbsp;&nbsp; Re = v · D / ν
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: inputs */}
        <div className="flex flex-col gap-4">
          {/* Fluid presets */}
          <div className="bg-[#0c1528] border border-white/5 rounded-xl p-6">
            <div className="text-xs font-mono text-slate-600 tracking-wider mb-3.5">
              FLUID PRESETS
            </div>
            <div className="flex flex-col gap-1.5">
              {fluidPresets.map((f, i) => (
                <button
                  key={f.name}
                  onClick={() => applyPreset(i)}
                  className={`py-2 px-3.5 text-left rounded-md cursor-pointer flex items-center justify-between border transition-all focus:outline-none ${
                    selectedFluid === i
                      ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                      : "bg-white/5 border-white/5 text-slate-500 hover:bg-cyan-500/5 hover:border-cyan-500/30 hover:text-cyan-400 hover:shadow-[0_0_10px_rgba(6,182,212,0.1)]"
                  }`}
                >
                  <span className="text-[13px]">{f.name}</span>
                  <span className="font-mono text-[11px] opacity-70">
                    μ={f.mu} Pa·s
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Parameters */}
          <div className="bg-[#0c1528] border border-white/5 rounded-xl p-6">
            <div className="text-xs font-mono text-slate-600 tracking-wider mb-4">
              FLOW PARAMETERS
            </div>
            <div className="flex flex-col gap-3.5">
              {([
                { key: "rho", sym: "ρ", label: "Fluid Density", unit: "kg/m³", placeholder: "e.g. 998.2" },
                { key: "v", sym: "v", label: "Mean Velocity", unit: "m/s", placeholder: "e.g. 2.5" },
                { key: "D", sym: "D", label: "Pipe Diameter", unit: "m", placeholder: "e.g. 0.05" },
                { key: "mu", sym: "μ", label: "Dynamic Viscosity", unit: "Pa·s", placeholder: "e.g. 0.001002" },
              ] as const).map((f) => (
                <div key={f.key}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono text-sm text-cyan-500 min-w-[20px]">{f.sym}</span>
                    <span className="text-xs text-slate-500">{f.label}</span>
                  </div>
                  <div className="flex border border-white/10 rounded-lg overflow-hidden bg-[#060b18] focus-within:ring-1 focus-within:ring-cyan-500/50 transition-colors">
                    <input
                      type="number"
                      value={inputs[f.key]}
                      onChange={setInput(f.key)}
                      placeholder={f.placeholder}
                      className="flex-1 py-2.5 px-3 bg-transparent border-none text-slate-200 text-sm font-mono outline-none"
                    />
                    <div className="py-2.5 px-3 border-l border-white/5 text-[11px] font-mono text-slate-500 bg-white/5 whitespace-nowrap flex items-center">
                      {f.unit}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: result */}
        <div className="flex flex-col gap-4">
          {Re !== null && regime ? (
            <>
              {/* Main Re result */}
              <div
                className={`bg-[#0c1528] border border-white/5 rounded-xl p-8 text-center border-t-[3px] ${regime.border}`}
                style={{ borderTopColor: regime.border }}
              >
                <div className="text-[11px] font-mono text-slate-500 tracking-widest mb-4">
                  REYNOLDS NUMBER
                </div>
                <div className="font-mono text-[clamp(2.5rem,6vw,4rem)] font-bold text-slate-100 tracking-tight leading-none mb-2 overflow-hidden flex justify-center w-full">
                  <EngineeringValue
                    value={Re}
                    unit=""
                    precision={0}
                    valueClassName="text-[clamp(1.5rem,4vw,3.5rem)]"
                  />
                </div>
                <div className="text-xs text-slate-500 mb-6">dimensionless</div>

                {/* Flow regime badge */}
                <div
                  className={`inline-flex items-center gap-2 py-2 px-5 rounded-full border ${regime.border} bg-white/5 border-opacity-30`}
                >
                  <span className={`w-2 h-2 rounded-full ${regime.bg}`} />
                  <span className={`font-display text-lg font-bold ${regime.color}`}>
                    {regime.label} Flow
                  </span>
                </div>

                <p className="text-sm text-slate-500 leading-relaxed mt-4 mb-0 mx-auto max-w-sm">
                  {regime.description}
                </p>
              </div>

              {/* Flow regime scale */}
              <div className="bg-[#0c1528] border border-white/5 rounded-xl p-6">
                <div className="text-xs font-mono text-slate-600 tracking-wider mb-4">
                  FLOW REGIME SCALE
                </div>
                <FlowRegimeScale Re={Re} />
              </div>

              {/* Summary table */}
              <div className="bg-[#0c1528] border border-white/5 rounded-xl p-6">
                <div className="text-xs font-mono text-slate-600 tracking-wider mb-4">
                  COMPUTED VALUES
                </div>
                <div className="flex flex-col gap-1">
                  {[
                    { label: "Reynolds Number", val: <EngineeringValue value={Re} unit="" precision={1} valueClassName="inline" />, sym: "Re" },
                    { label: "Kinematic Viscosity", val: <EngineeringValue value={parseFloat(debouncedInputs.mu) / parseFloat(debouncedInputs.rho)} unit="" precision={4} valueClassName="inline" />, sym: "ν", unit: "m²/s" },
                    { label: "Flow Regime", val: regime.label, sym: "—", colored: regime.color },
                    { label: "Critical Re Range", val: regime.critical, sym: "—" },
                  ].map((r) => (
                    <div
                      key={r.sym + r.label}
                      className="flex justify-between items-center py-2 border-b border-white/5 text-[13px] last:border-0"
                    >
                      <span className="text-slate-500">{r.label}</span>
                      <span className={`font-mono font-semibold ${r.colored ?? "text-slate-200"}`}>
                        {r.val} {r.unit ?? ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-[#0c1528] border border-white/5 rounded-xl p-10 flex items-center justify-center text-slate-500 text-sm h-full min-h-[200px]">
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
      <div className="relative h-6 rounded-full overflow-hidden mb-2">
        <div className="absolute left-0 top-0 bottom-0 bg-green-500" style={{ width: `${laminarEnd * 100}%` }} />
        <div className="absolute top-0 bottom-0 bg-amber-500" style={{ left: `${laminarEnd * 100}%`, width: `${(transEnd - laminarEnd) * 100}%` }} />
        <div className="absolute top-0 bottom-0 right-0 bg-red-500" style={{ left: `${transEnd * 100}%` }} />
        {/* Marker */}
        <div
          className="absolute bg-white rounded-sm shadow-[0_0_8px_rgba(255,255,255,0.5)]"
          style={{
            left: `${rePos * 100}%`,
            top: -4,
            bottom: -4,
            width: 3,
          }}
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between text-[11px] font-mono text-slate-500 mt-1.5">
        <span>0</span>
        <span className="text-green-500">Laminar ≤ 2300</span>
        <span className="text-amber-500">Trans.</span>
        <span className="text-red-500">Turbulent ≥ 4000</span>
        <span>{(maxRe / 1000).toFixed(0)}k</span>
      </div>

      <div className="mt-3 text-xs text-slate-500 flex items-center gap-1">
        Current:{" "}
        <span className="font-mono text-slate-200 font-semibold flex items-center gap-1">
          Re = <EngineeringValue value={Re} unit="" precision={0} valueClassName="text-xs" />
        </span>
      </div>
    </div>
  );
}
