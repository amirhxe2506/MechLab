import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useDebounce } from "../../hooks/useDebounce";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

type BeamType = "simply_supported" | "cantilever";

interface PointLoad {
  id: string;
  x: string;
  p: string;
}

interface UDLLoad {
  id: string;
  start: string;
  end: string;
  w: string;
}

interface BeamCalcResult {
  reactions: {
    Ra: number;
    Rb: number;
    Ma?: number;
  };
  maxShear: number;
  minShear: number;
  maxMoment: number;
  minMoment: number;
  maxMomentLocation: number;
  chartData: {
    x: number;
    shear: number;
    moment: number;
  }[];
}

function mac(x: number, a: number, n: number): number {
  if (x < a - 1e-12) return 0.0;
  return Math.pow(x - a, n);
}

function calculateBeam(
  type: BeamType,
  lengthStr: string,
  pointLoads: PointLoad[],
  udlLoads: UDLLoad[]
): BeamCalcResult | null {
  const L = parseFloat(lengthStr);
  if (isNaN(L) || L <= 0) return null;

  const validPLs = pointLoads
    .map((pl) => ({ x: parseFloat(pl.x), p: parseFloat(pl.p) }))
    .filter((pl) => !isNaN(pl.x) && !isNaN(pl.p) && pl.x >= 0 && pl.x <= L);

  const validUDLs = udlLoads
    .map((u) => ({ start: parseFloat(u.start), end: parseFloat(u.end), w: parseFloat(u.w) }))
    .filter((u) => !isNaN(u.start) && !isNaN(u.end) && !isNaN(u.w) && u.start >= 0 && u.end <= L && u.end > u.start);

  if (validPLs.length === 0 && validUDLs.length === 0) return null;

  let Ra = 0;
  let Rb = 0;
  let Ma = 0;

  if (type === "simply_supported") {
    let totalMomentA = 0;
    let totalVertical = 0;

    for (const pl of validPLs) {
      totalVertical += pl.p;
      totalMomentA += pl.p * pl.x;
    }

    for (const u of validUDLs) {
      const len = u.end - u.start;
      const totalW = u.w * len;
      const centroid = u.start + len / 2;
      totalVertical += totalW;
      totalMomentA += totalW * centroid;
    }

    Rb = totalMomentA / L;
    Ra = totalVertical - Rb;
  } else {
    // Cantilever (fixed at x = 0)
    let totalVertical = 0;
    let totalMomentA = 0;

    for (const pl of validPLs) {
      totalVertical += pl.p;
      totalMomentA += pl.p * pl.x;
    }

    for (const u of validUDLs) {
      const len = u.end - u.start;
      const totalW = u.w * len;
      const centroid = u.start + len / 2;
      totalVertical += totalW;
      totalMomentA += totalW * centroid;
    }

    Ra = totalVertical;
    Ma = totalMomentA;
  }

  const steps = 300;
  const dx = L / steps;
  const chartData: { x: number; shear: number; moment: number }[] = [];

  let maxShear = -Infinity;
  let minShear = Infinity;
  let maxMoment = -Infinity;
  let minMoment = Infinity;
  let maxMomentLocation = 0;

  for (let i = 0; i <= steps; i++) {
    const x = i * dx;
    let V = 0;
    let M = 0;

    if (type === "simply_supported") {
      V = Ra;
      M = Ra * x;

      for (const pl of validPLs) {
        V -= pl.p * mac(x, pl.x, 0);
        M -= pl.p * mac(x, pl.x, 1);
      }

      for (const u of validUDLs) {
        V -= u.w * mac(x, u.start, 1);
        V += u.w * mac(x, u.end, 1);

        M -= 0.5 * u.w * mac(x, u.start, 2);
        M += 0.5 * u.w * mac(x, u.end, 2);
      }
    } else {
      V = Ra;
      M = -Ma + Ra * x;

      for (const pl of validPLs) {
        V -= pl.p * mac(x, pl.x, 0);
        M -= pl.p * mac(x, pl.x, 1);
      }

      for (const u of validUDLs) {
        V -= u.w * mac(x, u.start, 1);
        V += u.w * mac(x, u.end, 1);

        M -= 0.5 * u.w * mac(x, u.start, 2);
        M += 0.5 * u.w * mac(x, u.end, 2);
      }
    }

    if (V > maxShear) maxShear = V;
    if (V < minShear) minShear = V;

    if (M > maxMoment) {
      maxMoment = M;
      maxMomentLocation = x;
    }
    if (M < minMoment) minMoment = M;

    chartData.push({
      x: parseFloat(x.toFixed(3)),
      shear: parseFloat(V.toFixed(3)),
      moment: parseFloat(M.toFixed(3)),
    });
  }

  return {
    reactions: { Ra, Rb, Ma: type === "cantilever" ? Ma : undefined },
    maxShear,
    minShear,
    maxMoment,
    minMoment,
    maxMomentLocation,
    chartData,
  };
}

export default function BeamPage() {
  const [beamType, setBeamType] = useState<BeamType>("simply_supported");
  const [length, setLength] = useState("6");
  const [pointLoads, setPointLoads] = useState<PointLoad[]>([
    { id: "1", x: "3", p: "20" },
  ]);
  const [udlLoads, setUdlLoads] = useState<UDLLoad[]>([
    { id: "1", start: "0", end: "6", w: "5" },
  ]);

  const debouncedType = useDebounce(beamType, 300);
  const debouncedLength = useDebounce(length, 300);
  const debouncedPointLoads = useDebounce(pointLoads, 300);
  const debouncedUdlLoads = useDebounce(udlLoads, 300);

  const results = useMemo(
    () => calculateBeam(debouncedType, debouncedLength, debouncedPointLoads, debouncedUdlLoads),
    [debouncedType, debouncedLength, debouncedPointLoads, debouncedUdlLoads]
  );

  const addPointLoad = () => {
    setPointLoads((prev) => [
      ...prev,
      { id: Date.now().toString(), x: (parseFloat(length) / 2 || 2).toString(), p: "10" },
    ]);
  };

  const removePointLoad = (id: string) => {
    setPointLoads((prev) => prev.filter((pl) => pl.id !== id));
  };

  const updatePointLoad = (id: string, field: "x" | "p", value: string) => {
    setPointLoads((prev) =>
      prev.map((pl) => (pl.id === id ? { ...pl, [field]: value } : pl))
    );
  };

  const addUDL = () => {
    setUdlLoads((prev) => [
      ...prev,
      { id: Date.now().toString(), start: "0", end: length, w: "5" },
    ]);
  };

  const removeUDL = (id: string) => {
    setUdlLoads((prev) => prev.filter((u) => u.id !== id));
  };

  const updateUDL = (id: string, field: "start" | "end" | "w", value: string) => {
    setUdlLoads((prev) =>
      prev.map((u) => (u.id === id ? { ...u, [field]: value } : u))
    );
  };

  const loadPreset = (preset: "center_point" | "full_udl" | "cantilever_end" | "combined") => {
    if (preset === "center_point") {
      setBeamType("simply_supported");
      setLength("6");
      setPointLoads([{ id: "1", x: "3", p: "30" }]);
      setUdlLoads([]);
    } else if (preset === "full_udl") {
      setBeamType("simply_supported");
      setLength("8");
      setPointLoads([]);
      setUdlLoads([{ id: "1", start: "0", end: "8", w: "12" }]);
    } else if (preset === "cantilever_end") {
      setBeamType("cantilever");
      setLength("4");
      setPointLoads([{ id: "1", x: "4", p: "15" }]);
      setUdlLoads([{ id: "1", start: "0", end: "4", w: "4" }]);
    } else if (preset === "combined") {
      setBeamType("simply_supported");
      setLength("10");
      setPointLoads([
        { id: "1", x: "3", p: "25" },
        { id: "2", x: "7", p: "15" },
      ]);
      setUdlLoads([{ id: "1", start: "0", end: "5", w: "8" }]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8 text-[13px] text-slate-600">
        <Link to="/tools" className="text-slate-500 hover:text-slate-400 no-underline transition-colors">
          Tools
        </Link>
        <span>→</span>
        <span className="text-slate-400">Beam Analysis</span>
      </div>

      {/* Header */}
      <div className="mb-9">
        <div className="flex items-center gap-3 mb-2.5">
          <div className="text-[11px] font-mono text-amber-500 tracking-[0.08em]">
            MECHANICS · STATICS &amp; STRUCTURES
          </div>
          <div className="w-px h-3 bg-white/10" />
          <div className="text-[11px] text-slate-500">Shear &amp; Bending Moment</div>
        </div>
        <h1 className="font-display text-[clamp(1.5rem,3vw,2rem)] font-bold text-slate-100 mb-2.5 tracking-tight">
          Beam Analysis Calculator
        </h1>
        <p className="text-[15px] text-slate-500 m-0">
          Compute support reactions and plot interactive Shear Force (SFD) &amp; Bending Moment Diagrams (BMD).
        </p>
      </div>

      {/* Formulas & Presets */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex gap-3 flex-wrap">
          <div className="py-2 px-4 bg-[#0c1528] border border-white/5 rounded-md font-mono text-[14px] text-cyan-500">
            dV/dx = -w(x)
          </div>
          <div className="py-2 px-4 bg-[#0c1528] border border-white/5 rounded-md font-mono text-[14px] text-amber-500">
            dM/dx = V(x)
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {[
            { id: "center_point", label: "Center Point Load" },
            { id: "full_udl", label: "Uniform UDL" },
            { id: "cantilever_end", label: "Cantilever" },
            { id: "combined", label: "Combined Loads" },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => loadPreset(p.id as any)}
              className="py-1.5 px-3 bg-white/5 border border-white/10 rounded-md text-xs text-slate-400 hover:text-slate-200 hover:bg-white/10 cursor-pointer transition-colors focus:outline-none"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
        {/* Left: Inputs Panel */}
        <div className="flex flex-col gap-5">
          {/* Configuration */}
          <div className="bg-[#0c1528] border border-white/5 rounded-xl p-6">
            <div className="text-xs font-mono text-slate-600 tracking-wider mb-4">
              BEAM CONFIGURATION
            </div>

            {/* Beam Type Toggle */}
            <div className="mb-5">
              <label className="text-xs text-slate-500 mb-2 block">Support Type</label>
              <div className="grid grid-cols-2 gap-2 bg-[#060b18] p-1 rounded-lg border border-white/5">
                <button
                  type="button"
                  onClick={() => setBeamType("simply_supported")}
                  className={`py-2 px-3 text-xs font-semibold rounded-md border-none cursor-pointer transition-all ${
                    beamType === "simply_supported"
                      ? "bg-blue-500 text-white shadow-sm"
                      : "bg-transparent text-slate-500 hover:text-slate-300"
                  }`}
                >
                  Simply Supported
                </button>
                <button
                  type="button"
                  onClick={() => setBeamType("cantilever")}
                  className={`py-2 px-3 text-xs font-semibold rounded-md border-none cursor-pointer transition-all ${
                    beamType === "cantilever"
                      ? "bg-blue-500 text-white shadow-sm"
                      : "bg-transparent text-slate-500 hover:text-slate-300"
                  }`}
                >
                  Cantilever
                </button>
              </div>
            </div>

            {/* Length */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-slate-500">Span Length (L)</span>
                <span className="font-mono text-xs text-cyan-500">m</span>
              </div>
              <div className="flex border border-white/10 rounded-lg overflow-hidden bg-[#060b18] focus-within:ring-1 focus-within:ring-cyan-500/50">
                <input
                  type="number"
                  min="0.1"
                  step="0.5"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className="flex-1 py-2.5 px-3 bg-transparent border-none text-slate-200 text-sm font-mono outline-none"
                  placeholder="e.g. 6.0"
                />
                <div className="py-2.5 px-3 border-l border-white/5 text-xs font-mono text-slate-500 bg-white/5">
                  m
                </div>
              </div>
            </div>
          </div>

          {/* Point Loads */}
          <div className="bg-[#0c1528] border border-white/5 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs font-mono text-slate-600 tracking-wider">
                POINT LOADS (P)
              </div>
              <button
                type="button"
                onClick={addPointLoad}
                className="text-xs text-cyan-500 hover:text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 py-1 px-2.5 rounded border border-cyan-500/30 cursor-pointer transition-colors"
              >
                + Add Point Load
              </button>
            </div>

            {pointLoads.length === 0 ? (
              <div className="text-xs text-slate-600 py-3 text-center border border-dashed border-white/5 rounded-lg">
                No point loads added.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {pointLoads.map((pl, idx) => (
                  <div
                    key={pl.id}
                    className="p-3 bg-[#060b18] rounded-lg border border-white/5 flex items-center gap-2.5"
                  >
                    <div className="font-mono text-xs text-amber-500 min-w-[24px]">
                      P{idx + 1}
                    </div>
                    <div className="flex-1 flex gap-2">
                      <div>
                        <span className="text-[10px] text-slate-500 block mb-0.5">Force (kN)</span>
                        <input
                          type="number"
                          value={pl.p}
                          onChange={(e) => updatePointLoad(pl.id, "p", e.target.value)}
                          className="w-full py-1.5 px-2 bg-black/40 border border-white/10 rounded text-xs font-mono text-slate-200 outline-none"
                          placeholder="kN"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block mb-0.5">Location (x)</span>
                        <input
                          type="number"
                          value={pl.x}
                          onChange={(e) => updatePointLoad(pl.id, "x", e.target.value)}
                          className="w-full py-1.5 px-2 bg-black/40 border border-white/10 rounded text-xs font-mono text-slate-200 outline-none"
                          placeholder="m"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removePointLoad(pl.id)}
                      className="text-slate-600 hover:text-red-400 p-1.5 transition-colors cursor-pointer border-none bg-transparent"
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Distributed Loads */}
          <div className="bg-[#0c1528] border border-white/5 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs font-mono text-slate-600 tracking-wider">
                DISTRIBUTED LOADS (UDL)
              </div>
              <button
                type="button"
                onClick={addUDL}
                className="text-xs text-cyan-500 hover:text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 py-1 px-2.5 rounded border border-cyan-500/30 cursor-pointer transition-colors"
              >
                + Add UDL
              </button>
            </div>

            {udlLoads.length === 0 ? (
              <div className="text-xs text-slate-600 py-3 text-center border border-dashed border-white/5 rounded-lg">
                No distributed loads added.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {udlLoads.map((u, idx) => (
                  <div
                    key={u.id}
                    className="p-3 bg-[#060b18] rounded-lg border border-white/5 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-cyan-500">w{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeUDL(u.id)}
                        className="text-slate-600 hover:text-red-400 p-1 transition-colors cursor-pointer border-none bg-transparent"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-500 block mb-0.5">Load (kN/m)</span>
                        <input
                          type="number"
                          value={u.w}
                          onChange={(e) => updateUDL(u.id, "w", e.target.value)}
                          className="w-full py-1.5 px-2 bg-black/40 border border-white/10 rounded text-xs font-mono text-slate-200 outline-none"
                          placeholder="kN/m"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block mb-0.5">Start (x₁)</span>
                        <input
                          type="number"
                          value={u.start}
                          onChange={(e) => updateUDL(u.id, "start", e.target.value)}
                          className="w-full py-1.5 px-2 bg-black/40 border border-white/10 rounded text-xs font-mono text-slate-200 outline-none"
                          placeholder="m"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block mb-0.5">End (x₂)</span>
                        <input
                          type="number"
                          value={u.end}
                          onChange={(e) => updateUDL(u.id, "end", e.target.value)}
                          className="w-full py-1.5 px-2 bg-black/40 border border-white/10 rounded text-xs font-mono text-slate-200 outline-none"
                          placeholder="m"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Visualization & Diagrams */}
        <div className="flex flex-col gap-6">
          {/* Reaction Summary Card */}
          {results ? (
            <div className="bg-[#0c1528] border border-white/5 rounded-xl p-6">
              <div className="text-xs font-mono text-slate-600 tracking-wider mb-4">
                EQUILIBRIUM &amp; REACTIONS
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#060b18] border border-white/5 p-3.5 rounded-lg">
                  <div className="text-xs text-slate-500 mb-1">Reaction Ra</div>
                  <div className="font-mono text-lg font-bold text-cyan-400">
                    {results.reactions.Ra.toFixed(2)}{" "}
                    <span className="text-xs font-normal text-slate-500">kN</span>
                  </div>
                </div>

                {beamType === "simply_supported" && (
                  <div className="bg-[#060b18] border border-white/5 p-3.5 rounded-lg">
                    <div className="text-xs text-slate-500 mb-1">Reaction Rb</div>
                    <div className="font-mono text-lg font-bold text-cyan-400">
                      {results.reactions.Rb.toFixed(2)}{" "}
                      <span className="text-xs font-normal text-slate-500">kN</span>
                    </div>
                  </div>
                )}

                {beamType === "cantilever" && (
                  <div className="bg-[#060b18] border border-white/5 p-3.5 rounded-lg">
                    <div className="text-xs text-slate-500 mb-1">Wall Moment Ma</div>
                    <div className="font-mono text-lg font-bold text-amber-400">
                      {results.reactions.Ma?.toFixed(2)}{" "}
                      <span className="text-xs font-normal text-slate-500">kN·m</span>
                    </div>
                  </div>
                )}

                <div className="bg-[#060b18] border border-white/5 p-3.5 rounded-lg">
                  <div className="text-xs text-slate-500 mb-1">Max Moment (Mmax)</div>
                  <div className="font-mono text-lg font-bold text-amber-400">
                    {Math.max(Math.abs(results.maxMoment), Math.abs(results.minMoment)).toFixed(2)}{" "}
                    <span className="text-xs font-normal text-slate-500">kN·m</span>
                  </div>
                </div>

                <div className="bg-[#060b18] border border-white/5 p-3.5 rounded-lg">
                  <div className="text-xs text-slate-500 mb-1">Max Shear (Vmax)</div>
                  <div className="font-mono text-lg font-bold text-green-400">
                    {Math.max(Math.abs(results.maxShear), Math.abs(results.minShear)).toFixed(2)}{" "}
                    <span className="text-xs font-normal text-slate-500">kN</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#0c1528] border border-white/5 rounded-xl p-8 text-center text-slate-600 text-sm">
              Add at least one load to compute reactions and diagram.
            </div>
          )}

          {/* Shear Force Diagram (SFD) */}
          {results && (
            <div className="bg-[#0c1528] border border-white/5 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-500" />
                  <span className="text-xs font-mono text-slate-300 tracking-wider">
                    SHEAR FORCE DIAGRAM (SFD) · V(x) [kN]
                  </span>
                </div>
                <div className="text-xs font-mono text-slate-500">
                  Vmax: {results.maxShear.toFixed(2)} kN
                </div>
              </div>

              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={results.chartData} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                    <defs>
                      <linearGradient id="shearGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.04)" />
                    <XAxis
                      dataKey="x"
                      stroke="#334155"
                      tick={{ fill: "#475569", fontSize: 11, fontFamily: "JetBrains Mono" }}
                      label={{ value: "x [m]", position: "insideBottomRight", offset: -4, fill: "#475569", fontSize: 11 }}
                    />
                    <YAxis
                      stroke="#334155"
                      tick={{ fill: "#475569", fontSize: 11, fontFamily: "JetBrains Mono" }}
                      label={{ value: "V [kN]", angle: -90, position: "insideLeft", offset: 10, fill: "#475569", fontSize: 11 }}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div className="bg-[#0c1528] border border-white/10 rounded-md py-2 px-3 font-mono text-xs shadow-lg">
                            <div className="text-slate-500 mb-0.5">x = {label} m</div>
                            <div className="text-cyan-400 font-semibold">
                              V = {Number(payload[0].value).toFixed(2)} kN
                            </div>
                          </div>
                        );
                      }}
                    />
                    <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
                    <Area
                      type="monotone"
                      dataKey="shear"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      fill="url(#shearGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Bending Moment Diagram (BMD) */}
          {results && (
            <div className="bg-[#0c1528] border border-white/5 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-xs font-mono text-slate-300 tracking-wider">
                    BENDING MOMENT DIAGRAM (BMD) · M(x) [kN·m]
                  </span>
                </div>
                <div className="text-xs font-mono text-slate-500">
                  Mmax: {results.maxMoment.toFixed(2)} kN·m at x={results.maxMomentLocation.toFixed(2)}m
                </div>
              </div>

              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={results.chartData} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                    <defs>
                      <linearGradient id="momentGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.04)" />
                    <XAxis
                      dataKey="x"
                      stroke="#334155"
                      tick={{ fill: "#475569", fontSize: 11, fontFamily: "JetBrains Mono" }}
                      label={{ value: "x [m]", position: "insideBottomRight", offset: -4, fill: "#475569", fontSize: 11 }}
                    />
                    <YAxis
                      stroke="#334155"
                      tick={{ fill: "#475569", fontSize: 11, fontFamily: "JetBrains Mono" }}
                      label={{ value: "M [kN·m]", angle: -90, position: "insideLeft", offset: 10, fill: "#475569", fontSize: 11 }}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div className="bg-[#0c1528] border border-white/10 rounded-md py-2 px-3 font-mono text-xs shadow-lg">
                            <div className="text-slate-500 mb-0.5">x = {label} m</div>
                            <div className="text-amber-400 font-semibold">
                              M = {Number(payload[0].value).toFixed(2)} kN·m
                            </div>
                          </div>
                        );
                      }}
                    />
                    <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
                    <Area
                      type="monotone"
                      dataKey="moment"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      fill="url(#momentGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
