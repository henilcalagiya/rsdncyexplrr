"use client";

import { useState, type ReactNode } from "react";

// Collapsible filter panel card shared by the program tables
export default function FilterSidebar({
  onClear,
  children,
}: {
  onClear?: () => void;
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        title="Show filters"
        className="sticky top-[68px] flex shrink-0 flex-col items-center gap-2 py-1 pr-3 text-gray-400 hover:text-gray-900"
      >
        <span aria-hidden>☰</span>
        <span className="text-[11px] font-semibold uppercase tracking-wide [writing-mode:vertical-rl]">
          Filters
        </span>
      </button>
    );
  }

  return (
    <aside className="sticky top-[68px] max-h-[calc(100vh-84px)] w-64 shrink-0 overflow-y-auto border-r border-gray-200 pr-5">
      <div className="flex items-center gap-3 border-b border-gray-200 pb-2.5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-700">
          Filters
        </h2>
        {onClear && (
          <button
            onClick={onClear}
            className="ml-auto text-xs font-medium text-red-500 hover:text-red-600"
          >
            Clear filters
          </button>
        )}
        <button
          onClick={() => setCollapsed(true)}
          title="Hide filters"
          className={`${onClear ? "" : "ml-auto "}text-sm leading-none text-gray-400 hover:text-gray-700`}
        >
          «
        </button>
      </div>

      <div className="mt-4 space-y-4 text-sm">{children}</div>
    </aside>
  );
}
