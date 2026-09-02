import { useState, useMemo } from "react";
import { Link } from "react-router-dom";

type TargetUnknown = "p2" | "v2" | "z2";

const fluidPresets = [
  { name: "Water (20°C)", rho: 998.2 },
  { name: "Air (20°C)", rho: 1.204 },
  { name: "Engine Oil", rho: 870.0 },
  { name: "Gasoline", rho: 720.0 },
  { name: "Mercury (20°C)", rho: 13546.0 },
];

const G = 9.80665; // m/s^2

interface Inputs {
  density: string;
  p1: string; // kPa
  v1: string; // m/s
  z1: string; // m
  p2: string; // kPa
  v2: string; // m/s
  z2: string; // m
}

interface BernoulliResults {
  target: TargetUnknown;
  solvedValue: number;
  solvedUnit: string;
  totalHead: number; // m
  station1: {
    pressureHead: number;
    velocityHead: number;
    elevationHead: number;
    totalHead: number;
    staticPressurePa: number;
    dynamicPressurePa: number;
  };
  station2: {
    pressureHead: number;
    velocityHead: number;
    elevationHead: number;
    totalHead: number;
    staticPressurePa: number;
    dynamicPressurePa: number;
  };
}

function calculateBernoulli(inputs: Inputs, target: TargetUnknown): BernoulliResults | null {
  const rho = parseFloat(inputs.density);
  const p1_kpa = parseFloat(inputs.p1);
  const v1 = parseFloat(inputs.v1);
  const z1 = parseFloat(inputs.z1);

  if ([rho, p1_kpa, v1, z1].some(isNaN) || rho <= 0 || v1 < 0) return null;

  const p1 = p1_kpa * 1000; // Pa

  // Station 1 energy
  const dyn1 = 0.5 * rho * v1 * v1;
  const pot1 = rho * G * z1;
  const totalPressure1 = p1 + dyn1 + pot1;
  const totalHead = totalPressure1 / (rho * G);

  let p2 = 0;
  let v2 = 0;
  let z2 = 0;
  let solvedValue = 0;
  let solvedUnit = "";

  if (target === "p2") {
    v2 = parseFloat(inputs.v2);
    z2 = parseFloat(inputs.z2);
    if (isNaN(v2) || isNaN(z2) || v2 < 0) return null;

    const dyn2 = 0.5 * rho * v2 * v2;
    const pot2 = rho * G * z2;
    p2 = totalPressure1 - dyn2 - pot2;
    solvedValue = p2 / 1000; // in kPa
    solvedUnit = "kPa";
  } else if (target === "v2") {
    const p2_kpa = parseFloat(inputs.p2);
    z2 = parseFloat(inputs.z2);
    if (isNaN(p2_kpa) || isNaN(z2)) return null;

    p2 = p2_kpa * 1000;
    const pot2 = rho * G * z2;
    const v2Squared = (totalPressure1 - p2 - pot2) / (0.5 * rho);
    if (v2Squared < 0) return null; // Physically impossible under frictionless assumption

    v2 = Math.sqrt(v2Squared);
    solvedValue = v2;
    solvedUnit = "m/s";
  } else if (target === "z2") {
    const p2_kpa = parseFloat(inputs.p2);
    v2 = parseFloat(inputs.v2);
    if (isNaN(p2_kpa) || isNaN(v2) || v2 < 0) return null;

    p2 = p2_kpa * 1000;
    const dyn2 = 0.5 * rho * v2 * v2;
    z2 = (totalPressure1 - p2 - dyn2) / (rho * G);
    solvedValue = z2;
    solvedUnit = "m";
  }

  const dyn2 = 0.5 * rho * v2 * v2;

  return {
    target,
    solvedValue,
    solvedUnit,
    totalHead,
    station1: {
      pressureHead: p1 / (rho * G),
      velocityHead: dyn1 / (rho * G),
      elevationHead: z1,
      totalHead,
      staticPressurePa: p1,
      dynamicPressurePa: dyn1,
    },
    station2: {
      pressureHead: p2 / (rho * G),
      velocityHead: dyn2 / (rho * G),
      elevationHead: z2,
      totalHead,
      staticPressurePa: p2,
      dynamicPressurePa: dyn2,
    },
  };
}

export default function BernoulliPage() {
  const [target, setTarget] = useState<TargetUnknown>("p2");
  const [inputs, setInputs] = useState<Inputs>({
    density: "998.2",
    p1: "200",
    v1: "2.0",
    z1: "1.0",
    p2: "150",
    v2: "4.5",
    z2: "3.0",
  });
  const [selectedFluid, setSelectedFluid] = useState(0);

  const results = useMemo(() => calculateBernoulli(inputs, target), [inputs, target]);

  const setInput = (key: keyof Inputs) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputs((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const applyPreset = (idx: number) => {
    setSelectedFluid(idx);
    setInputs((prev) => ({ ...prev, density: fluidPresets[idx].rho.toString() }));
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8 text-[13px] text-slate-600">
        <Link to="/tools" className="text-slate-500 hover:text-slate-400 no-underline transition-colors">
          Tools
        </Link>
        <span>→</span>
        <span className="text-slate-400">Bernoulli Equation</span>
      </div>

      {/* Header */}
      <div className="mb-9">
        <div className="flex items-center gap-3 mb-2.5">
          <div className="text-[11px] font-mono text-cyan-500 tracking-[0.08em]">
            FLUID MECHANICS · ENERGY CONSERVATION
          </div>
          <div className="w-px h-3 bg-white/10" />
          <div className="text-[11px] text-slate-500">Streamline Flow</div>
        </div>
        <h1 className="font-display text-[clamp(1.5rem,3vw,2rem)] font-bold text-slate-100 mb-2.5 tracking-tight">
          Bernoulli Flow Calculator
        </h1>
        <p className="text-[15px] text-slate-500 m-0">
          Solve Bernoulli's energy equation along a streamline for steady, incompressible, and inviscid flow.
        </p>
      </div>

      {/* Formulas Header */}
      <div className="flex flex-wrap gap-3 mb-8">
        <div className="py-2 px-4 bg-[#0c1528] border border-white/5 rounded-md font-mono text-[14px] text-cyan-500">
          P₁ + ½ρv₁² + ρgz₁ = P₂ + ½ρv₂² + ρgz₂
        </div>
        <div className="py-2 px-4 bg-[#0c1528] border border-white/5 rounded-md font-mono text-[13px] text-slate-400 flex items-center">
          H = P/(ρg) + v²/(2g) + z = Const.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Inputs Panel */}
        <div className="flex flex-col gap-5">
          {/* Target Unknown Selector */}
          <div className="bg-[#0c1528] border border-white/5 rounded-xl p-6">
            <div className="text-xs font-mono text-slate-600 tracking-wider mb-3">
              SELECT TARGET UNKNOWN TO SOLVE
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: "p2", label: "Pressure (P₂)", desc: "Static Pressure" },
                { key: "v2", label: "Velocity (v₂)", desc: "Flow Speed" },
                { key: "z2", label: "Elevation (z₂)", desc: "Height" },
              ].map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTarget(t.key as TargetUnknown)}
                  className={`p-3 rounded-lg text-left border transition-all cursor-pointer focus:outline-none ${
                    target === t.key
                      ? "bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-sm"
                      : "bg-[#060b18] border-white/5 text-slate-500 hover:bg-white/5"
                  }`}
                >
                  <div className="text-xs font-bold font-mono mb-0.5">{t.label}</div>
                  <div className="text-[11px] opacity-70">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Fluid Density */}
          <div className="bg-[#0c1528] border border-white/5 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs font-mono text-slate-600 tracking-wider">
                FLUID DENSITY (ρ)
              </div>
              <div className="flex gap-1">
                {fluidPresets.slice(0, 3).map((f, i) => (
                  <button
                    key={f.name}
                    type="button"
                    onClick={() => applyPreset(i)}
                    className={`py-1 px-2.5 text-[11px] rounded transition-colors cursor-pointer border ${
                      selectedFluid === i
                        ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/40"
                        : "bg-white/5 text-slate-500 border-white/5 hover:bg-white/10"
                    }`}
                  >
                    {f.name.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex border border-white/10 rounded-lg overflow-hidden bg-[#060b18] focus-within:ring-1 focus-within:ring-cyan-500/50">
              <input
                type="number"
                value={inputs.density}
                onChange={setInput("density")}
                className="flex-1 py-2.5 px-3 bg-transparent border-none text-slate-200 text-sm font-mono outline-none"
                placeholder="e.g. 998.2"
              />
              <div className="py-2.5 px-3 border-l border-white/5 text-xs font-mono text-slate-500 bg-white/5">
                kg/m³
              </div>
            </div>
          </div>

          {/* Station 1 Parameters */}
          <div className="bg-[#0c1528] border border-white/5 rounded-xl p-6">
            <div className="text-xs font-mono text-slate-600 tracking-wider mb-4">
              STATION 1 PARAMETERS (INLET)
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-500 mb-1.5 block">Pressure (P₁)</label>
                <div className="flex border border-white/10 rounded-lg overflow-hidden bg-[#060b18] focus-within:ring-1 focus-within:ring-cyan-500/50">
                  <input
                    type="number"
                    value={inputs.p1}
                    onChange={setInput("p1")}
                    className="w-full py-2 px-2.5 bg-transparent border-none text-slate-200 text-xs font-mono outline-none"
                    placeholder="kPa"
                  />
                  <span className="py-2 px-2 text-[10px] font-mono text-slate-500 bg-white/5 border-l border-white/5">
                    kPa
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-1.5 block">Velocity (v₁)</label>
                <div className="flex border border-white/10 rounded-lg overflow-hidden bg-[#060b18] focus-within:ring-1 focus-within:ring-cyan-500/50">
                  <input
                    type="number"
                    value={inputs.v1}
                    onChange={setInput("v1")}
                    className="w-full py-2 px-2.5 bg-transparent border-none text-slate-200 text-xs font-mono outline-none"
                    placeholder="m/s"
                  />
                  <span className="py-2 px-2 text-[10px] font-mono text-slate-500 bg-white/5 border-l border-white/5">
                    m/s
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-1.5 block">Elevation (z₁)</label>
                <div className="flex border border-white/10 rounded-lg overflow-hidden bg-[#060b18] focus-within:ring-1 focus-within:ring-cyan-500/50">
                  <input
                    type="number"
                    value={inputs.z1}
                    onChange={setInput("z1")}
                    className="w-full py-2 px-2.5 bg-transparent border-none text-slate-200 text-xs font-mono outline-none"
                    placeholder="m"
                  />
                  <span className="py-2 px-2 text-[10px] font-mono text-slate-500 bg-white/5 border-l border-white/5">
                    m
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Station 2 Parameters */}
          <div className="bg-[#0c1528] border border-white/5 rounded-xl p-6">
            <div className="text-xs font-mono text-slate-600 tracking-wider mb-4">
              STATION 2 PARAMETERS (OUTLET)
            </div>
            <div className="grid grid-cols-3 gap-3">
              {target !== "p2" ? (
                <div>
                  <label className="text-xs text-slate-500 mb-1.5 block">Pressure (P₂)</label>
                  <div className="flex border border-white/10 rounded-lg overflow-hidden bg-[#060b18] focus-within:ring-1 focus-within:ring-cyan-500/50">
                    <input
                      type="number"
                      value={inputs.p2}
                      onChange={setInput("p2")}
                      className="w-full py-2 px-2.5 bg-transparent border-none text-slate-200 text-xs font-mono outline-none"
                      placeholder="kPa"
                    />
                    <span className="py-2 px-2 text-[10px] font-mono text-slate-500 bg-white/5 border-l border-white/5">
                      kPa
                    </span>
                  </div>
                </div>
              ) : (
                <div className="opacity-50 pointer-events-none">
                  <label className="text-xs text-cyan-400 mb-1.5 block">P₂ (Solving...)</label>
                  <div className="py-2 px-3 bg-cyan-500/5 border border-cyan-500/20 rounded-lg text-xs font-mono text-cyan-400">
                    Calculated
                  </div>
                </div>
              )}

              {target !== "v2" ? (
                <div>
                  <label className="text-xs text-slate-500 mb-1.5 block">Velocity (v₂)</label>
                  <div className="flex border border-white/10 rounded-lg overflow-hidden bg-[#060b18] focus-within:ring-1 focus-within:ring-cyan-500/50">
                    <input
                      type="number"
                      value={inputs.v2}
                      onChange={setInput("v2")}
                      className="w-full py-2 px-2.5 bg-transparent border-none text-slate-200 text-xs font-mono outline-none"
                      placeholder="m/s"
                    />
                    <span className="py-2 px-2 text-[10px] font-mono text-slate-500 bg-white/5 border-l border-white/5">
                      m/s
                    </span>
                  </div>
                </div>
              ) : (
                <div className="opacity-50 pointer-events-none">
                  <label className="text-xs text-cyan-400 mb-1.5 block">v₂ (Solving...)</label>
                  <div className="py-2 px-3 bg-cyan-500/5 border border-cyan-500/20 rounded-lg text-xs font-mono text-cyan-400">
                    Calculated
                  </div>
                </div>
              )}

              {target !== "z2" ? (
                <div>
                  <label className="text-xs text-slate-500 mb-1.5 block">Elevation (z₂)</label>
                  <div className="flex border border-white/10 rounded-lg overflow-hidden bg-[#060b18] focus-within:ring-1 focus-within:ring-cyan-500/50">
                    <input
                      type="number"
                      value={inputs.z2}
                      onChange={setInput("z2")}
                      className="w-full py-2 px-2.5 bg-transparent border-none text-slate-200 text-xs font-mono outline-none"
                      placeholder="m"
                    />
                    <span className="py-2 px-2 text-[10px] font-mono text-slate-500 bg-white/5 border-l border-white/5">
                      m
                    </span>
                  </div>
                </div>
              ) : (
                <div className="opacity-50 pointer-events-none">
                  <label className="text-xs text-cyan-400 mb-1.5 block">z₂ (Solving...)</label>
                  <div className="py-2 px-3 bg-cyan-500/5 border border-cyan-500/20 rounded-lg text-xs font-mono text-cyan-400">
                    Calculated
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Results Panel */}
        <div className="flex flex-col gap-5">
          {results ? (
            <>
              {/* Solved Main Value Card */}
              <div className="bg-[#0c1528] border border-cyan-500/30 border-t-[3px] border-t-cyan-500 rounded-xl p-7 text-center">
                <div className="text-[11px] font-mono text-slate-500 tracking-wider mb-3">
                  SOLVED VALUE ({results.target.toUpperCase()})
                </div>
                <div className="font-mono text-4xl sm:text-5xl font-bold text-slate-100 mb-2">
                  {results.solvedValue.toFixed(3)}{" "}
                  <span className="text-lg font-normal text-cyan-400">{results.solvedUnit}</span>
                </div>
                <div className="text-xs text-slate-500">
                  Total Energy Head (H):{" "}
                  <span className="font-mono font-semibold text-slate-300">
                    {results.totalHead.toFixed(2)} m
                  </span>
                </div>
              </div>

              {/* Head Breakdown Comparison */}
              <div className="bg-[#0c1528] border border-white/5 rounded-xl p-6">
                <div className="text-xs font-mono text-slate-600 tracking-wider mb-4">
                  ENERGY HEAD BREAKDOWN (METERS OF FLUID)
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Station 1 */}
                  <div className="bg-[#060b18] p-4 rounded-lg border border-white/5">
                    <div className="text-xs font-semibold text-slate-300 mb-3 font-display">
                      Station 1 (Inlet)
                    </div>
                    <div className="flex flex-col gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Pressure Head (P/γ):</span>
                        <span className="font-mono text-cyan-400">
                          {results.station1.pressureHead.toFixed(2)} m
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Velocity Head (v²/2g):</span>
                        <span className="font-mono text-amber-400">
                          {results.station1.velocityHead.toFixed(2)} m
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Elevation Head (z):</span>
                        <span className="font-mono text-green-400">
                          {results.station1.elevationHead.toFixed(2)} m
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Station 2 */}
                  <div className="bg-[#060b18] p-4 rounded-lg border border-white/5">
                    <div className="text-xs font-semibold text-slate-300 mb-3 font-display">
                      Station 2 (Outlet)
                    </div>
                    <div className="flex flex-col gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Pressure Head (P/γ):</span>
                        <span className="font-mono text-cyan-400">
                          {results.station2.pressureHead.toFixed(2)} m
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Velocity Head (v²/2g):</span>
                        <span className="font-mono text-amber-400">
                          {results.station2.velocityHead.toFixed(2)} m
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Elevation Head (z):</span>
                        <span className="font-mono text-green-400">
                          {results.station2.elevationHead.toFixed(2)} m
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Physical Streamline Summary */}
              <div className="bg-[#0c1528] border border-white/5 rounded-xl p-6">
                <div className="text-xs font-mono text-slate-600 tracking-wider mb-3">
                  DYNAMIC &amp; STATIC PRESSURES
                </div>
                <div className="flex flex-col gap-2 text-xs">
                  <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                    <span className="text-slate-500">Static Pressure at Station 2:</span>
                    <span className="font-mono text-slate-200 font-semibold">
                      {(results.station2.staticPressurePa / 1000).toFixed(2)} kPa
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                    <span className="text-slate-500">Dynamic Pressure at Station 2:</span>
                    <span className="font-mono text-slate-200 font-semibold">
                      {(results.station2.dynamicPressurePa / 1000).toFixed(2)} kPa
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-slate-500">Energy Conservation Status:</span>
                    <span className="font-mono text-green-400 font-semibold">
                      ✓ Conserved (ΔH = 0)
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-[#0c1528] border border-white/5 rounded-xl p-10 flex items-center justify-center text-slate-500 text-sm text-center h-full min-h-[220px]">
              Enter valid parameters to compute Bernoulli flow state.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
