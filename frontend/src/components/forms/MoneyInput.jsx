import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { centsToDollarsString, parseDollarsToCents } from "@/lib/format";
import { cn } from "@/lib/utils";

export function MoneyInput({ value, onChange, className, testId = "money-input", disabled = false, placeholder = "0.00" }) {
  const [text, setText] = useState(() => (value ? (Number(value) / 100).toFixed(2) : ""));
  const preview = useMemo(() => centsToDollarsString(value || 0), [value]);

  const handleChange = (e) => {
    const raw = e.target.value;
    setText(raw);
    const cents = parseDollarsToCents(raw);
    onChange?.(cents);
  };
  const handleBlur = () => {
    const cents = parseDollarsToCents(text);
    setText(cents ? (cents / 100).toFixed(2) : "");
    onChange?.(cents);
  };

  return (
    <div className={cn("relative", className)}>
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
      <Input
        data-testid={testId}
        value={text}
        onChange={handleChange}
        onBlur={handleBlur}
        inputMode="decimal"
        placeholder={placeholder}
        disabled={disabled}
        className="pl-6 pr-24 text-right tabular-nums"
      />
      <span data-testid="money-input-preview" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground tabular-nums">
        {preview}
      </span>
    </div>
  );
}
export default MoneyInput;
