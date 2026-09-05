import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useDebounce } from "../../hooks/useDebounce";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

interface Inputs {
  m: string;
  k: string;
  c: string;
  x0: string;
  v0: string;
}

interface SDOFResults {
  omegaN: number;
  omegaD: number;
  zeta: number;
  Td: number;
  fn: number;
  systemType: string;
  systemColor: string;
  data: { t: number; x: number; envelope?: number; negEnvelope?: number }[];
}

function computeVibration(inputs: Inputs): SDOFResults | null {
  const m = parseFloat(inputs.m);
  const k = parseFloat(inputs.k);
  const c = parseFloat(inputs.c);
  const x0 = parseFloat(inputs.x0);
  const v0 = parseFloat(inputs.v0);

  if ([m, k, c, x0, v0].some(isNaN) || m <= 0 || k <= 0 || c < 0) return null;

  const omegaN = Math.sqrt(k / m);
  const zeta = c / (2 * Math.sqrt(k * m));
  const fn = omegaN / (2 * Math.PI);

  let systemType: string;
  let systemColor: string;
  let omegaD: number;
  let Td: number;

  if (zeta < 0.99999) {
    omegaD = omegaN * Math.sqrt(1 - zeta * zeta);
    Td = (2 * Math.PI) / omegaD;
    systemType = zeta < 0.05 ? "Undamped" : "Underdamped";
    systemColor = "#22c55e"; // green-500
  } else if (zeta < 1.00001) {
    omegaD = 0;
    Td = 2 / omegaN;
    systemType = "Critically Damped";
    systemColor = "#f59e0b"; // amber-500
  } else {
    omegaD = 0;
    Td = 3 / (zeta * omegaN);
    systemType = "Overdamped";
    systemColor = "#ef4444"; // red-500
  }

  // Simulate duration: show enough cycles to see damping
  const duration = Math.min(Math.max(Td * 8, 3 / (zeta * omegaN + 0.01)), 30);
  const steps = 400;
  const dt = duration / steps;

  const data: SDOFResults["data"] = [];

  for (let i = 0; i <= steps; i++) {
    const t = i * dt;
    let x: number;

    if (zeta < 0.99999) {
      // Underdamped
      const omD = omegaN * Math.sqrt(1 - zeta * zeta);
      const A = x0;
      const B = (v0 + zeta * omegaN * x0) / omD;
      x = Math.exp(-zeta * omegaN * t) * (A * Math.cos(omD * t) + B * Math.sin(omD * t));
      const amp = Math.exp(-zeta * omegaN * t) * Math.sqrt(A * A + B * B);
      data.push({ t: parseFloat(t.toFixed(4)), x: parseFloat(x.toFixed(6)), envelope: parseFloat(amp.toFixed(6)), negEnvelope: parseFloat((-amp).toFixed(6)) });
    } else if (zeta < 1.00001) {
      // Critically damped
      const A = x0;
      const B = v0 + omegaN * x0;
      x = (A + B * t) * Math.exp(-omegaN * t);
      data.push({ t: parseFloat(t.toFixed(4)), x: parseFloat(x.toFixed(6)) });
    } else {
      // Overdamped
      const r1 = omegaN * (-zeta + Math.sqrt(zeta * zeta - 1));
      const r2 = omegaN * (-zeta - Math.sqrt(zeta * zeta - 1));
      const A = (v0 - r2 * x0) / (r1 - r2);
      const B = (r1 * x0 - v0) / (r1 - r2);
      x = A * Math.exp(r1 * t) + B * Math.exp(r2 * t);
      data.push({ t: parseFloat(t.toFixed(4)), x: parseFloat(x.toFixed(6)) });
    }
  }

  return { omegaN, omegaD, zeta, Td, fn, systemType, systemColor, data };
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: number }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0c1528] border border-white/10 rounded-md py-2.5 px-3.5 font-mono text-xs shadow-lg">
      <div className="text-slate-500 mb-1">t = {label?.toFixed(3)} s</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color }}>
          {p.name}: {p.value?.toFixed(5)} m
        </div>
      ))}
    </div>
  );
};

export default function VibrationPage() {
  const [inputs, setInputs] = useState<Inputs>({ m: "1", k: "100", c: "2", x0: "0.1", v0: "0" });

  const debouncedInputs = useDebounce(inputs, 300);
  const results = useMemo(() => computeVibration(debouncedInputs), [debouncedInputs]);

  const setInput = (key: keyof Inputs) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputs((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const presets = [
    { label: "Underdamped", vals: { m: "1", k: "100", c: "2", x0: "0.1", v0: "0" } },
    { label: "Critically Damped", vals: { m: "1", k: "100", c: "20", x0: "0.1", v0: "0" } },
    { label: "Overdamped", vals: { m: "1", k: "100", c: "50", x0: "0.1", v0: "0" } },
    { label: "Undamped", vals: { m: "2", k: "200", c: "0", x0: "0.05", v0: "1" } },
  ];

  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8 text-[13px] text-slate-600">
        <Link to="/tools" className="text-slate-500 hover:text-slate-400 no-underline transition-colors">Tools</Link>
        <span>→</span>
        <span className="text-slate-400">Vibration Analysis</span>
      </div>

      <div className="mb-9">
        <div className="text-[11px] font-mono text-purple-400 tracking-[0.08em] mb-2.5">
          DYNAMICS · SDOF SYSTEM
        </div>
        <h1 className="font-display text-[clamp(1.5rem,3vw,2rem)] font-bold text-slate-100 mb-2.5 tracking-tight">
          Vibration Analysis
        </h1>
        <p className="text-[15px] text-slate-500 m-0">
          Single-degree-of-freedom mass-spring-damper system. Free vibration response with time-history chart.
        </p>
      </div>

      {/* Equation */}
      <div className="flex gap-3 mb-8 flex-wrap">
        <div className="py-2 px-4 bg-[#0c1528] border border-white/5 rounded-md font-mono text-[15px] text-purple-400">
          mẍ + cẋ + kx = 0
        </div>
        <div className="py-2 px-4 bg-[#0c1528] border border-white/5 rounded-md font-mono text-[13px] text-purple-400 flex items-center">
          ωn = √(k/m)
        </div>
        <div className="py-2 px-4 bg-[#0c1528] border border-white/5 rounded-md font-mono text-[13px] text-purple-400 flex items-center">
          ζ = c / 2√(km)
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        {/* Left: inputs */}
        <div className="flex flex-col gap-4">
          {/* Presets */}
          <div className="bg-[#0c1528] border border-white/5 rounded-xl p-5">
            <div className="text-xs font-mono text-slate-600 tracking-wider mb-3">
              PRESETS
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {presets.map((p) => (
                <button
                  key={p.label}
                  onClick={() => setInputs(p.vals)}
                  className="py-1.5 px-2 text-center text-[11px] rounded bg-white/5 border border-white/5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/50 hover:shadow-[0_0_10px_rgba(6,182,212,0.2)] transition-all cursor-pointer focus:outline-none"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* System parameters */}
          <div className="bg-[#0c1528] border border-white/5 rounded-xl p-6">
            <div className="text-xs font-mono text-slate-600 tracking-wider mb-4">
              SYSTEM PARAMETERS
            </div>
            <div className="flex flex-col gap-3">
              {([
                { key: "m", sym: "m", label: "Mass", unit: "kg", min: 0 },
                { key: "k", sym: "k", label: "Spring Stiffness", unit: "N/m", min: 0 },
                { key: "c", sym: "c", label: "Damping Coefficient", unit: "N·s/m", min: 0 },
              ] as const).map((f) => (
                <div key={f.key}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono text-[13px] text-purple-400">{f.sym}</span>
                    <span className="text-xs text-slate-500">{f.label}</span>
                  </div>
                  <div className="flex border border-white/10 rounded-lg overflow-hidden bg-[#060b18] focus-within:ring-1 focus-within:ring-purple-500/50 transition-colors">
                    <input
                      type="number"
                      min={f.min}
                      value={inputs[f.key]}
                      onChange={setInput(f.key)}
                      className="flex-1 py-2 px-3 bg-transparent border-none text-slate-200 text-[13px] font-mono outline-none"
                    />
                    <div className="py-2 px-3 border-l border-white/5 text-[11px] font-mono text-slate-500 bg-white/5 whitespace-nowrap">
                      {f.unit}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-white/5 pt-3.5 mt-4">
              <div className="text-[11px] font-mono text-slate-600 tracking-wider mb-3">
                INITIAL CONDITIONS
              </div>
              <div className="flex flex-col gap-3">
                {([
                  { key: "x0", sym: "x₀", label: "Initial Displacement", unit: "m" },
                  { key: "v0", sym: "ẋ₀", label: "Initial Velocity", unit: "m/s" },
                ] as const).map((f) => (
                  <div key={f.key}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-mono text-[13px] text-cyan-500">{f.sym}</span>
                      <span className="text-xs text-slate-500">{f.label}</span>
                    </div>
                    <div className="flex border border-white/10 rounded-lg overflow-hidden bg-[#060b18] focus-within:ring-1 focus-within:ring-cyan-500/50 transition-colors">
                      <input
                        type="number"
                        value={inputs[f.key]}
                        onChange={setInput(f.key)}
                        className="flex-1 py-2 px-3 bg-transparent border-none text-slate-200 text-[13px] font-mono outline-none"
                      />
                      <div className="py-2 px-3 border-l border-white/5 text-[11px] font-mono text-slate-500 bg-white/5">
                        {f.unit}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Results summary */}
          {results && (
            <div
              className="bg-[#0c1528] rounded-xl p-5 border-t-2"
              style={{
                borderColor: results.systemColor,
                borderLeft: `1px solid ${results.systemColor}40`,
                borderRight: `1px solid ${results.systemColor}40`,
                borderBottom: `1px solid ${results.systemColor}40`,
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: results.systemColor }} />
                <span className="font-display text-sm font-bold" style={{ color: results.systemColor }}>
                  {results.systemType}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {[
                  { label: "Natural Frequency", val: results.omegaN, unit: "rad/s", sym: "ωn" },
                  { label: "Natural Freq (Hz)", val: results.fn, unit: "Hz", sym: "fn" },
                  { label: "Damping Ratio", val: results.zeta, unit: "—", sym: "ζ" },
                  ...(results.zeta < 1
                    ? [
                        { label: "Damped Frequency", val: results.omegaD, unit: "rad/s", sym: "ωd" },
                        { label: "Damped Period", val: results.Td, unit: "s", sym: "Td" },
                      ]
                    : []),
                ].map((r) => (
                  <div
                    key={r.sym}
                    className="flex justify-between items-center text-xs py-1.5 border-b border-white/5 last:border-0"
                  >
                    <div className="flex gap-1.5">
                      <span className="font-mono text-cyan-500">{r.sym}</span>
                      <span className="text-slate-500">{r.label}</span>
                    </div>
                    <span className="font-mono text-slate-200 font-semibold flex items-center gap-1">
                      <EngineeringValue value={r.val} unit="" precision={3} valueClassName="inline text-xs" />
                      <span className="text-slate-500 font-normal">{r.unit}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: chart */}
        <div className="flex flex-col gap-4">
          <div className="bg-[#0c1528] border border-white/5 rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="text-xs font-mono text-slate-600 tracking-wider">
                TIME-HISTORY RESPONSE · x(t)
              </div>
              {results && (
                <span
                  className="text-[11px] py-1 px-2.5 rounded font-mono border"
                  style={{
                    backgroundColor: `${results.systemColor}15`,
                    color: results.systemColor,
                    borderColor: `${results.systemColor}30`,
                  }}
                >
                  {results.systemType}
                </span>
              )}
            </div>

            {results ? (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={results.data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.04)" />
                  <XAxis
                    dataKey="t"
                    stroke="#334155"
                    tick={{ fill: "#475569", fontSize: 11, fontFamily: "JetBrains Mono, monospace" }}
                    label={{ value: "t [s]", position: "insideBottomRight", offset: -4, fill: "#475569", fontSize: 11, fontFamily: "JetBrains Mono, monospace" }}
                  />
                  <YAxis
                    stroke="#334155"
                    tick={{ fill: "#475569", fontSize: 11, fontFamily: "JetBrains Mono, monospace" }}
                    label={{ value: "x(t) [m]", angle: -90, position: "insideLeft", offset: 12, fill: "#475569", fontSize: 11, fontFamily: "JetBrains Mono, monospace" }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
                  {results.data[0]?.envelope !== undefined && (
                    <>
                      <Line
                        type="monotone"
                        dataKey="envelope"
                        stroke="rgba(255,255,255,0.12)"
                        strokeWidth={1}
                        dot={false}
                        strokeDasharray="4 4"
                        name="Envelope"
                      />
                      <Line
                        type="monotone"
                        dataKey="negEnvelope"
                        stroke="rgba(255,255,255,0.12)"
                        strokeWidth={1}
                        dot={false}
                        strokeDasharray="4 4"
                        name=""
                      />
                    </>
                  )}
                  <Line
                    type="monotone"
                    dataKey="x"
                    stroke={results.systemColor}
                    strokeWidth={2}
                    dot={false}
                    name="Displacement x(t)"
                    animationDuration={400}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[320px] flex items-center justify-center text-slate-600 text-sm">
                Enter valid system parameters to generate the time-history.
              </div>
            )}
          </div>

          {/* System classification guide */}
          <div className="bg-[#0c1528] border border-white/5 rounded-xl p-6">
            <div className="text-xs font-mono text-slate-600 tracking-wider mb-4">
              SYSTEM CLASSIFICATION
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { type: "Undamped", condition: "ζ = 0", description: "Perpetual oscillation at ωn.", color: "#94a3b8" },
                { type: "Underdamped", condition: "0 < ζ < 1", description: "Oscillates with exponential decay.", color: "#22c55e" },
                { type: "Critically Damped", condition: "ζ = 1", description: "Fastest return to equilibrium without oscillation.", color: "#f59e0b" },
                { type: "Overdamped", condition: "ζ > 1", description: "Slow exponential return to equilibrium.", color: "#ef4444" },
              ].map((s) => {
                const isActive = results?.systemType === s.type || (results?.systemType === "Undamped" && s.type === "Undamped");
                return (
                  <div
                    key={s.type}
                    className="py-3 px-3.5 bg-[#060b18] rounded-lg border transition-colors duration-300"
                    style={{
                      borderColor: isActive ? `${s.color}40` : "rgba(255,255,255,0.04)"
                    }}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="text-xs font-semibold text-slate-200 font-display">{s.type}</span>
                    </div>
                    <div className="font-mono text-[11px] mb-1.5" style={{ color: s.color }}>{s.condition}</div>
                    <div className="text-xs text-slate-500">{s.description}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
