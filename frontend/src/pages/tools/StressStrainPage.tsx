import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useStressCalculator } from "../../hooks/useStressCalculator";
import { useDebounce } from "../../hooks/useDebounce";
import { EngineeringValue } from "../../components/EngineeringValue";
import type { StressInput, StressResult } from "../../api/calculators";
import { AxiosError } from "axios";

type UnitSystem = "SI" | "Imperial";

// Client-side validation: mostly to prevent sending obvious garbage.
const formSchema = z.object({
  force: z.coerce.number(),
  area: z.coerce.number().positive("Must be positive"),
  modulus: z.coerce.number().positive("Must be positive"),
  length: z.coerce.number().positive("Must be positive"),
});

type FormValues = z.infer<typeof formSchema>;

const unitLabels: Record<UnitSystem, { force: string; area: string; modulus: string; length: string }> = {
  SI: { force: "N", area: "m2", modulus: "GPa", length: "m" },
  Imperial: { force: "lbf", area: "in2", modulus: "psi", length: "in" },
};

const exampleValues: Record<UnitSystem, FormValues> = {
  SI: { force: 50000, area: 0.002, modulus: 200, length: 1.5 },
  Imperial: { force: 10000, area: 0.5, modulus: 29000000, length: 60 },
};

export default function StressStrainPage() {
  const [units, setUnits] = useState<UnitSystem>("SI");

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors: formErrors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: exampleValues.SI,
    mode: "onChange",
  });

  const currentFormValues = watch();
  const debouncedValues = useDebounce(currentFormValues, 300);

  // Derive API input payload
  const u = unitLabels[units];

  const apiInput: StressInput = {
    force: Number(debouncedValues.force),
    force_unit: u.force,
    area: Number(debouncedValues.area),
    area_unit: u.area,
    youngs_modulus: Number(debouncedValues.modulus),
    youngs_modulus_unit: units === "SI" ? "GPa" : u.modulus,
    original_length: Number(debouncedValues.length),
    original_length_unit: u.length,
    output_unit_system: units,
  };

  const { data: results, isFetching, error: apiError } = useStressCalculator(apiInput, isValid);

  const loadExample = () => {
    reset(exampleValues[units]);
  };

  const handleUnitChange = (sys: UnitSystem) => {
    setUnits(sys);
    reset(exampleValues[sys]);
  };

  // Helper to extract backend validation errors (HTTP 400)
  let backendErrors: Record<string, string[]> = {};
  let serverDown = false;

  if (apiError instanceof AxiosError) {
    if (apiError.response && apiError.response.status === 400) {
      backendErrors = apiError.response.data as Record<string, string[]>;
    } else if (!apiError.response || apiError.response.status >= 500) {
      serverDown = true;
    }
  }

  // Combine client and server errors for display
  const getError = (field: keyof FormValues | string) => {
    // 1. Zod client error
    if (field in formErrors && formErrors[field as keyof FormValues]) {
      return formErrors[field as keyof FormValues]?.message;
    }
    // 2. Backend validation error mapped to form fields
    if (field === "modulus" && backendErrors["youngs_modulus"]) return backendErrors["youngs_modulus"][0];
    if (field === "length" && backendErrors["original_length"]) return backendErrors["original_length"][0];
    if (backendErrors[field]) return backendErrors[field][0];

    return undefined;
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
        <div className="bg-[#0c1528] border border-white/5 rounded-xl p-7 flex flex-col">
          {/* Unit system toggle */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-xs font-mono text-slate-600 tracking-wider">
              INPUT PARAMETERS
            </div>
            <div className="flex bg-[#060b18] rounded-md p-0.5 border border-white/5">
              {(["SI", "Imperial"] as UnitSystem[]).map((sys) => (
                <button
                  key={sys}
                  onClick={() => handleUnitChange(sys)}
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

          <form className="flex flex-col gap-4 flex-1">
            <Controller
              name="force"
              control={control}
              render={({ field }) => (
                <InputField
                  label="Applied Force"
                  symbol="F"
                  value={field.value}
                  unit={u.force}
                  error={getError("force")}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="e.g. 50000"
                />
              )}
            />
            <Controller
              name="area"
              control={control}
              render={({ field }) => (
                <InputField
                  label="Cross-sectional Area"
                  symbol="A"
                  value={field.value}
                  unit={u.area}
                  error={getError("area")}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="e.g. 0.002"
                  note="Must be positive"
                />
              )}
            />
            <Controller
              name="modulus"
              control={control}
              render={({ field }) => (
                <InputField
                  label="Young's Modulus"
                  symbol="E"
                  value={field.value}
                  unit={units === "SI" ? "GPa" : u.modulus}
                  error={getError("modulus")}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder={units === "SI" ? "e.g. 200 (Steel)" : "e.g. 29000000"}
                />
              )}
            />
            <Controller
              name="length"
              control={control}
              render={({ field }) => (
                <InputField
                  label="Original Length"
                  symbol="L"
                  value={field.value}
                  unit={u.length}
                  error={getError("length")}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="e.g. 1.5"
                />
              )}
            />
          </form>

          <button
            onClick={loadExample}
            type="button"
            className="mt-5 py-1.5 px-4 text-xs bg-white/5 border border-white/10 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/10 cursor-pointer transition-colors focus:outline-none self-start"
          >
            Load Example Values
          </button>
        </div>

        {/* Results panel */}
        <div className="flex flex-col gap-4">
          {serverDown ? (
            <div className="bg-[#0c1528] border border-red-500/20 rounded-xl p-10 flex flex-col items-center justify-center text-center h-full min-h-[200px]">
              <div className="text-red-400 mb-2 font-semibold">Service Unavailable</div>
              <div className="text-slate-500 text-sm">
                The calculation engine is currently offline. Please ensure the backend is running.
              </div>
            </div>
          ) : !isValid ? (
            <div className="bg-[#0c1528] border border-white/5 rounded-xl p-10 flex items-center justify-center text-slate-600 text-sm text-center h-full min-h-[200px]">
              Enter valid parameters to compute results.
            </div>
          ) : results ? (
            <>
              <ResultsPanel results={results} isFetching={isFetching} />
              <StressBarChart stressSiPa={results.values_si.stress} />
            </>
          ) : (
            <div className="bg-[#0c1528] border border-white/5 rounded-xl p-10 flex items-center justify-center text-slate-600 text-sm text-center h-full min-h-[200px]">
              {isFetching ? "Calculating..." : "Waiting for input..."}
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
  value: number | string;
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
          value={value === undefined || Number.isNaN(value) ? "" : value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          step="any"
          className="flex-1 py-2.5 px-3.5 bg-transparent border-none text-slate-200 text-sm font-mono outline-none min-w-0"
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
  isFetching,
}: {
  results: StressResult;
  isFetching: boolean;
}) {
  const rows = [
    {
      label: "Normal Stress",
      symbol: "σ",
      value: results.stress,
      unit: results.units.stress,
      color: "border-l-amber-500",
      symColor: "text-amber-500",
    },
    {
      label: "Axial Strain",
      symbol: "ε",
      value: results.strain,
      unit: results.units.strain,
      color: "border-l-blue-500",
      symColor: "text-blue-500",
    },
    {
      label: "Deformation",
      symbol: "δ",
      value: results.deformation,
      unit: results.units.deformation,
      color: "border-l-green-500",
      symColor: "text-green-500",
    },
  ];

  return (
    <div className={`bg-[#0c1528] border border-white/5 rounded-xl p-7 transition-opacity duration-300 ${isFetching ? 'opacity-70' : 'opacity-100'}`}>
      <div className="flex items-center justify-between mb-5">
        <div className="text-xs font-mono text-slate-600 tracking-wider">
          RESULTS
        </div>
        {isFetching && (
          <div className="text-xs text-blue-400 font-medium animate-pulse">
            Updating...
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {rows.map((r) => (
          <div
            key={r.symbol}
            className={`bg-[#060b18] border border-white/5 border-l-[3px] rounded-r-lg p-3.5 flex flex-col min-w-0 ${r.color}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={`font-mono text-[15px] ${r.symColor}`}>{r.symbol}</span>
              <span className="text-[13px] text-slate-500 truncate">{r.label}</span>
            </div>
            <div className="pl-6">
              <EngineeringValue value={r.value} unit={r.unit} precision={4} />
            </div>
          </div>
        ))}
      </div>

      {results.warnings && results.warnings.length > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          {results.warnings.map((w, idx) => (
            <div key={idx} className="flex gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <span className="text-amber-500">⚠</span>
              <span className="text-xs text-amber-500/90 leading-relaxed">{w}</span>
            </div>
          ))}
        </div>
      )}

      {/* Validation note */}
      {(!results.warnings || results.warnings.length === 0) && (
        <div className="mt-4 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
          <span className="text-xs text-green-500">All inputs valid — results computed</span>
        </div>
      )}
    </div>
  );
}

// ─── Stress Bar Visual ─────────────────────────────────────────────────────────

function StressBarChart({ stressSiPa }: { stressSiPa: number }) {
  // Convert backend SI raw value (Pa) to MPa for the bar chart
  const MPa = stressSiPa / 1e6;
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
