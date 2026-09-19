import { useState } from "react"
import { Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { EngineeringValue } from "../../components/EngineeringValue"
import { useDebounce } from "../../hooks/useDebounce"
import { useReynoldsCalculator } from "../../hooks/useReynoldsCalculator"
import type { ReynoldsInput } from "../../api/calculators"
import { AxiosError } from "axios"

const fluidPresets = [
  { name: "Air (20°C)", rho: 1.204, mu: 0.00001825 },
  { name: "Engine Oil", rho: 870, mu: 0.1 },
  { name: "Glycerol (25°C)", rho: 1261, mu: 0.954 },
  { name: "Mercury (20°C)", rho: 13546, mu: 0.00157 },
  { name: "Water (20°C)", rho: 998.2, mu: 0.001002 },
]

const formSchema = z.object({
  rho: z.coerce.number().positive("Must be positive"),
  v: z.coerce
    .number()
    .refine((val) => val !== 0, { message: "Must be nonzero" }),
  D: z.coerce.number().positive("Must be positive"),
  mu: z.coerce.number().positive("Must be positive"),
})

type FormValues = z.infer<typeof formSchema>

function getFlowRegimeUI(
  regime: string,
): {
  label: string
  description: string
  color: string
  border: string
  bg: string
} {
  if (regime === "laminar")
    return {
      label: "Laminar",
      description:
        "Smooth, ordered flow. Fluid moves in parallel layers with no disruption between them.",
      color: "text-green-500",
      border: "border-green-500",
      bg: "bg-green-500",
    }
  if (regime === "transitional")
    return {
      label: "Transitional",
      description:
        "Unstable flow between laminar and turbulent. Neither regime is fully established.",
      color: "text-accent",
      border: "border-amber-500",
      bg: "bg-amber-500",
    }
  return {
    label: "Turbulent",
    description:
      "Chaotic, irregular flow with eddies and mixing across the pipe cross-section.",
    color: "text-red-500",
    border: "border-red-500",
    bg: "bg-red-500",
  }
}

export default function ReynoldsPage() {
  const [selectedFluid, setSelectedFluid] = useState<number | "custom">(4)

  const {
    register,
    watch,
    setValue,
    formState: { errors: formErrors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { rho: 998.2, v: 2.5, D: 0.05, mu: 0.001002 },
    mode: "onChange",
  })

  const currentValues = watch()
  const debouncedValues = useDebounce(currentValues, 300)

  const apiInput: ReynoldsInput = {
    density: Number(debouncedValues.rho),
    velocity: Number(debouncedValues.v),
    diameter: Number(debouncedValues.D),
    dynamic_viscosity: Number(debouncedValues.mu),
  }

  const {
    data: result,
    isFetching,
    error: apiError,
  } = useReynoldsCalculator(apiInput, isValid)

  let backendErrors: Record<string, string[]> = {}
  let serverDown = false
  if (apiError instanceof AxiosError) {
    if (apiError.response && apiError.response.status === 400) {
      backendErrors = (apiError.response.data as Record<string, string[]>)
    } else if (!apiError.response || apiError.response.status >= 500) {
      serverDown = true
    }
  }

  const getError = (field: keyof FormValues | string) => {
    if (field in formErrors && formErrors[(field as keyof FormValues)]) {
      return formErrors[(field as keyof FormValues)]?.message
    }
    if (field === "rho" && backendErrors["density"])
      return backendErrors["density"][0]
    if (field === "mu" && backendErrors["dynamic_viscosity"])
      return backendErrors["dynamic_viscosity"][0]
    if (field === "v" && backendErrors["velocity"])
      return backendErrors["velocity"][0]
    if (field === "D" && backendErrors["diameter"])
      return backendErrors["diameter"][0]
    if (field === "viscosity" && backendErrors["viscosity"])
      return backendErrors["viscosity"][0]
    return null
  }

  const Re = result ? result.reynolds_number : null
  const regime = result ? getFlowRegimeUI(result.regime) : null

  const applyPreset = (i: number) => {
    const p = fluidPresets[i]
    setSelectedFluid(i)
    setValue("rho", p.rho, { shouldValidate: true })
    setValue("mu", p.mu, { shouldValidate: true })
  }

  const applyCustom = () => {
    setSelectedFluid("custom")
    setValue("rho", "" as any, { shouldValidate: true })
    setValue("mu", "" as any, { shouldValidate: true })
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* Breadcrumb */}
      <div className="mb-8 flex items-center gap-2 text-[13px] text-slate-600">
        <Link
          to="/tools"
          className="text-slate-500 no-underline transition-colors hover:text-slate-400"
        >
          Tools
        </Link>
        <span>→</span>
        <span className="text-slate-400">Reynolds Number</span>
      </div>

      <div className="mb-9">
        <div className="mb-2.5 flex items-center gap-3 font-mono text-[11px] tracking-[0.08em] text-primary">
          FLUIDS · PIPE FLOW
          {isFetching && (
            <span className="inline-flex items-center gap-1.5 text-cyan-400/70">
              <span className="animate-ping rounded-full bg-cyan-400/70 h-1.5 w-1.5"></span>
              calculating
            </span>
          )}
        </div>
        <h1 className="mb-2.5 font-display text-[clamp(1.5rem,3vw,2rem)] font-bold tracking-tight text-slate-100">
          Reynolds Number Calculator
        </h1>
        <p className="m-0 text-[15px] text-slate-500">
          Determine the flow regime — laminar, transitional, or turbulent — for
          pipe flow.
        </p>
      </div>

      {/* Formula */}
      <div className="mb-8 flex flex-wrap gap-3">
        <div className="rounded-md border border-white/5 bg-card px-4 py-2 font-mono text-[15px] text-primary">
          Re = ρ · v · D / μ
        </div>
        <div className="flex items-center rounded-md border border-white/5 bg-card px-4 py-2 font-mono text-[13px] text-primary">
          ν = μ / ρ &nbsp;&nbsp; Re = v · D / ν
        </div>
      </div>

      {serverDown && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          Cannot connect to calculation engine. Please ensure the backend is
          running.
        </div>
      )}
      {getError("viscosity") && (
        <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-400">
          {getError("viscosity")}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: inputs */}
        <div className="flex flex-col gap-4">
          {/* Fluid presets */}
          <div className="rounded-xl border border-white/5 bg-card p-6">
            <div className="mb-3.5 font-mono text-xs tracking-wider text-slate-600">
              FLUID PRESETS
            </div>
            <div className="flex gap-2">
              <select
                value={selectedFluid === "custom" ? "custom" : selectedFluid}
                onChange={(e) => {
                  if (e.target.value === "custom") applyCustom()
                  else applyPreset(Number(e.target.value))
                }}
                className={`flex-1 cursor-pointer appearance-none rounded-md border px-3.5 py-2 text-[13px] outline-none transition-all ${
                  selectedFluid !== "custom"
                    ? "border-cyan-500/50 bg-cyan-500/10 text-primary shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                    : "border-white/5 bg-white/5 text-slate-400 hover:border-cyan-500/30 hover:bg-cyan-500/5 focus:border-cyan-500/50"
                }`}
              >
                <option
                  value="custom"
                  disabled
                  className="bg-card text-slate-400"
                >
                  Select a fluid preset...
                </option>
                {fluidPresets.map((f, i) => (
                  <option
                    key={f.name}
                    value={i}
                    className="bg-card text-slate-200"
                  >
                    {f.name} (μ={f.mu})
                  </option>
                ))}
              </select>

              <button
                onClick={applyCustom}
                className={`flex cursor-pointer items-center justify-center whitespace-nowrap rounded-md border px-4 py-2 text-[13px] transition-all focus:outline-none ${
                  selectedFluid === "custom"
                    ? "border-cyan-500/50 bg-cyan-500/10 text-primary shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                    : "border-white/5 bg-white/5 text-slate-500 hover:border-cyan-500/30 hover:bg-cyan-500/5 hover:text-cyan-400"
                }`}
              >
                Custom
              </button>
            </div>
          </div>

          {/* Parameters */}
          <div className="rounded-xl border border-white/5 bg-card p-6">
            <div className="mb-4 font-mono text-xs tracking-wider text-slate-600">
              FLOW PARAMETERS
            </div>
            <div className="flex flex-col gap-3.5">
              {([
                {
                  key: "rho",
                  sym: "ρ",
                  label: "Fluid Density",
                  unit: "kg/m³",
                  placeholder: "e.g. 998.2",
                },
                {
                  key: "v",
                  sym: "v",
                  label: "Mean Velocity",
                  unit: "m/s",
                  placeholder: "e.g. 2.5",
                },
                {
                  key: "D",
                  sym: "D",
                  label: "Pipe Diameter",
                  unit: "m",
                  placeholder: "e.g. 0.05",
                },
                {
                  key: "mu",
                  sym: "μ",
                  label: "Dynamic Viscosity",
                  unit: "Pa·s",
                  placeholder: "e.g. 0.001002",
                },
              ] as const).map((f) => (
                <div key={f.key}>
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="min-w-[20px] font-mono text-sm text-primary">
                      {f.sym}
                    </span>
                    <span className="text-xs text-slate-500">{f.label}</span>
                  </div>
                  <div
                    className={`flex overflow-hidden rounded-lg border transition-colors ${
                      getError(f.key)
                        ? "border-red-500/50 bg-red-500/5 focus-within:ring-1 focus-within:ring-red-500/50"
                        : "border-white/10 bg-secondary focus-within:ring-1 focus-within:ring-cyan-500/50"
                    }`}
                  >
                    <input
                      type="number"
                      step="any"
                      {...register(f.key as keyof FormValues)}
                      placeholder={f.placeholder}
                      className="flex-1 border-none bg-transparent px-3 py-2.5 font-mono text-sm text-slate-200 outline-none"
                    />
                    <div className="flex items-center whitespace-nowrap border-l border-white/5 bg-white/5 px-3 py-2.5 font-mono text-[11px] text-slate-500">
                      {f.unit}
                    </div>
                  </div>
                  {getError(f.key) && (
                    <div className="ml-1 mt-1.5 text-[11px] text-red-400">
                      {getError(f.key)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: result */}
        <div className="flex flex-col gap-4">
          {Re !== null && regime && result ? (
            <>
              {/* Main Re result */}
              <div
                className={`rounded-xl border border-white/5 border-t-[3px] bg-card p-8 text-center ${regime.border} transition-opacity duration-300 ${
                  isFetching ? "opacity-60" : "opacity-100"
                }`}
                style={{ borderTopColor: regime.border }}
              >
                <div className="mb-4 font-mono text-[11px] tracking-widest text-slate-500">
                  REYNOLDS NUMBER
                </div>
                <div className="mb-2 flex w-full justify-center overflow-hidden font-mono text-[clamp(2.5rem,6vw,4rem)] font-bold leading-none tracking-tight text-slate-100">
                  <EngineeringValue
                    value={Re}
                    unit=""
                    precision={0}
                    valueClassName="text-[clamp(1.5rem,4vw,3.5rem)]"
                  />
                </div>
                <div className="mb-6 text-xs text-slate-500">dimensionless</div>

                {/* Flow regime badge */}
                <div
                  className={`inline-flex items-center gap-2 rounded-full border px-5 py-2 ${regime.border} border-opacity-30 bg-white/5`}
                >
                  <span className={`rounded-full ${regime.bg} h-2 w-2`} />
                  <span
                    className={`font-display text-lg font-bold ${regime.color}`}
                  >
                    {regime.label} Flow
                  </span>
                </div>

                <p className="mx-auto mb-0 mt-4 max-w-sm text-sm leading-relaxed text-slate-500">
                  {regime.description}
                </p>
              </div>

              {/* Flow regime scale */}
              <div className="rounded-xl border border-white/5 bg-card p-6">
                <div className="mb-4 font-mono text-xs tracking-wider text-slate-600">
                  FLOW REGIME SCALE
                </div>
                <FlowRegimeScale Re={Re} regime={result.regime} />
              </div>

              {/* Summary table */}
              <div className="rounded-xl border border-white/5 bg-card p-6">
                <div className="mb-4 font-mono text-xs tracking-wider text-slate-600">
                  COMPUTED VALUES
                </div>
                <div className="flex flex-col gap-1">
                  {[
                    {
                      label: "Reynolds Number",
                      val: (
                        <EngineeringValue
                          value={Re}
                          unit=""
                          precision={1}
                          valueClassName="inline"
                        />
                      ),
                      sym: "Re",
                    },
                    {
                      label: "Flow Regime",
                      val: regime.label,
                      sym: "—",
                      colored: regime.color,
                    },
                  ].map((r) => (
                    <div
                      key={r.sym + r.label}
                      className="flex items-center justify-between border-b border-white/5 py-2 text-[13px] last:border-0"
                    >
                      <span className="text-slate-500">{r.label}</span>
                      <span
                        className={`font-mono font-semibold ${r.colored ?? "text-slate-200"}`}
                      >
                        {r.val} {r.unit ?? ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full min-h-[200px] items-center justify-center rounded-xl border border-white/5 bg-card p-10 text-sm text-slate-500">
              Enter valid inputs to compute Re.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FlowRegimeScale({ Re, regime }: { Re: number; regime: string }) {
  const blocks = [
    {
      key: "laminar",
      label: "Laminar",
      color: "bg-green-500",
      text: "text-green-500",
    },
    {
      key: "transitional",
      label: "Transitional",
      color: "bg-amber-500",
      text: "text-accent",
    },
    {
      key: "turbulent",
      label: "Turbulent",
      color: "bg-red-500",
      text: "text-red-500",
    },
  ]

  return (
    <div>
      <div className="mb-2 flex h-6 overflow-hidden rounded-full">
        {blocks.map((b) => (
          <div
            key={b.key}
            className={`flex-1 transition-all ${
              regime === b.key ? b.color : "bg-white/5 opacity-50"
            }`}
          />
        ))}
      </div>
      <div className="mt-1.5 flex justify-between px-4 font-mono text-[11px]">
        {blocks.map((b) => (
          <span
            key={b.key}
            className={regime === b.key ? b.text : "text-slate-500"}
          >
            {b.label}
          </span>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-1 text-xs text-slate-500">
        Current:{" "}
        <span className="flex items-center gap-1 font-mono font-semibold text-slate-200">
          Re ={" "}
          <EngineeringValue
            value={Re}
            unit=""
            precision={0}
            valueClassName="text-xs"
          />
        </span>
      </div>
    </div>
  )
}
