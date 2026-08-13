import { getCustomRows } from "@/lib/db";
import CustomTable from "./CustomTable";

export const dynamic = "force-dynamic";

export default function CustomViewPage() {
  const rows = getCustomRows();

  return (
    <main className="w-full px-8 py-6 font-sans">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-xl font-semibold">Key Data View</h1>
        <p className="text-xs text-gray-500">
          {rows.length} programs with detail profiles · contact, residents,
          visas, 2026 interview data, signal &amp; applicant-type pies, Step 2
          CK range
        </p>
      </div>
      <CustomTable rows={rows} />
    </main>
  );
}
