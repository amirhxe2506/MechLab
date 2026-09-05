import React from "react";

interface EngineeringValueProps {
  value: number;
  unit: string;
  precision?: number;
  valueClassName?: string;
}

export function EngineeringValue({ value, unit, precision = 4, valueClassName }: EngineeringValueProps) {
  let displayValue: string;
  let useScientific = false;

  const absVal = Math.abs(value);

  if (absVal === 0) {
    displayValue = "0";
  } else if (absVal >= 1e6 || absVal <= 1e-4) {
    displayValue = value.toExponential(3).replace("e+", "e");
    useScientific = true;
  } else {
    // Normal formatting with fixed precision, adding thousand separators
    const fixedStr = parseFloat(value.toFixed(precision)).toString();
    const parts = fixedStr.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    displayValue = parts.join(".");
  }

  // Determine responsive font size for value based on length, unless overridden
  let valueTextClass = valueClassName || "text-xl sm:text-2xl";
  if (!valueClassName) {
    if (displayValue.length > 12) {
      valueTextClass = "text-sm sm:text-base";
    } else if (displayValue.length > 8) {
      valueTextClass = "text-base sm:text-lg";
    }
  }

  return (
    <div className="flex items-baseline gap-1 min-w-0 font-mono font-bold text-slate-200 tabular-nums">
      <span className={`truncate ${valueTextClass}`} title={value.toString()}>
        {displayValue}
      </span>
      {unit && unit !== "—" && (
        <span className="text-xs text-slate-500 font-normal shrink-0">{unit}</span>
      )}
    </div>
  );
}
