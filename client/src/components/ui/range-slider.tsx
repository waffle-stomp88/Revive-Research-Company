import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface RangeSliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  className?: string;
  "data-testid"?: string;
}

export function RangeSlider({
  value,
  min,
  max,
  step = 0.1,
  onChange,
  className,
  "data-testid": testId,
}: RangeSliderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const updateBackground = useCallback(() => {
    if (!inputRef.current) return;
    const percent = ((value - min) / (max - min)) * 100;
    inputRef.current.style.background = `linear-gradient(to right, #4ade80 0%, #4ade80 ${percent}%, #374151 ${percent}%, #374151 100%)`;
  }, [value, min, max]);

  useEffect(() => {
    updateBackground();
  }, [updateBackground]);

  return (
    <input
      ref={inputRef}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className={cn("range-slider", className)}
      data-testid={testId}
    />
  );
}
