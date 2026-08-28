import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
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
    systemColor = "#22c55e";
  } else if (zeta < 1.00001) {
    omegaD = 0;
    Td = 2 / omegaN;
    systemType = "Critically Damped";
    systemColor = "#f59e0b";
  } else {
    omegaD = 0;
    Td = 3 / (zeta * omegaN);
    systemType = "Overdamped";
    systemColor = "#ef4444";
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
    <div
      style={{
        backgroundColor: "#0c1528",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 6,
        padding: "10px 14px",
        fontFamily: "JetBrains Mono, monospace",
        fontSize: 12,
      }}
    >
      <div style={{ color: "#475569", marginBottom: 4 }}>t = {label?.toFixed(3)} s</div>
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

  const results = useMemo(() => computeVibration(inputs), [inputs]);

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
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 24px" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32, fontSize: 13, color: "#334155" }}>
        <Link to="/tools" style={{ color: "#475569", textDecoration: "none" }}>Tools</Link>
        <span>→</span>
        <span style={{ color: "#64748b" }}>Vibration Analysis</span>
      </div>

      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", color: "#a78bfa", letterSpacing: "0.08em", marginBottom: 10 }}>
          DYNAMICS · SDOF SYSTEM
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
          Vibration Analysis
        </h1>
        <p style={{ fontSize: 15, color: "#475569", margin: 0 }}>
          Single-degree-of-freedom mass-spring-damper system. Free vibration response with time-history chart.
        </p>
      </div>

      {/* Equation */}
      <div style={{ display: "flex", gap: 12, marginBottom: 32, flexWrap: "wrap" }}>
        <div className="formula-display">mẍ + cẋ + kx = 0</div>
        <div className="formula-display" style={{ fontSize: 13 }}>ωn = √(k/m)</div>
        <div className="formula-display" style={{ fontSize: 13 }}>ζ = c / 2√(km)</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 24 }}>
        {/* Left: inputs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Presets */}
          <div
            style={{
              backgroundColor: "#0c1528",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 12,
              padding: 20,
            }}
          >
            <div style={{ fontSize: 12, fontFamily: "JetBrains Mono, monospace", color: "#334155", letterSpacing: "0.06em", marginBottom: 12 }}>
              PRESETS
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {presets.map((p) => (
                <button
                  key={p.label}
                  onClick={() => setInputs(p.vals)}
                  style={{
                    padding: "8px 10px",
                    fontSize: 12,
                    backgroundColor: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 6,
                    color: "#64748b",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(167,139,250,0.1)";
                    (e.currentTarget as HTMLButtonElement).style.color = "#a78bfa";
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(167,139,250,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,255,255,0.03)";
                    (e.currentTarget as HTMLButtonElement).style.color = "#64748b";
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.07)";
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* System parameters */}
          <div
            style={{
              backgroundColor: "#0c1528",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 12,
              padding: 24,
            }}
          >
            <div style={{ fontSize: 12, fontFamily: "JetBrains Mono, monospace", color: "#334155", letterSpacing: "0.06em", marginBottom: 18 }}>
              SYSTEM PARAMETERS
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {([
                { key: "m", sym: "m", label: "Mass", unit: "kg", min: 0 },
                { key: "k", sym: "k", label: "Spring Stiffness", unit: "N/m", min: 0 },
                { key: "c", sym: "c", label: "Damping Coefficient", unit: "N·s/m", min: 0 },
              ] as const).map((f) => (
                <div key={f.key}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 5 }}>
                    <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13, color: "#a78bfa" }}>{f.sym}</span>
                    <span style={{ fontSize: 12, color: "#64748b" }}>{f.label}</span>
                  </div>
                  <div style={{ display: "flex", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 7, overflow: "hidden", backgroundColor: "#060b18" }}>
                    <input
                      type="number"
                      min={f.min}
                      value={inputs[f.key]}
                      onChange={setInput(f.key)}
                      style={{ flex: 1, padding: "9px 12px", background: "none", border: "none", color: "#e2e8f0", fontSize: 13, fontFamily: "JetBrains Mono, monospace", outline: "none" }}
                    />
                    <div style={{ padding: "9px 12px", borderLeft: "1px solid rgba(255,255,255,0.06)", fontSize: 11, fontFamily: "JetBrains Mono, monospace", color: "#334155", backgroundColor: "rgba(255,255,255,0.02)", whiteSpace: "nowrap" }}>
                      {f.unit}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 14, marginTop: 16 }}>
              <div style={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", color: "#334155", letterSpacing: "0.06em", marginBottom: 12 }}>
                INITIAL CONDITIONS
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {([
                  { key: "x0", sym: "x₀", label: "Initial Displacement", unit: "m" },
                  { key: "v0", sym: "ẋ₀", label: "Initial Velocity", unit: "m/s" },
                ] as const).map((f) => (
                  <div key={f.key}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 5 }}>
                      <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13, color: "#06b6d4" }}>{f.sym}</span>
                      <span style={{ fontSize: 12, color: "#64748b" }}>{f.label}</span>
                    </div>
                    <div style={{ display: "flex", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 7, overflow: "hidden", backgroundColor: "#060b18" }}>
                      <input
                        type="number"
                        value={inputs[f.key]}
                        onChange={setInput(f.key)}
                        style={{ flex: 1, padding: "9px 12px", background: "none", border: "none", color: "#e2e8f0", fontSize: 13, fontFamily: "JetBrains Mono, monospace", outline: "none" }}
                      />
                      <div style={{ padding: "9px 12px", borderLeft: "1px solid rgba(255,255,255,0.06)", fontSize: 11, fontFamily: "JetBrains Mono, monospace", color: "#334155", backgroundColor: "rgba(255,255,255,0.02)" }}>
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
              style={{
                backgroundColor: "#0c1528",
                border: `1px solid ${results.systemColor}25`,
                borderTop: `2px solid ${results.systemColor}`,
                borderRadius: 12,
                padding: 20,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: results.systemColor }} />
                <span style={{ fontFamily: "DM Sans, system-ui, sans-serif", fontSize: 14, fontWeight: 700, color: results.systemColor }}>
                  {results.systemType}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "Natural Frequency", val: results.omegaN.toFixed(3), unit: "rad/s", sym: "ωn" },
                  { label: "Natural Freq (Hz)", val: results.fn.toFixed(3), unit: "Hz", sym: "fn" },
                  { label: "Damping Ratio", val: results.zeta.toFixed(4), unit: "—", sym: "ζ" },
                  ...(results.zeta < 1
                    ? [
                        { label: "Damped Frequency", val: results.omegaD.toFixed(3), unit: "rad/s", sym: "ωd" },
                        { label: "Damped Period", val: results.Td.toFixed(4), unit: "s", sym: "Td" },
                      ]
                    : []),
                ].map((r) => (
                  <div
                    key={r.sym}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: 12,
                      padding: "6px 0",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    <div style={{ display: "flex", gap: 6 }}>
                      <span style={{ fontFamily: "JetBrains Mono, monospace", color: "#06b6d4" }}>{r.sym}</span>
                      <span style={{ color: "#475569" }}>{r.label}</span>
                    </div>
                    <span style={{ fontFamily: "JetBrains Mono, monospace", color: "#e2e8f0", fontWeight: 600 }}>
                      {r.val} <span style={{ color: "#334155", fontWeight: 400 }}>{r.unit}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: chart */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              backgroundColor: "#0c1528",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 12,
              padding: 24,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontFamily: "JetBrains Mono, monospace", color: "#334155", letterSpacing: "0.06em" }}>
                TIME-HISTORY RESPONSE · x(t)
              </div>
              {results && (
                <span
                  style={{
                    fontSize: 11,
                    padding: "3px 10px",
                    borderRadius: 4,
                    backgroundColor: `${results.systemColor}15`,
                    color: results.systemColor,
                    fontFamily: "JetBrains Mono, monospace",
                    border: `1px solid ${results.systemColor}30`,
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
              <div style={{ height: 320, display: "flex", alignItems: "center", justifyContent: "center", color: "#334155", fontSize: 14 }}>
                Enter valid system parameters to generate the time-history.
              </div>
            )}
          </div>

          {/* System classification guide */}
          <div
            style={{
              backgroundColor: "#0c1528",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 12,
              padding: 24,
            }}
          >
            <div style={{ fontSize: 12, fontFamily: "JetBrains Mono, monospace", color: "#334155", letterSpacing: "0.06em", marginBottom: 16 }}>
              SYSTEM CLASSIFICATION
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
              {[
                { type: "Undamped", condition: "ζ = 0", description: "Perpetual oscillation at ωn.", color: "#94a3b8" },
                { type: "Underdamped", condition: "0 < ζ < 1", description: "Oscillates with exponential decay.", color: "#22c55e" },
                { type: "Critically Damped", condition: "ζ = 1", description: "Fastest return to equilibrium without oscillation.", color: "#f59e0b" },
                { type: "Overdamped", condition: "ζ > 1", description: "Slow exponential return to equilibrium.", color: "#ef4444" },
              ].map((s) => (
                <div
                  key={s.type}
                  style={{
                    padding: "12px 14px",
                    backgroundColor: "#060b18",
                    border: `1px solid ${results?.systemType === s.type || (results?.systemType === "Undamped" && s.type === "Undamped") ? s.color + "35" : "rgba(255,255,255,0.04)"}`,
                    borderRadius: 8,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: s.color }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0", fontFamily: "DM Sans, system-ui, sans-serif" }}>{s.type}</span>
                  </div>
                  <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: s.color, marginBottom: 6 }}>{s.condition}</div>
                  <div style={{ fontSize: 12, color: "#475569" }}>{s.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
