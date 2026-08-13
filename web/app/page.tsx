import { getProgramsRaw } from "@/lib/db";
import ProgramTable from "./ProgramTable";

export const dynamic = "force-dynamic";

export default function Home() {
  const programs = getProgramsRaw();

  return (
    <main className="w-full font-sans">
      <ProgramTable programs={programs} />
    </main>
  );
}
