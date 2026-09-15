import { useState } from "react";

type Category = "force" | "pressure" | "energy" | "temperature" | "length" | "mass";

const CATEGORIES: { key: Category; label: string }[] = [
  { key: "force", label: "Force" },
  { key: "pressure", label: "Pressure" },
  { key: "energy", label: "Energy" },
  { key: "temperature", label: "Temperature" },
  { key: "length", label: "Length" },
  { key: "mass", label: "Mass" },
];

type Unit = { label: string; toSI: (v: number) => number; fromSI: (v: number) => number };

const UNITS: Record<Category, Unit[]> = {
  force: [
    { label: "N", toSI: (v) => v, fromSI: (v) => v },
    { label: "kN", toSI: (v) => v * 1000, fromSI: (v) => v / 1000 },
    { label: "lbf", toSI: (v) => v * 4.44822, fromSI: (v) => v / 4.44822 },
    { label: "kgf", toSI: (v) => v * 9.80665, fromSI: (v) => v / 9.80665 },
    { label: "MN", toSI: (v) => v * 1e6, fromSI: (v) => v / 1e6 },
  ],
  pressure: [
    { label: "Pa", toSI: (v) => v, fromSI: (v) => v },
    { label: "kPa", toSI: (v) => v * 1000, fromSI: (v) => v / 1000 },
    { label: "MPa", toSI: (v) => v * 1e6, fromSI: (v) => v / 1e6 },
    { label: "bar", toSI: (v) => v * 1e5, fromSI: (v) => v / 1e5 },
    { label: "atm", toSI: (v) => v * 101325, fromSI: (v) => v / 101325 },
    { label: "psi", toSI: (v) => v * 6894.76, fromSI: (v) => v / 6894.76 },
  ],
  energy: [
    { label: "J", toSI: (v) => v, fromSI: (v) => v },
    { label: "kJ", toSI: (v) => v * 1000, fromSI: (v) => v / 1000 },
    { label: "MJ", toSI: (v) => v * 1e6, fromSI: (v) => v / 1e6 },
    { label: "cal", toSI: (v) => v * 4.1868, fromSI: (v) => v / 4.1868 },
    { label: "kcal", toSI: (v) => v * 4186.8, fromSI: (v) => v / 4186.8 },
    { label: "BTU", toSI: (v) => v * 1055.06, fromSI: (v) => v / 1055.06 },
    { label: "kWh", toSI: (v) => v * 3.6e6, fromSI: (v) => v / 3.6e6 },
  ],
  temperature: [
    { label: "°C", toSI: (v) => v + 273.15, fromSI: (v) => v - 273.15 },
    { label: "K", toSI: (v) => v, fromSI: (v) => v },
    { label: "°F", toSI: (v) => (v - 32) * 5/9 + 273.15, fromSI: (v) => (v - 273.15) * 9/5 + 32 },
    { label: "°R", toSI: (v) => v * 5/9, fromSI: (v) => v * 9/5 },
  ],
  length: [
    { label: "m", toSI: (v) => v, fromSI: (v) => v },
    { label: "mm", toSI: (v) => v * 0.001, fromSI: (v) => v * 1000 },
    { label: "cm", toSI: (v) => v * 0.01, fromSI: (v) => v * 100 },
    { label: "km", toSI: (v) => v * 1000, fromSI: (v) => v / 1000 },
    { label: "in", toSI: (v) => v * 0.0254, fromSI: (v) => v / 0.0254 },
    { label: "ft", toSI: (v) => v * 0.3048, fromSI: (v) => v / 0.3048 },
  ],
  mass: [
    { label: "kg", toSI: (v) => v, fromSI: (v) => v },
    { label: "g", toSI: (v) => v * 0.001, fromSI: (v) => v * 1000 },
    { label: "t", toSI: (v) => v * 1000, fromSI: (v) => v / 1000 },
    { label: "lb", toSI: (v) => v * 0.453592, fromSI: (v) => v / 0.453592 },
    { label: "oz", toSI: (v) => v * 0.0283495, fromSI: (v) => v / 0.0283495 },
  ],
};

import { Link } from "react-router-dom";

import { AnimatedArrow } from "../../components/AnimatedArrow";

export default function UnitConverterPage() {
  const [category, setCategory] = useState<Category>("force");
  const [fromUnit, setFromUnit] = useState("N");
  const [toUnit, setToUnit] = useState("kN");
  const [value, setValue] = useState("");

  const units = UNITS[category];
  const from = units.find((u) => u.label === fromUnit) ?? units[0];
  const to = units.find((u) => u.label === toUnit) ?? units[1];
  const numVal = Number(value);
  const result = value && !isNaN(numVal) ? to.fromSI(from.toSI(numVal)) : null;

  const switchCategory = (cat: Category) => {
    setCategory(cat);
    setFromUnit(UNITS[cat][0].label);
    setToUnit(UNITS[cat][1].label);
    setValue("");
  };

  return (
    <div className="max-w-7xl mx-auto px-8 md:px-12 py-12">
      <Link to="/tools" className="text-blue-500 hover:text-blue-400 mb-6 inline-block text-sm btn-with-arrow arrow-left">
        <AnimatedArrow direction="left" />
        <span>Back to Tools</span>
      </Link>

      <div className="py-2 pb-8">
        <p className="label-caps mb-3" style={{ color: "var(--color-primary)" }}>Utilities · Conversion</p>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 4vw, 2.6rem)", lineHeight: 1.08, letterSpacing: "-0.025em" }} className="mb-2">
          Engineering Unit Converter
        </h1>
        <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>
          Convert between engineering units across six physical quantity categories.
        </p>
      </div>

      <div className="pb-14 grid md:grid-cols-[180px_1fr] gap-8">
        {/* Category sidebar */}
        <div>
          <p className="label-caps mb-3">Category</p>
          <div className="flex flex-col gap-0.5">
            {CATEGORIES.map((c) => (
              <button key={c.key} onClick={() => switchCategory(c.key)}
                className={`text-left px-3 py-2.5 text-sm rounded-lg transition-colors ${category !== c.key ? "hover:bg-card" : ""}`}
                style={{
                  background: category === c.key ? "var(--color-foreground)" : "transparent",
                  color: category === c.key ? "var(--color-card)" : "var(--color-foreground)",
                  fontWeight: category === c.key ? 500 : 400,
                }}>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Converter main */}
        <div className="flex flex-col gap-5">
          {/* Conversion widget */}
          <div className="p-6 rounded-xl" style={{ background: "var(--color-card)", boxShadow: "var(--shadow-xs)" }}>
            <p className="text-xs font-medium mb-5" style={{ color: "var(--color-muted-foreground)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Convert {CATEGORIES.find(c => c.key === category)?.label}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_40px_1fr] gap-3 items-end sm:items-end">
              {/* From */}
              <div>
                <p className="label-caps mb-2">From</p>
                <SelectDropdown value={fromUnit} onChange={setFromUnit} options={units.map(u => u.label)} />
                <div className="mt-2">
                  <input type="number" step="any" value={value} placeholder="Enter value"
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full px-3 py-3 text-lg"
                    style={{ background: "var(--color-card)", color: "var(--color-foreground)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", fontFamily: "var(--font-mono-data)" }} />
                </div>
              </div>

              {/* Swap */}
              <button
                onClick={() => { const t = fromUnit; setFromUnit(toUnit); setToUnit(t); }}
                className="mb-0.5 flex items-center justify-center w-9 h-9 rounded-lg transition-colors self-end hover:text-foreground"
                style={{ background: "var(--color-card)", color: "var(--color-muted-foreground)" }}
              >
                <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none">
                  <path d="M3 6H13M9 2L13 6L9 10M13 10H3M7 6L3 10L7 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* To */}
              <div>
                <p className="label-caps mb-2">To</p>
                <SelectDropdown value={toUnit} onChange={setToUnit} options={units.map(u => u.label)} />
                <div
                  className="mt-2 px-3 py-3 rounded-lg"
                  style={{ background: result !== null ? "var(--color-foreground)" : "rgba(255,255,255,0.04)", minHeight: 52, border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <span className="num text-lg font-semibold"
                    style={{ color: result !== null ? "var(--color-card)" : "var(--color-muted-foreground)", fontFamily: "var(--font-mono-data)" }}>
                    {result !== null ? result.toPrecision(6) : "—"}
                  </span>
                </div>
              </div>
            </div>

            {result !== null && (
              <div className="mt-5 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="num text-sm text-center" style={{ color: "var(--color-muted-foreground)" }}>
                  <span style={{ color: "var(--color-foreground)" }}>{value} {fromUnit}</span>
                  {" = "}
                  <span style={{ color: "var(--color-primary)", fontWeight: 600 }}>{result.toPrecision(6)} {toUnit}</span>
                </p>
              </div>
            )}
          </div>

          {/* All units table */}
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)", boxShadow: "var(--shadow-xs)" }}>
            <div className="grid grid-cols-3 px-5 py-3 rounded-t-xl" style={{ background: "var(--color-card)" }}>
              <span className="label-caps">Unit</span>
              <span className="label-caps">Symbol</span>
              <span className="label-caps">Converted</span>
            </div>
            {units.map((u, i) => {
              const conv = value && !isNaN(numVal) ? u.fromSI(from.toSI(numVal)) : null;
              const isTarget = u.label === toUnit;
              return (
                <div key={u.label} className="grid grid-cols-3 px-5 py-3"
                  style={{
                    background: isTarget ? "rgba(59,130,246,0.1)" : "var(--color-card)",
                    borderBottom: i < units.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  }}>
                  <span className="text-sm" style={{ color: "var(--color-foreground)", fontWeight: isTarget ? 500 : 400 }}>{u.label}</span>
                  <span className="num text-xs" style={{ color: "var(--color-muted-foreground)" }}>{u.label}</span>
                  <span className="num text-sm" style={{ color: conv !== null ? (isTarget ? "var(--color-primary)" : "var(--color-foreground)") : "var(--color-muted-foreground)", fontWeight: isTarget ? 600 : 400 }}>
                    {conv !== null ? conv.toPrecision(5) : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function SelectDropdown({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 text-sm appearance-none"
        style={{ background: "var(--color-card)", color: "var(--color-foreground)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px" }}>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg viewBox="0 0 10 6" className="w-2.5 h-1.5" fill="none">
          <path d="M1 1L5 5L9 1" stroke="var(--color-muted-foreground)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}


