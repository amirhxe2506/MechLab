import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useDebounce } from "../../hooks/useDebounce";
import { EngineeringValue } from "../../components/EngineeringValue";

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

export default function MohrsCirclePage() {
  const [inputs, setInputs] = useState<Inputs>({ sigmaX: "250", sigmaY: "-100", tauXY: "75" });
  const [unit, setUnit] = useState("MPa");

  const debouncedInputs = useDebounce(inputs, 300);
  const results = useMemo(() => compute(debouncedInputs), [debouncedInputs]);

  const setInput = (key: keyof Inputs) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputs((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const loadExample = () => {
    setInputs({ sigmaX: "250", sigmaY: "-100", tauXY: "75" });
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8 text-[13px] text-slate-600">
        <Link to="/tools" className="text-slate-500 hover:text-slate-400 no-underline transition-colors">Tools</Link>
        <span>→</span>
        <span className="text-slate-400">Mohr's Circle</span>
      </div>

      <div className="mb-9">
        <div className="text-[11px] font-mono text-amber-500 tracking-[0.08em] mb-2.5">
          MECHANICS · STRESS TRANSFORMATION
        </div>
        <h1 className="font-display text-[clamp(1.5rem,3vw,2rem)] font-bold text-slate-100 mb-2.5 tracking-tight">
          Mohr's Circle
        </h1>
        <p className="text-[15px] text-slate-500 m-0">
          Compute principal stresses, maximum shear stress, and principal angles from a 2D stress state.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        {/* Input panel */}
        <div>
          <div className="bg-[#0c1528] border border-white/5 rounded-xl p-6 mb-4">
            <div className="flex items-center justify-between mb-5">
              <div className="text-xs font-mono text-slate-600 tracking-wider">
                STRESS STATE
              </div>
              <div className="text-[11px] font-mono text-slate-500 py-1 px-2 bg-white/5 border border-white/5 rounded">
                {unit}
              </div>
            </div>

            <div className="flex flex-col gap-3.5">
              {([
                { key: "sigmaX", label: "Normal Stress in x", sym: "σx" },
                { key: "sigmaY", label: "Normal Stress in y", sym: "σy" },
                { key: "tauXY", label: "Shear Stress", sym: "τxy" },
              ] as const).map((f) => (
                <div key={f.key}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono text-sm text-cyan-500 min-w-[28px]">{f.sym}</span>
                    <span className="text-xs text-slate-500">{f.label}</span>
                  </div>
                  <div className="flex border border-white/10 rounded-lg overflow-hidden bg-[#060b18] focus-within:ring-1 focus-within:ring-cyan-500/50 transition-colors">
                    <input
                      type="number"
                      value={inputs[f.key]}
                      onChange={setInput(f.key)}
                      className="flex-1 py-2.5 px-3 bg-transparent border-none text-slate-200 text-sm font-mono outline-none"
                    />
                    <div className="py-2.5 px-3 border-l border-white/5 text-[11px] font-mono text-slate-500 bg-white/5 flex items-center">
                      {unit}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={loadExample}
              className="mt-4 w-full py-1.5 px-3.5 text-xs bg-white/5 border border-white/10 rounded-md text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/50 hover:shadow-[0_0_10px_rgba(6,182,212,0.2)] cursor-pointer transition-all focus:outline-none"
            >
              Load Example
            </button>
          </div>

          {/* Results panel */}
          {results && (
            <div className="bg-[#0c1528] border border-white/5 rounded-xl p-6">
              <div className="text-xs font-mono text-slate-600 tracking-wider mb-4">
                RESULTS
              </div>
              <div className="flex flex-col gap-2.5">
                {[
                  { label: "Max Principal Stress", sym: "σ₁", val: results.sigma1, isAngle: false, color: "text-green-500" },
                  { label: "Min Principal Stress", sym: "σ₂", val: results.sigma2, isAngle: false, color: "text-red-500" },
                  { label: "Center (σC)", sym: "σC", val: results.sigmaC, isAngle: false, color: "text-slate-400" },
                  { label: "Circle Radius", sym: "R", val: results.R, isAngle: false, color: "text-blue-500" },
                  { label: "Max Shear Stress", sym: "τmax", val: results.tauMax, isAngle: false, color: "text-amber-500" },
                  { label: "Principal Angle", sym: "θp", val: results.thetaP, isAngle: true, color: "text-cyan-500" },
                ].map((r) => (
                  <div
                    key={r.sym}
                    className="flex items-center justify-between py-2.5 px-3 bg-[#060b18] rounded-md border border-white/5"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-[13px] min-w-[28px] ${r.color}`}>{r.sym}</span>
                      <span className="text-xs text-slate-500">{r.label}</span>
                    </div>
                    <span className="font-mono text-sm font-bold text-slate-200">
                      <EngineeringValue value={r.val} unit="" precision={2} valueClassName="inline" /> <span className="text-[10px] text-slate-500 font-normal">{r.isAngle ? "°" : unit}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: visualization */}
        <div className="flex flex-col gap-5">
          {/* SVG */}
          <div className="bg-[#0c1528] border border-white/5 rounded-xl p-6">
            <div className="text-xs font-mono text-slate-600 tracking-wider mb-4">
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
              <div className="h-[340px] flex items-center justify-center text-slate-600 text-sm">
                Enter valid stress values to generate the circle.
              </div>
            )}
          </div>

          {/* Stress element */}
          {results && (
            <div className="bg-[#0c1528] border border-white/5 rounded-xl p-6">
              <div className="text-xs font-mono text-slate-600 tracking-wider mb-4">
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
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="block max-w-full">
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
      <text x={cx + axisLen + 8} y={cy + 5} fill="#475569" fontSize="13" className="font-mono">σ</text>

      {/* τ axis (vertical, through center σC) */}
      <line x1={cx} y1={cy - axisLen} x2={cx} y2={cy + axisLen} stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="5 4" />
      <polygon points={`${cx},${cy - axisLen} ${cx - 4},${cy - axisLen + 7} ${cx + 4},${cy - axisLen + 7}`} fill="rgba(255,255,255,0.15)" />
      <text x={cx + 6} y={cy - axisLen - 4} fill="#475569" fontSize="13" className="font-mono">τ</text>

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
      <text x={ptS1.x + 6} y={cy - 10} fill="#22c55e" fontSize="11" className="font-mono">σ₁={results.sigma1.toFixed(1)}</text>

      {/* σ2 marker */}
      <line x1={ptS2.x} y1={cy - 7} x2={ptS2.x} y2={cy + 7} stroke="#ef4444" strokeWidth="2" />
      <circle cx={ptS2.x} cy={cy} r={4} fill="#ef4444" opacity="0.2" stroke="#ef4444" strokeWidth="1.5" />
      <text x={ptS2.x - 8} y={cy + 20} textAnchor="middle" fill="#ef4444" fontSize="11" className="font-mono">σ₂={results.sigma2.toFixed(1)}</text>

      {/* τmax top marker */}
      <circle cx={ptTmax.x} cy={ptTmax.y} r={4} fill="#f59e0b" opacity="0.2" stroke="#f59e0b" strokeWidth="1.5" />
      <text x={cx + 8} y={ptTmax.y - 5} fill="#f59e0b" fontSize="11" className="font-mono">τmax={results.tauMax.toFixed(1)}</text>

      {/* Point A */}
      <circle cx={ptA.x} cy={ptA.y} r={5} fill="#06b6d4" />
      <circle cx={ptA.x} cy={ptA.y} r={9} fill="none" stroke="#06b6d4" strokeWidth="1" opacity="0.3" />
      <text x={ptA.x + 10} y={ptA.y - 6} fill="#06b6d4" fontSize="12" className="font-mono">
        A(σx={sigmaX.toFixed(0)}, τxy={tauXY.toFixed(0)})
      </text>

      {/* Point B */}
      <circle cx={ptB.x} cy={ptB.y} r={5} fill="#f59e0b" />
      <circle cx={ptB.x} cy={ptB.y} r={9} fill="none" stroke="#f59e0b" strokeWidth="1" opacity="0.3" />
      <text x={ptB.x + 10} y={ptB.y + 16} fill="#f59e0b" fontSize="12" className="font-mono">
        B(σy={sigmaY.toFixed(0)}, −τxy={Math.abs(tauXY).toFixed(0)})
      </text>

      {/* Center */}
      <circle cx={cx} cy={cy} r={3} fill="#64748b" />
      <text x={cx + 6} y={cy - 6} fill="#475569" fontSize="10" className="font-mono">C={results.sigmaC.toFixed(1)}</text>

      {/* Unit label */}
      <text x={W - 10} y={H - 8} textAnchor="end" fill="#334155" fontSize="10" className="font-mono">
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
        <text x={labelX} y={labelY} textAnchor="middle" fill={color} fontSize="11" className="font-mono">{label}</text>
      </g>
    );
  };

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="block max-w-full">
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
      <text x={cx + s + 10} y={cy + 4} fill="#334155" fontSize="10" className="font-mono">x</text>
      {/* y-axis label */}
      <text x={cx + 2} y={cy - s - 6} fill="#334155" fontSize="10" className="font-mono">y</text>

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
          <text x={cx + s + 12} y={cy + 4} fill="#06b6d4" fontSize="10" className="font-mono">τ={tauXY}</text>
        </>
      )}

      {/* Unit */}
      <text x={W - 8} y={H - 6} textAnchor="end" fill="#334155" fontSize="9" className="font-mono">{unit}</text>
    </svg>
  );
}
