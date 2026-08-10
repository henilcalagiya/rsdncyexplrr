import Link from "next/link";
import { getCounts, getProgramsRaw } from "@/lib/db";
import ProgramTable from "./ProgramTable";

export const dynamic = "force-dynamic";

export default function Home() {
  const counts = getCounts();
  const programs = getProgramsRaw();

  return (
    <main className="w-full px-8 py-10 font-sans">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Residency Explorer — Local Data</h1>
          <p className="mt-2 text-gray-500">
            Browsing <code>residency_explorer.db</code>, built from the saved
            Explore Programs page.
          </p>
        </div>
        <Link
          href="/custom"
          className="inline-block rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
        >
          Key Data View — contacts, visas, signal &amp; interview data →
        </Link>
      </div>

      <section className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {Object.entries(counts)
          .filter(
            ([label]) =>
              !["specialties", "siteLinks", "apiEndpoints"].includes(label)
          )
          .map(([label, n]) => (
            <div
              key={label}
              className="rounded-lg border border-gray-200 p-4 text-center"
            >
              <div className="text-2xl font-bold">{n}</div>
              <div className="text-xs uppercase tracking-wide text-gray-500">
                {label}
              </div>
            </div>
          ))}
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">
          Neurology Programs ({counts.programs}) — 2026 Cycle Interview Data
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          <code>--</code> data not available &nbsp;·&nbsp; <code>!</code>{" "}
          insufficient sample size
        </p>
        <ProgramTable programs={programs} />
      </section>
    </main>
  );
}
