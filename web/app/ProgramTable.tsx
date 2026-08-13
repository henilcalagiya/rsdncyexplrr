"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ProgramRaw } from "@/lib/db";
import MultiSelect from "./MultiSelect";

const BASE_URL = "https://www.residencyexplorer.org";

export default function ProgramTable({ programs }: { programs: ProgramRaw[] }) {
  const [search, setSearch] = useState("");
  const [states_, setStates] = useState<string[]>([]);
  const [regions_, setRegions] = useState<string[]>([]);
  const [onlyWithData, setOnlyWithData] = useState(false);
  const [onlyWithDetail, setOnlyWithDetail] = useState(false);

  const states = useMemo(
    () => [...new Set(programs.map((p) => p.state))].sort(),
    [programs]
  );
  const regions = useMemo(
    () => [...new Set(programs.map((p) => p.region))].sort(),
    [programs]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return programs.filter((p) => {
      if (q && !`${p.program} ${p.city}`.toLowerCase().includes(q)) return false;
      if (states_.length && !states_.includes(p.state)) return false;
      if (regions_.length && !regions_.includes(p.region)) return false;
      if (onlyWithData && p.step2ck === "--" && p.signal === "--") return false;
      if (onlyWithDetail && !p.detail_id) return false;
      return true;
    });
  }, [programs, search, states_, regions_, onlyWithData, onlyWithDetail]);

  const hasFilters =
    search || states_.length > 0 || regions_.length > 0 || onlyWithData || onlyWithDetail;

  function clearFilters() {
    setSearch("");
    setStates([]);
    setRegions([]);
    setOnlyWithData(false);
    setOnlyWithDetail(false);
  }

  return (
    <div className="flex w-full items-start">
      <aside className="sticky top-14 h-[calc(100vh-3.5rem)] w-60 shrink-0 overflow-y-auto border-r border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Filters</h2>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-blue-600 hover:underline"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="mt-4 space-y-4 text-sm">
          <div>
            <span className="mb-1 block text-xs font-medium text-gray-600">
              Search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Program or city…"
              className="w-full rounded border border-gray-300 bg-white px-3 py-1.5"
            />
          </div>

          <MultiSelect
            label="State"
            options={states}
            selected={states_}
            onChange={setStates}
          />

          <MultiSelect
            label="Region"
            options={regions}
            selected={regions_}
            onChange={setRegions}
          />

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={onlyWithData}
              onChange={(e) => setOnlyWithData(e.target.checked)}
            />
            Has interview data
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={onlyWithDetail}
              onChange={(e) => setOnlyWithDetail(e.target.checked)}
            />
            Has detail page
          </label>

          <p className="border-t border-gray-200 pt-3 text-xs text-gray-500">
            Showing {filtered.length} of {programs.length} programs
          </p>
        </div>
      </aside>

      <section className="min-w-0 flex-1 px-6 py-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="text-xl font-semibold">
            Neurology Programs ({programs.length}) — 2026 Cycle Interview Data
          </h1>
          <p className="text-xs text-gray-500">
            <code>--</code> data not available &nbsp;·&nbsp; <code>!</code>{" "}
            insufficient sample size
          </p>
        </div>

        <div className="mt-3 max-h-[calc(100vh-8.5rem)] overflow-auto rounded-lg border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-gray-50">
            <tr className="border-b border-gray-300">
              <th className="px-3 py-2">Program</th>
              <th className="px-3 py-2 whitespace-nowrap">Step 2 CK</th>
              <th className="px-3 py-2 whitespace-nowrap">Level 2 CE</th>
              <th className="px-3 py-2">Signal</th>
              <th className="px-3 py-2 whitespace-nowrap">No Signal</th>
              <th className="px-3 py-2 whitespace-nowrap">In-State</th>
              <th className="px-3 py-2 whitespace-nowrap">Out-of-State</th>
              <th className="px-3 py-2">MD</th>
              <th className="px-3 py-2">DO</th>
              <th className="px-3 py-2 whitespace-nowrap">US IMG</th>
              <th className="px-3 py-2 whitespace-nowrap">Non-US IMG</th>
              <th className="px-3 py-2">City</th>
              <th className="px-3 py-2">State</th>
              <th className="px-3 py-2">Region</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-gray-100 even:bg-gray-50/50">
                <td className="px-3 py-2 font-medium">
                  {p.detail_id ? (
                    <Link
                      className="text-blue-600 underline"
                      href={`/program/${p.detail_id}`}
                    >
                      {p.program}
                    </Link>
                  ) : p.program_url ? (
                    <a
                      className="text-blue-600 underline decoration-dotted"
                      href={`${BASE_URL}${p.program_url}`}
                      target="_blank"
                    >
                      {p.program}
                    </a>
                  ) : (
                    p.program
                  )}
                  {p.detail_id && p.program_url && (
                    <a
                      className="ml-1 text-xs text-gray-400"
                      href={`${BASE_URL}${p.program_url}`}
                      target="_blank"
                      title="View original source page"
                    >
                      ↗
                    </a>
                  )}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">{p.step2ck}</td>
                <td className="px-3 py-2 whitespace-nowrap">{p.level2ce}</td>
                <td className="px-3 py-2 text-right">{p.signal}</td>
                <td className="px-3 py-2 text-right">{p.no_signal}</td>
                <td className="px-3 py-2 text-right">{p.in_state}</td>
                <td className="px-3 py-2 text-right">{p.out_of_state}</td>
                <td className="px-3 py-2 text-right">{p.md}</td>
                <td className="px-3 py-2 text-right">{p.do_}</td>
                <td className="px-3 py-2 text-right">{p.us_img}</td>
                <td className="px-3 py-2 text-right">{p.non_us_img}</td>
                <td className="px-3 py-2 whitespace-nowrap">{p.city}</td>
                <td className="px-3 py-2">{p.state}</td>
                <td className="px-3 py-2 whitespace-nowrap">{p.region}</td>
              </tr>
            ))}
          </tbody>
        </table>
          {filtered.length === 0 && (
            <p className="p-6 text-center text-sm text-gray-500">
              No programs match the current filters.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
