"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CustomRow } from "@/lib/db";
import MultiSelect from "../MultiSelect";

const VISA_OPTIONS = ["J-1", "H1-B", "F-1 OPT"] as const;

function pct(v: number | null) {
  return v != null ? `${v}%` : "--";
}

function num(v: number | null) {
  return v != null ? String(v) : "--";
}

const COLUMNS = [
  "Program",
  "Website",
  "Phone",
  "Address",
  "Email",
  "Region",
  "State",
  "City",
  "ACGME Code",
  "Program Director",
  "Coordinator",
  "Coordinator Phone",
  "Training Length (yrs)",
  "Total Residents",
  "Year 1 Residents",
  "Interview Format",
  "J-1 (ECFMG)",
  "H1-B",
  "% Residents Non-US IMG",
  "2026 Applicants",
  "Invited to Interview",
  "Interview Rate",
  "Signal — Applicants Sent",
  "Signal — Applicants Did Not Send",
  "Signal — Invited Sent",
  "Signal — Invited Did Not Send",
  "Non-US IMG % of Applicants",
  "Non-US IMG % of Invited",
  "Step 2 CK All Invited (mid 80%)",
];

function csvEscape(v: string | number | null): string {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export default function CustomTable({ rows }: { rows: CustomRow[] }) {
  const [search, setSearch] = useState("");
  const [selStates, setSelStates] = useState<string[]>([]);
  const [selRegions, setSelRegions] = useState<string[]>([]);
  const [selFormats, setSelFormats] = useState<string[]>([]);
  const [selVisas, setSelVisas] = useState<string[]>([]);
  const [minRate, setMinRate] = useState("");
  const [onlyStep2, setOnlyStep2] = useState(false);
  const [onlyOsteopathic, setOnlyOsteopathic] = useState(false);
  const [onlyResearchTrack, setOnlyResearchTrack] = useState(false);

  const states = useMemo(
    () => [...new Set(rows.map((r) => r.state).filter(Boolean))].sort() as string[],
    [rows]
  );
  const regions = useMemo(
    () => [...new Set(rows.map((r) => r.region).filter(Boolean))].sort() as string[],
    [rows]
  );
  const formats = useMemo(
    () =>
      [...new Set(rows.map((r) => r.interview_format).filter(Boolean))].sort() as string[],
    [rows]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rate = minRate === "" ? null : Number(minRate);
    const visaField: Record<string, (r: CustomRow) => string | null> = {
      "J-1": (r) => r.visa_j1,
      "H1-B": (r) => r.visa_h1b,
      "F-1 OPT": (r) => r.visa_f1_opt,
    };
    return rows.filter((r) => {
      if (
        q &&
        !`${r.name} ${r.city ?? ""} ${r.program_director ?? ""}`
          .toLowerCase()
          .includes(q)
      )
        return false;
      if (selStates.length && (!r.state || !selStates.includes(r.state))) return false;
      if (selRegions.length && (!r.region || !selRegions.includes(r.region)))
        return false;
      if (
        selFormats.length &&
        (!r.interview_format || !selFormats.includes(r.interview_format))
      )
        return false;
      // like the real site: program must accept every selected visa
      if (selVisas.some((v) => visaField[v](r) !== "Yes")) return false;
      if (rate != null && (r.interview_rate_2026 == null || r.interview_rate_2026 < rate))
        return false;
      if (onlyStep2 && r.step2_all_low == null) return false;
      if (onlyOsteopathic && r.osteopathic_recognition !== "Yes") return false;
      if (onlyResearchTrack && r.research_track !== "Yes") return false;
      return true;
    });
  }, [
    rows,
    search,
    selStates,
    selRegions,
    selFormats,
    selVisas,
    minRate,
    onlyStep2,
    onlyOsteopathic,
    onlyResearchTrack,
  ]);

  const hasFilters =
    search ||
    selStates.length > 0 ||
    selRegions.length > 0 ||
    selFormats.length > 0 ||
    selVisas.length > 0 ||
    minRate ||
    onlyStep2 ||
    onlyOsteopathic ||
    onlyResearchTrack;

  function clearFilters() {
    setSearch("");
    setSelStates([]);
    setSelRegions([]);
    setSelFormats([]);
    setSelVisas([]);
    setMinRate("");
    setOnlyStep2(false);
    setOnlyOsteopathic(false);
    setOnlyResearchTrack(false);
  }

  function exportCsv() {
    const lines = [COLUMNS.join(",")];
    for (const r of filtered) {
      lines.push(
        [
          r.name,
          r.website,
          r.phone,
          r.address,
          r.email,
          r.region,
          r.state,
          r.city,
          r.acgme_program_code,
          r.program_director,
          r.program_coordinator,
          r.program_coordinator_phone,
          r.training_length_years,
          r.residents_total,
          r.residents_year1,
          r.interview_format,
          r.visa_j1,
          r.visa_h1b,
          r.pct_residents_non_us_img,
          r.applicants_2026,
          r.invited_2026,
          r.interview_rate_2026 != null ? `${r.interview_rate_2026}%` : "",
          r.signal_app_sent != null ? `${r.signal_app_sent}%` : "",
          r.signal_app_not_sent != null ? `${r.signal_app_not_sent}%` : "",
          r.signal_inv_sent != null ? `${r.signal_inv_sent}%` : "",
          r.signal_inv_not_sent != null ? `${r.signal_inv_not_sent}%` : "",
          r.applicant_non_us_img_pct != null ? `${r.applicant_non_us_img_pct}%` : "",
          r.invited_non_us_img_pct != null ? `${r.invited_non_us_img_pct}%` : "",
          r.step2_all_low != null ? `${r.step2_all_low}-${r.step2_all_high}` : "",
        ]
          .map(csvEscape)
          .join(",")
      );
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "residency-key-data.csv";
    a.click();
    URL.revokeObjectURL(a.href);
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
              placeholder="Program, city, or director…"
              className="w-full rounded border border-gray-300 bg-white px-3 py-1.5"
            />
          </div>

          <MultiSelect
            label="State"
            options={states}
            selected={selStates}
            onChange={setSelStates}
          />

          <MultiSelect
            label="Region"
            options={regions}
            selected={selRegions}
            onChange={setSelRegions}
          />

          <MultiSelect
            label="Interview Format"
            options={formats}
            selected={selFormats}
            onChange={setSelFormats}
          />

          <MultiSelect
            label="Visas Accepted"
            options={[...VISA_OPTIONS]}
            selected={selVisas}
            onChange={setSelVisas}
          />

          <div>
            <span className="mb-1 block text-xs font-medium text-gray-600">
              Min interview rate %
            </span>
            <input
              type="number"
              value={minRate}
              onChange={(e) => setMinRate(e.target.value)}
              className="w-full rounded border border-gray-300 bg-white px-3 py-1.5"
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={onlyOsteopathic}
              onChange={(e) => setOnlyOsteopathic(e.target.checked)}
            />
            Osteopathic Recognized
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={onlyResearchTrack}
              onChange={(e) => setOnlyResearchTrack(e.target.checked)}
            />
            Research track
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={onlyStep2}
              onChange={(e) => setOnlyStep2(e.target.checked)}
            />
            Has Step 2 CK range
          </label>

          <p className="border-t border-gray-200 pt-3 text-xs text-gray-500">
            Showing {filtered.length} of {rows.length} programs
          </p>
        </div>
      </aside>

      <section className="min-w-0 flex-1 px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-xl font-semibold">Key Data View</h1>
          <button
            onClick={exportCsv}
            className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-100"
          >
            ⬇ Export CSV
          </button>
        </div>

        <div className="mt-3 max-h-[calc(100vh-9rem)] overflow-auto rounded-lg border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 z-10 bg-gray-50">
            <tr className="border-b border-gray-300">
              {COLUMNS.map((c) => (
                <th key={c} className="whitespace-nowrap px-3 py-2">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr
                key={r.program_id}
                className="border-b border-gray-100 align-top even:bg-gray-50/50"
              >
                <td className="min-w-56 px-3 py-2 font-medium">
                  <Link
                    className="text-blue-600 underline"
                    href={`/program/${r.program_id}`}
                  >
                    {r.name}
                  </Link>
                </td>
                <td className="max-w-48 truncate px-3 py-2">
                  {r.website ? (
                    <a
                      className="text-blue-600 underline"
                      href={r.website}
                      target="_blank"
                      title={r.website}
                    >
                      {r.website.replace(/^https?:\/\/(www\.)?/, "")}
                    </a>
                  ) : (
                    "--"
                  )}
                </td>
                <td className="whitespace-nowrap px-3 py-2">{r.phone ?? "--"}</td>
                <td className="min-w-64 px-3 py-2">{r.address ?? "--"}</td>
                <td className="px-3 py-2">
                  {r.email ? (
                    <a className="text-blue-600 underline" href={`mailto:${r.email}`}>
                      {r.email}
                    </a>
                  ) : (
                    "--"
                  )}
                </td>
                <td className="whitespace-nowrap px-3 py-2">{r.region ?? "--"}</td>
                <td className="px-3 py-2">{r.state ?? "--"}</td>
                <td className="whitespace-nowrap px-3 py-2">{r.city ?? "--"}</td>
                <td className="whitespace-nowrap px-3 py-2">
                  {r.acgme_program_code ?? "--"}
                </td>
                <td className="min-w-44 px-3 py-2">{r.program_director ?? "--"}</td>
                <td className="min-w-44 px-3 py-2">{r.program_coordinator ?? "--"}</td>
                <td className="whitespace-nowrap px-3 py-2">
                  {r.program_coordinator_phone ?? "--"}
                </td>
                <td className="px-3 py-2 text-center">
                  {num(r.training_length_years)}
                </td>
                <td className="px-3 py-2 text-center">{num(r.residents_total)}</td>
                <td className="px-3 py-2 text-center">{num(r.residents_year1)}</td>
                <td
                  className="max-w-40 truncate px-3 py-2"
                  title={r.interview_format ?? undefined}
                >
                  {r.interview_format ? r.interview_format.split(" (")[0] : "--"}
                </td>
                <td className="px-3 py-2 text-center">{r.visa_j1 ?? "--"}</td>
                <td className="px-3 py-2 text-center">{r.visa_h1b ?? "--"}</td>
                <td className="px-3 py-2 text-center">
                  {r.pct_residents_non_us_img ?? "--"}
                </td>
                <td className="px-3 py-2 text-right">{num(r.applicants_2026)}</td>
                <td className="px-3 py-2 text-right">{num(r.invited_2026)}</td>
                <td className="px-3 py-2 text-right">
                  {pct(r.interview_rate_2026)}
                </td>
                <td className="px-3 py-2 text-right">{pct(r.signal_app_sent)}</td>
                <td className="px-3 py-2 text-right">{pct(r.signal_app_not_sent)}</td>
                <td className="px-3 py-2 text-right">{pct(r.signal_inv_sent)}</td>
                <td className="px-3 py-2 text-right">{pct(r.signal_inv_not_sent)}</td>
                <td className="px-3 py-2 text-right">
                  {pct(r.applicant_non_us_img_pct)}
                </td>
                <td className="px-3 py-2 text-right">
                  {pct(r.invited_non_us_img_pct)}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-center">
                  {r.step2_all_low != null
                    ? `${r.step2_all_low}–${r.step2_all_high}`
                    : "--"}
                </td>
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
