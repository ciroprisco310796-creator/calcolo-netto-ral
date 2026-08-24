import { formatEuro } from "@/lib/salaryCalculator";

interface BreakdownRowProps {
  label: string;
  value: number;
  sign?: "plus" | "minus" | "neutral";
  emphasis?: boolean;
  hint?: string | undefined;
  compact?: boolean;
}

export function BreakdownRow({
  label,
  value,
  sign = "neutral",
  emphasis = false,
  hint,
  compact = false,
}: BreakdownRowProps) {
  const prefix = sign === "minus" ? "− " : sign === "plus" ? "+ " : "";
  const valueColor =
    sign === "minus"
      ? "text-negative"
      : sign === "plus"
        ? "text-positive"
        : "text-foreground";

  return (
    <div
      className={`flex items-baseline justify-between gap-4 ${compact ? "py-2" : "py-3"} ${
        emphasis ? "border-t border-border pt-4" : ""
      }`}
    >
      <div className="min-w-0">
        <p
          className={`${compact ? "text-xs" : "text-sm"} ${emphasis ? "font-semibold text-foreground" : "text-muted-foreground"}`}
        >
          {label}
        </p>
        {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
      </div>
      <p
        className={`tabular shrink-0 ${compact ? "text-xs" : "text-sm"} ${emphasis ? "text-base font-semibold text-foreground" : valueColor}`}
      >
        {prefix}
        {formatEuro(value)}
      </p>
    </div>
  );
}
