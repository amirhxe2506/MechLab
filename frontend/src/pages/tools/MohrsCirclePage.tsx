import { useState, useMemo } from "react";
import { Link } from "react-router-dom";

interface Inputs {
  sigmaX: string;
  sigmaY: string;
  tauXY: string;
}

interface Results {
  sigma1: number;
  sigma2: number;
  tauMax: number;
  sigmaC: number;
  R: number;
  thetaP: number;
}

function compute(inputs: Inputs): Results | null {
  const sx = parseFloat(inputs.sigmaX);
  const sy = parseFloat(inputs.sigmaY);
  const txy = parseFloat(inputs.tauXY);
  if ([sx, sy, txy].some(isNaN)) return null;

  const sigmaC = (sx + sy) / 2;
  const R = Math.sqrt(Math.pow((sx - sy) / 2, 2) + Math.pow(txy, 2));
  const sigma1 = sigmaC + R;
  const sigma2 = sigmaC - R;
  const tauMax = R;
  const thetaP = (Math.atan2(2 * txy, sx - sy) * 180) / Math.PI / 2;

  return { sigma1, sigma2, tauMax, sigmaC, R, thetaP };
}

function fmt(n: number): string {
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(3) + " GPa";
  if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(3) + " kPa";
  return n.toFixed(2) + " Pa";
}

function fmtMPa(n: number): string {
  return n.toFixed(2);
}

export default function MohrsCirclePage() {
  const [inputs, setInputs] = useState<Inputs>({ sigmaX: "250", sigmaY: "-100", tauXY: "75" });
  const [unit, setUnit] = useState("MPa");

  const results = useMemo(() => compute(inputs), [inputs]);

  const setInput = (key: keyof Inputs) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputs((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const loadExample = () => {
    setInputs({ sigmaX: "250", sigmaY: "-100", tauXY: "75" });
  };

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 24px" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32, fontSize: 13, color: "#334155" }}>
        <Link to="/tools" style={{ color: "#475569", textDecoration: "none" }}>Tools</Link>
        <span>→</span>
        <span style={{ color: "#64748b" }}>Mohr's Circle</span>
      </div>

      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", color: "#f59e0b", letterSpacing: "0.08em", marginBottom: 10 }}>
          MECHANICS · STRESS TRANSFORMATION
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
          Mohr's Circle
        </h1>
        <p style={{ fontSize: 15, color: "#475569", margin: 0 }}>
          Compute principal stresses, maximum shear stress, and principal angles from a 2D stress state.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 24 }}>
        {/* Input panel */}
        <div>
          <div
            style={{
              backgroundColor: "#0c1528",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 12,
              padding: 24,
              marginBottom: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontFamily: "JetBrains Mono, monospace", color: "#334155", letterSpacing: "0.06em" }}>
                STRESS STATE
              </div>
              <div style={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", color: "#334155", padding: "3px 8px", backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 4 }}>
                {unit}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {([
                { key: "sigmaX", label: "Normal Stress in x", sym: "σx" },
                { key: "sigmaY", label: "Normal Stress in y", sym: "σy" },
                { key: "tauXY", label: "Shear Stress", sym: "τxy" },
              ] as const).map((f) => (
                <div key={f.key}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 14, color: "#06b6d4", minWidth: 28 }}>{f.sym}</span>
                    <span style={{ fontSize: 12, color: "#64748b" }}>{f.label}</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 8,
                      overflow: "hidden",
                      backgroundColor: "#060b18",
                    }}
                  >
                    <input
                      type="number"
                      value={inputs[f.key]}
                      onChange={setInput(f.key)}
                      style={{
                        flex: 1,
                        padding: "10px 12px",
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
                        padding: "10px 12px",
                        borderLeft: "1px solid rgba(255,255,255,0.06)",
                        fontSize: 11,
                        fontFamily: "JetBrains Mono, monospace",
                        color: "#334155",
                        backgroundColor: "rgba(255,255,255,0.02)",
                      }}
                    >
                      {unit}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={loadExample}
              style={{
                marginTop: 16,
                padding: "7px 14px",
                fontSize: 12,
                backgroundColor: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 6,
                color: "#64748b",
                cursor: "pointer",
                width: "100%",
              }}
            >
              Load Example
            </button>
          </div>

          {/* Results panel */}
          {results && (
            <div
              style={{
                backgroundColor: "#0c1528",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 12,
                padding: 24,
              }}
            >
              <div style={{ fontSize: 12, fontFamily: "JetBrains Mono, monospace", color: "#334155", letterSpacing: "0.06em", marginBottom: 16 }}>
                RESULTS
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "Max Principal Stress", sym: "σ₁", val: fmtMPa(results.sigma1), color: "#22c55e" },
                  { label: "Min Principal Stress", sym: "σ₂", val: fmtMPa(results.sigma2), color: "#ef4444" },
                  { label: "Center (σC)", sym: "σC", val: fmtMPa(results.sigmaC), color: "#94a3b8" },
                  { label: "Circle Radius", sym: "R", val: fmtMPa(results.R), color: "#3b82f6" },
                  { label: "Max Shear Stress", sym: "τmax", val: fmtMPa(results.tauMax), color: "#f59e0b" },
                  { label: "Principal Angle", sym: "θp", val: results.thetaP.toFixed(2) + "°", color: "#06b6d4" },
                ].map((r) => (
                  <div
                    key={r.sym}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 12px",
                      backgroundColor: "#060b18",
                      borderRadius: 6,
                      border: "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13, color: r.color, minWidth: 28 }}>{r.sym}</span>
                      <span style={{ fontSize: 12, color: "#475569" }}>{r.label}</span>
                    </div>
                    <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>
                      {r.val} <span style={{ fontSize: 10, color: "#334155", fontWeight: 400 }}>{r.sym === "θp" ? "" : unit}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: visualization */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* SVG */}
          <div
            style={{
              backgroundColor: "#0c1528",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 12,
              padding: 24,
            }}
          >
            <div style={{ fontSize: 12, fontFamily: "JetBrains Mono, monospace", color: "#334155", letterSpacing: "0.06em", marginBottom: 16 }}>
              MOHR'S CIRCLE VISUALIZATION
            </div>
            {results ? (
              <MohrsCircleSVG
                sigmaX={parseFloat(inputs.sigmaX)}
                sigmaY={parseFloat(inputs.sigmaY)}
                tauXY={parseFloat(inputs.tauXY)}
                results={results}
                unit={unit}
              />
            ) : (
              <div style={{ height: 340, display: "flex", alignItems: "center", justifyContent: "center", color: "#334155", fontSize: 14 }}>
                Enter valid stress values to generate the circle.
              </div>
            )}
          </div>

          {/* Stress element */}
          {results && (
            <div
              style={{
                backgroundColor: "#0c1528",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 12,
                padding: 24,
              }}
            >
              <div style={{ fontSize: 12, fontFamily: "JetBrains Mono, monospace", color: "#334155", letterSpacing: "0.06em", marginBottom: 16 }}>
                STRESS ELEMENT
              </div>
              <StressElementSVG
                sigmaX={parseFloat(inputs.sigmaX)}
                sigmaY={parseFloat(inputs.sigmaY)}
                tauXY={parseFloat(inputs.tauXY)}
                unit={unit}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Mohr's Circle SVG ─────────────────────────────────────────────────────────

function MohrsCircleSVG({
  sigmaX,
  sigmaY,
  tauXY,
  results,
  unit,
}: {
  sigmaX: number;
  sigmaY: number;
  tauXY: number;
  results: Results;
  unit: string;
}) {
  const W = 560, H = 340;
  const PAD = 48;

  const { sigmaC, R, sigma1, sigma2, tauMax } = results;

  // Scale: fit the circle with padding
  const scale = R > 0 ? (Math.min(W, H) / 2 - PAD - 20) / (R * 1.15) : 1;

  // SVG center (σC maps to cx, τ=0 maps to cy)
  const cx = W / 2;
  const cy = H / 2;
  const rSVG = R * scale;

  const toX = (sigma: number) => cx + (sigma - sigmaC) * scale;
  const toY = (tau: number) => cy - tau * scale;

  const ptA = { x: toX(sigmaX), y: toY(tauXY) };
  const ptB = { x: toX(sigmaY), y: toY(-tauXY) };
  const ptS1 = { x: toX(sigma1), y: cy };
  const ptS2 = { x: toX(sigma2), y: cy };
  const ptTmax = { x: cx, y: toY(tauMax) };
  const ptTmin = { x: cx, y: toY(-tauMax) };

  const axisLen = Math.max(rSVG + 36, 80);

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      {/* BG */}
      <rect width={W} height={H} fill="#060b18" rx="8" />

      {/* Grid */}
      {Array.from({ length: 8 }, (_, i) => {
        const x = PAD + (i * (W - PAD * 2)) / 7;
        return <line key={`vg${i}`} x1={x} y1={PAD} x2={x} y2={H - PAD} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />;
      })}
      {Array.from({ length: 5 }, (_, i) => {
        const y = PAD + (i * (H - PAD * 2)) / 4;
        return <line key={`hg${i}`} x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />;
      })}

      {/* σ axis */}
      <line x1={cx - axisLen} y1={cy} x2={cx + axisLen} y2={cy} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <polygon points={`${cx + axisLen},${cy} ${cx + axisLen - 7},${cy - 4} ${cx + axisLen - 7},${cy + 4}`} fill="rgba(255,255,255,0.15)" />
      <text x={cx + axisLen + 8} y={cy + 5} fill="#475569" fontSize="13" fontFamily="JetBrains Mono">σ</text>

      {/* τ axis (vertical, through center σC) */}
      <line x1={cx} y1={cy - axisLen} x2={cx} y2={cy + axisLen} stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="5 4" />
      <polygon points={`${cx},${cy - axisLen} ${cx - 4},${cy - axisLen + 7} ${cx + 4},${cy - axisLen + 7}`} fill="rgba(255,255,255,0.15)" />
      <text x={cx + 6} y={cy - axisLen - 4} fill="#475569" fontSize="13" fontFamily="JetBrains Mono">τ</text>

      {/* Circle */}
      <circle cx={cx} cy={cy} r={rSVG} fill="rgba(59,130,246,0.05)" stroke="#3b82f6" strokeWidth="1.5" />

      {/* Diameter A-B */}
      <line x1={ptA.x} y1={ptA.y} x2={ptB.x} y2={ptB.y} stroke="rgba(59,130,246,0.3)" strokeWidth="1" strokeDasharray="5 4" />

      {/* Radius to A */}
      <line x1={cx} y1={cy} x2={ptA.x} y2={ptA.y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      {/* Radius to τmax */}
      <line x1={cx} y1={cy} x2={ptTmax.x} y2={ptTmax.y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="3 3" />

      {/* σ1 marker */}
      <line x1={ptS1.x} y1={cy - 7} x2={ptS1.x} y2={cy + 7} stroke="#22c55e" strokeWidth="2" />
      <circle cx={ptS1.x} cy={cy} r={4} fill="#22c55e" opacity="0.2" stroke="#22c55e" strokeWidth="1.5" />
      <text x={ptS1.x + 6} y={cy - 10} fill="#22c55e" fontSize="11" fontFamily="JetBrains Mono">σ₁={results.sigma1.toFixed(1)}</text>

      {/* σ2 marker */}
      <line x1={ptS2.x} y1={cy - 7} x2={ptS2.x} y2={cy + 7} stroke="#ef4444" strokeWidth="2" />
      <circle cx={ptS2.x} cy={cy} r={4} fill="#ef4444" opacity="0.2" stroke="#ef4444" strokeWidth="1.5" />
      <text x={ptS2.x - 8} y={cy + 20} textAnchor="middle" fill="#ef4444" fontSize="11" fontFamily="JetBrains Mono">σ₂={results.sigma2.toFixed(1)}</text>

      {/* τmax top marker */}
      <circle cx={ptTmax.x} cy={ptTmax.y} r={4} fill="#f59e0b" opacity="0.2" stroke="#f59e0b" strokeWidth="1.5" />
      <text x={cx + 8} y={ptTmax.y - 5} fill="#f59e0b" fontSize="11" fontFamily="JetBrains Mono">τmax={results.tauMax.toFixed(1)}</text>

      {/* Point A */}
      <circle cx={ptA.x} cy={ptA.y} r={5} fill="#06b6d4" />
      <circle cx={ptA.x} cy={ptA.y} r={9} fill="none" stroke="#06b6d4" strokeWidth="1" opacity="0.3" />
      <text x={ptA.x + 10} y={ptA.y - 6} fill="#06b6d4" fontSize="12" fontFamily="JetBrains Mono">
        A(σx={sigmaX.toFixed(0)}, τxy={tauXY.toFixed(0)})
      </text>

      {/* Point B */}
      <circle cx={ptB.x} cy={ptB.y} r={5} fill="#f59e0b" />
      <circle cx={ptB.x} cy={ptB.y} r={9} fill="none" stroke="#f59e0b" strokeWidth="1" opacity="0.3" />
      <text x={ptB.x + 10} y={ptB.y + 16} fill="#f59e0b" fontSize="12" fontFamily="JetBrains Mono">
        B(σy={sigmaY.toFixed(0)}, −τxy={Math.abs(tauXY).toFixed(0)})
      </text>

      {/* Center */}
      <circle cx={cx} cy={cy} r={3} fill="#64748b" />
      <text x={cx + 6} y={cy - 6} fill="#475569" fontSize="10" fontFamily="JetBrains Mono">C={results.sigmaC.toFixed(1)}</text>

      {/* Unit label */}
      <text x={W - 10} y={H - 8} textAnchor="end" fill="#334155" fontSize="10" fontFamily="JetBrains Mono">
        All values in {unit}
      </text>
    </svg>
  );
}

// ─── Stress Element SVG ────────────────────────────────────────────────────────

function StressElementSVG({
  sigmaX,
  sigmaY,
  tauXY,
  unit,
}: {
  sigmaX: number;
  sigmaY: number;
  tauXY: number;
  unit: string;
}) {
  const W = 300, H = 200;
  const cx = W / 2, cy = H / 2;
  const s = 70;
  const arrowLen = 30;

  const makeArrow = (x1: number, y1: number, x2: number, y2: number, color: string, label: string, labelX: number, labelY: number) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    const nx = dx / len;
    const ny = dy / len;
    const hx = x2 - nx * 8;
    const hy = y2 - ny * 8;
    const px = -ny;
    const py = nx;
    return (
      <g>
        <line x1={x1} y1={y1} x2={hx} y2={hy} stroke={color} strokeWidth="1.5" />
        <polygon points={`${x2},${y2} ${hx + px * 4},${hy + py * 4} ${hx - px * 4},${hy - py * 4}`} fill={color} />
        <text x={labelX} y={labelY} textAnchor="middle" fill={color} fontSize="11" fontFamily="JetBrains Mono">{label}</text>
      </g>
    );
  };

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      <rect width={W} height={H} fill="#060b18" rx="6" />

      {/* Stress element square */}
      <rect
        x={cx - s}
        y={cy - s}
        width={s * 2}
        height={s * 2}
        fill="rgba(59,130,246,0.06)"
        stroke="rgba(59,130,246,0.4)"
        strokeWidth="1.5"
      />

      {/* x-axis label */}
      <text x={cx + s + 10} y={cy + 4} fill="#334155" fontSize="10" fontFamily="JetBrains Mono">x</text>
      {/* y-axis label */}
      <text x={cx + 2} y={cy - s - 6} fill="#334155" fontSize="10" fontFamily="JetBrains Mono">y</text>

      {/* σx arrows (left/right) */}
      {makeArrow(cx - s, cy, cx - s - arrowLen, cy, "#3b82f6", `σx=${sigmaX}`, cx - s - arrowLen - 8, cy - 6)}
      {makeArrow(cx + s, cy, cx + s + arrowLen, cy, "#3b82f6", `σx=${sigmaX}`, cx + s + arrowLen + 8, cy - 6)}

      {/* σy arrows (top/bottom) */}
      {makeArrow(cx, cy - s, cx, cy - s - arrowLen, "#f59e0b", `σy=${sigmaY}`, cx, cy - s - arrowLen - 6)}
      {makeArrow(cx, cy + s, cx, cy + s + arrowLen, "#f59e0b", `σy=${sigmaY}`, cx, cy + s + arrowLen + 12)}

      {/* τxy shear on right face (down) and left face (up) */}
      {tauXY !== 0 && (
        <>
          {makeArrow(cx + s, cy - 20, cx + s, cy + 20, "#06b6d4", "", 0, 0)}
          {makeArrow(cx - s, cy + 20, cx - s, cy - 20, "#06b6d4", "", 0, 0)}
          <text x={cx + s + 12} y={cy + 4} fill="#06b6d4" fontSize="10" fontFamily="JetBrains Mono">τ={tauXY}</text>
        </>
      )}

      {/* Unit */}
      <text x={W - 8} y={H - 6} textAnchor="end" fill="#334155" fontSize="9" fontFamily="JetBrains Mono">{unit}</text>
    </svg>
  );
}
