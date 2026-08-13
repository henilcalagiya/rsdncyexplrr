import { getCounts, getProgramsRaw } from "@/lib/db";
import ProgramTable from "./ProgramTable";

export const dynamic = "force-dynamic";

export default function Home() {
  const counts = getCounts();
  const programs = getProgramsRaw();

  return (
    <main className="w-full px-8 py-6 font-sans">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-xl font-semibold">
          Neurology Programs ({counts.programs}) — 2026 Cycle Interview Data
        </h1>
        <p className="text-xs text-gray-500">
          <code>--</code> data not available &nbsp;·&nbsp; <code>!</code>{" "}
          insufficient sample size
        </p>
      </div>
      <ProgramTable programs={programs} />
    </main>
  );
}
