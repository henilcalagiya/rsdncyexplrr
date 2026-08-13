import { getCustomRows } from "@/lib/db";
import CustomTable from "./CustomTable";

export const dynamic = "force-dynamic";

export default function CustomViewPage() {
  const rows = getCustomRows();

  return (
    <main className="w-full font-sans">
      <CustomTable rows={rows} />
    </main>
  );
}
