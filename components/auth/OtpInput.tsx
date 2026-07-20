"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

const LENGTH = 6;

/**
 * Six single-character boxes behaving as one field: typing advances, backspace
 * on an empty box steps back, and pasting a full code fills every box at once
 * (people paste from the email rather than retyping).
 */
export function OtpInput({
  value,
  onChange,
  onComplete,
  disabled,
  invalid,
}: {
  value: string;
  onChange: (next: string) => void;
  onComplete?: (code: string) => void;
  disabled?: boolean;
  invalid?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const setDigit = (index: number, digit: string) => {
    const chars = value.padEnd(LENGTH, " ").split("");
    chars[index] = digit || " ";
    const next = chars.join("").trimEnd();
    onChange(next);
    return next;
  };

  const handleChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    if (!digit) return;

    const next = setDigit(index, digit);

    if (index < LENGTH - 1) {
      refs.current[index + 1]?.focus();
    }
    if (next.replace(/\s/g, "").length === LENGTH) {
      onComplete?.(next);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (value[index] && value[index] !== " ") {
        setDigit(index, "");
      } else if (index > 0) {
        setDigit(index - 1, "");
        refs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      refs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < LENGTH - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, LENGTH);
    if (!pasted) return;

    onChange(pasted);
    refs.current[Math.min(pasted.length, LENGTH - 1)]?.focus();
    if (pasted.length === LENGTH) onComplete?.(pasted);
  };

  return (
    <div className="flex justify-center gap-2" onPaste={handlePaste}>
      {Array.from({ length: LENGTH }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            refs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          disabled={disabled}
          aria-label={`Digit ${index + 1} of ${LENGTH}`}
          aria-invalid={invalid || undefined}
          value={value[index]?.trim() ?? ""}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onFocus={(e) => e.target.select()}
          className={cn(
            "h-14 w-12 rounded-xl border bg-card text-center text-xl font-semibold transition-colors",
            "focus:border-ring focus:outline-none disabled:opacity-50",
            invalid ? "border-destructive" : "border-input",
          )}
        />
      ))}
    </div>
  );
}
