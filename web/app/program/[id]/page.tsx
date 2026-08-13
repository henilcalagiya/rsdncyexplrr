import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProgramDetail,
  getProgramOfferings,
  getProgramSalary,
} from "@/lib/db";

export const dynamic = "force-dynamic";

const BASE_URL = "https://www.residencyexplorer.org";

function Fact({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="font-medium">{value ?? "--"}</div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-gray-200 p-4 text-center">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      {sub && <div className="mt-1 text-xs text-gray-400">{sub}</div>}
    </div>
  );
}

export default async function ProgramPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = getProgramDetail(Number(id));

  if (!detail) {
    notFound();
  }

  const offerings = getProgramOfferings(detail.program_id);
  const salary = getProgramSalary(detail.program_id);
  const raw = JSON.parse(detail.raw_json);
  const chartSet = raw.chartSet ?? {};

  const groups = new Map<string, typeof offerings>();
  for (const o of offerings) {
    if (!groups.has(o.group_name)) groups.set(o.group_name, []);
    groups.get(o.group_name)!.push(o);
  }

  const signal = chartSet.signal?.series ?? {};
  const signalParams = chartSet.signal?.parameters ?? {};
  const applicantTypeApp = chartSet.applicantTypeApp?.series ?? {};
  const applicantTypeInvited = chartSet.applicantTypeInvitedToInterview?.series ?? {};
  const step2Boxplots: {
    series: Record<string, number>;
    parameters: { applicant: string; status: number };
  }[] = chartSet.step2CKScores ?? [];

  return (
    <main className="w-full px-8 py-10 font-sans">
      <Link href="/" className="text-sm text-blue-600 underline">
        &larr; Back to all programs
      </Link>

      <h1 className="mt-3 text-3xl font-bold">{detail.name}</h1>
      <p className="mt-1 text-gray-500">
        {detail.address}
        {detail.external_id && (
          <>
            {" · "}
            <a
              className="text-blue-600 underline"
              href={`${BASE_URL}/Program/GetByIdWithMedicalSpecialty/${detail.external_id}`}
              target="_blank"
            >
              view original source page
            </a>
          </>
        )}
      </p>

      <section className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <Stat
          label="2026 ERAS Applicants"
          value={String(detail.eras_applicants_2026 ?? "--")}
          sub={`specialty avg ${detail.specialty_avg_applicants ?? "--"}`}
        />
        <Stat
          label="Invited to Interview"
          value={String(detail.invited_to_interview_2026 ?? "--")}
        />
        <Stat
          label="Interview Rate"
          value={detail.interview_rate_2026 != null ? `${detail.interview_rate_2026}%` : "--"}
          sub={`specialty avg ${detail.specialty_avg_interview_rate ?? "--"}%`}
        />
        <Stat
          label="2026 Positions Offered"
          value={String(detail.positions_offered_2026 ?? "--")}
        />
        <Stat
          label="2026 Positions Filled"
          value={String(detail.positions_filled_2026 ?? "--")}
        />
        <Stat
          label="Training Length"
          value={detail.training_length_years != null ? `${detail.training_length_years} yrs` : "--"}
        />
      </section>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <section>
          <h2 className="text-xl font-semibold">Contact & Accreditation</h2>
          <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-4 rounded-lg border border-gray-200 p-4">
            <Fact label="Program Director" value={detail.program_director} />
            <Fact label="Program Coordinator" value={detail.program_coordinator} />
            <Fact label="Phone" value={detail.phone} />
            <Fact label="Coordinator Phone" value={detail.program_coordinator_phone} />
            <Fact label="Email" value={detail.email} />
            <Fact label="Website" value={detail.website} />
            <Fact label="ACGME Program Code" value={detail.acgme_program_code} />
            <Fact label="Institutional Setting" value={detail.institutional_setting} />
            <Fact label="Accreditation Status" value={detail.accreditation_status} />
            <Fact label="Accreditation Effective" value={detail.accreditation_effective_date} />
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Eligibility & Application</h2>
          <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-4 rounded-lg border border-gray-200 p-4">
            <Fact label="Application Service" value={detail.application_service} />
            <Fact label="Interview Format" value={detail.interview_format} />
            <Fact label="Prior GME Required" value={detail.prior_gme_required} />
            <Fact label="Letters of Recommendation" value={detail.letters_of_recommendation} />
            <Fact label="J-1 (ECFMG)" value={detail.visa_j1} />
            <Fact label="H1-B" value={detail.visa_h1b} />
            <Fact label="F-1 OPT" value={detail.visa_f1_opt} />
            <Fact label="Prior-Year Residents" value={detail.residents_total} />
          </div>
        </section>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">2026 Interview Data</h2>
        <div className="mt-3 grid gap-6 lg:grid-cols-3">
          <div className="rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold">Signal Interview Rates</h3>
            <table className="mt-2 w-full text-sm">
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-1">Sent a signal</td>
                  <td className="py-1 text-right font-medium">
                    {signal["Sent"] != null ? `${signal["Sent"]}%` : "--"}
                  </td>
                  <td className="py-1 text-right text-gray-400">
                    n={signalParams.countSent ?? "--"}
                  </td>
                </tr>
                <tr>
                  <td className="py-1">Did not send</td>
                  <td className="py-1 text-right font-medium">
                    {signal["Did Not Send"] != null ? `${signal["Did Not Send"]}%` : "--"}
                  </td>
                  <td className="py-1 text-right text-gray-400">
                    n={signalParams.countDidNotSend ?? "--"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold">Applicant Type: Applied vs Invited</h3>
            <table className="mt-2 w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500">
                  <th className="py-1 font-normal">Type</th>
                  <th className="py-1 text-right font-normal">% of Applicants</th>
                  <th className="py-1 text-right font-normal">% of Invited</th>
                </tr>
              </thead>
              <tbody>
                {["US MD", "US DO", "US IMG", "Non-US IMG"].map((t) => (
                  <tr key={t} className="border-b border-gray-100">
                    <td className="py-1">{t}</td>
                    <td className="py-1 text-right">
                      {applicantTypeApp[t] != null ? `${applicantTypeApp[t]}%` : "--"}
                    </td>
                    <td className="py-1 text-right">
                      {applicantTypeInvited[t] != null ? `${applicantTypeInvited[t]}%` : "--"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold">Step 2 CK Scores of Invited (p10–p90)</h3>
            <table className="mt-2 w-full text-sm">
              <tbody>
                {step2Boxplots.map((b) => (
                  <tr key={b.parameters.applicant} className="border-b border-gray-100">
                    <td className="py-1">{b.parameters.applicant}</td>
                    <td className="py-1 text-right font-medium">
                      {b.series.lower != null
                        ? `${b.series.lower}–${b.series.upper} (median ${b.series.median})`
                        : "insufficient sample"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <section>
          <h2 className="text-xl font-semibold">Salary & Leave</h2>
          <table className="mt-3 w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="py-2 pr-4">Year</th>
                <th className="py-2 pr-4">Salary</th>
                <th className="py-2 pr-4">Paid Sick Days</th>
                <th className="py-2">Paid Vacation Days</th>
              </tr>
            </thead>
            <tbody>
              {salary.map((s) => (
                <tr key={s.year} className="border-b border-gray-100">
                  <td className="py-2 pr-4">{s.year}</td>
                  <td className="py-2 pr-4 font-medium">{s.salary}</td>
                  <td className="py-2 pr-4">{s.sick_days}</td>
                  <td className="py-2">{s.vacation_days}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Application Trend (ERAS)</h2>
          <table className="mt-3 w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="py-2 pr-4">Cycle</th>
                <th className="py-2"># Applications</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["2022", detail.apps_2022],
                ["2023", detail.apps_2023],
                ["2024", detail.apps_2024],
                ["2025", detail.apps_2025],
                ["2026", detail.eras_applicants_2026],
              ].map(([year, n]) => (
                <tr key={year} className="border-b border-gray-100">
                  <td className="py-2 pr-4">{year}</td>
                  <td className="py-2">{n ?? "--"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">
          Program Characteristics & Offerings ({offerings.length})
        </h2>
        <div className="mt-3 grid gap-6 lg:grid-cols-2">
          {[...groups.entries()].map(([groupName, rows]) => (
            <div key={groupName} className="rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold">{groupName}</h3>
              <table className="mt-2 w-full text-sm">
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className="border-b border-gray-100 align-top">
                      <td className="py-1 pr-4 text-gray-700">
                        {r.subgroup ? `${r.subgroup}: ` : ""}
                        {r.name}
                      </td>
                      <td className="py-1 text-right font-medium whitespace-nowrap">
                        {r.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
