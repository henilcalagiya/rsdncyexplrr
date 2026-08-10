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
    <div>
      <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search program or city…"
          className="w-64 rounded border border-gray-300 bg-white px-3 py-1.5"
        />

        <MultiSelect
          label="State"
          options={states}
          selected={states_}
          onChange={setStates}
          width="w-44"
        />

        <MultiSelect
          label="Region"
          options={regions}
          selected={regions_}
          onChange={setRegions}
          width="w-56"
        />

        <label className="flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={onlyWithData}
            onChange={(e) => setOnlyWithData(e.target.checked)}
          />
          Has interview data
        </label>

        <label className="flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={onlyWithDetail}
            onChange={(e) => setOnlyWithDetail(e.target.checked)}
          />
          Has detail page
        </label>

        <span className="ml-auto text-gray-500">
          {filtered.length} of {programs.length} programs
        </span>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="rounded border border-gray-300 bg-white px-2 py-1 text-xs hover:bg-gray-100"
          >
            ✕ Clear filters
          </button>
        )}
      </div>

      <div className="mt-3 max-h-[70vh] overflow-auto rounded-lg border border-gray-200">
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
                      title="View on Residency Explorer"
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
    </div>
  );
}
