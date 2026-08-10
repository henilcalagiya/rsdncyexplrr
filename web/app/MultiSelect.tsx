"use client";

import { useEffect, useRef, useState } from "react";

// Chip-style multiselect modeled on the Kendo multiselects on residencyexplorer.org
export default function MultiSelect({
  label,
  options,
  selected,
  onChange,
  width = "w-56",
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  width?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function toggle(value: string) {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );
  }

  return (
    <div className="relative flex items-center gap-1.5" ref={ref}>
      <span className="text-gray-500">{label}</span>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex min-h-[34px] ${width} flex-wrap items-center gap-1 rounded border border-gray-300 bg-white px-2 py-1 text-left`}
      >
        {selected.length === 0 && <span className="text-gray-400">All</span>}
        {selected.map((v) => (
          <span
            key={v}
            className="flex items-center gap-1 rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-800"
          >
            {v}
            <span
              role="button"
              className="font-bold hover:text-blue-950"
              onClick={(e) => {
                e.stopPropagation();
                toggle(v);
              }}
            >
              ×
            </span>
          </span>
        ))}
        <span className="ml-auto text-gray-400">▾</span>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 max-h-64 w-64 overflow-auto rounded border border-gray-300 bg-white shadow-lg">
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="block w-full border-b border-gray-200 px-3 py-1.5 text-left text-xs text-gray-500 hover:bg-gray-50"
            >
              ✕ Clear {label.toLowerCase()} selection
            </button>
          )}
          {options.map((o) => (
            <label
              key={o}
              className="flex cursor-pointer items-center gap-2 px-3 py-1.5 hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={selected.includes(o)}
                onChange={() => toggle(o)}
              />
              <span className="truncate" title={o}>
                {o}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
