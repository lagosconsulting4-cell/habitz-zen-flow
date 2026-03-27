import { useRef, useLayoutEffect } from "react";

export const DRUM_ITEM_HEIGHT = 44;
export const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
export const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));

export function DrumColumn({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useLayoutEffect(() => {
    const index = options.indexOf(value);
    if (ref.current && index >= 0) {
      ref.current.scrollTop = index * DRUM_ITEM_HEIGHT;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleScroll = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (!ref.current) return;
      const index = Math.round(ref.current.scrollTop / DRUM_ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(options.length - 1, index));
      if (options[clamped] !== value) onChange(options[clamped]);
    }, 50);
  };

  return (
    <div className="relative h-[220px] w-20 overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-[var(--drum-bg)] to-transparent z-10 pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-[var(--drum-bg)] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-11 border border-primary/30 bg-primary/5 z-0 pointer-events-none rounded-lg" />
      <div
        ref={ref}
        onScroll={handleScroll}
        className="h-full overflow-y-scroll scrollbar-hide"
        style={{ scrollSnapType: "y mandatory" }}
      >
        <div style={{ height: (220 - DRUM_ITEM_HEIGHT) / 2 }} />
        {options.map((opt) => (
          <div
            key={opt}
            style={{ scrollSnapAlign: "center", height: DRUM_ITEM_HEIGHT }}
            className={`flex items-center justify-center text-lg font-semibold transition-colors duration-150 ${
              opt === value ? "text-foreground" : "text-muted-foreground/30"
            }`}
          >
            {opt}
          </div>
        ))}
        <div style={{ height: (220 - DRUM_ITEM_HEIGHT) / 2 }} />
      </div>
    </div>
  );
}
