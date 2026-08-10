import Link from "next/link";
import { getCustomRows } from "@/lib/db";
import CustomTable from "./CustomTable";

export const dynamic = "force-dynamic";

export default function CustomViewPage() {
  const rows = getCustomRows();

  return (
    <main className="w-full px-8 py-10 font-sans">
      <Link href="/" className="text-sm text-blue-600 underline">
        &larr; Back to all programs
      </Link>
      <h1 className="mt-3 text-3xl font-bold">Key Data View</h1>
      <p className="mt-1 text-gray-500">
        {rows.length} programs with detail profiles · contact, residents, visas,
        2026 interview data, signal &amp; applicant-type pies, Step 2 CK range
      </p>
      <CustomTable rows={rows} />
    </main>
  );
}
