import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProgramDetail,
  getProgramOfferings,
  getProgramSalary,
} from "@/lib/db";

export const dynamic = "force-dynamic";

const BASE_URL = "https://www.residencyexplorer.org";

function Card({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`overflow-hidden rounded-xl border border-gray-200 bg-white ${className}`}
    >
      <h2 className="border-b border-gray-100 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-gray-700">
        {title}
      </h2>
      <div className="p-4">{children}</div>
    </section>
  );
}

function Fact({
  label,
  value,
  href,
}: {
  label: string;
  value: string | number | null;
  href?: string | null;
}) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-medium text-gray-800">
        {value == null ? (
          "--"
        ) : href ? (
          <a
            className="text-gray-800 underline decoration-gray-300 underline-offset-2 hover:decoration-gray-500"
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
          >
            {value}
          </a>
        ) : (
          value
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
      <div className="text-xl font-semibold text-gray-900">{value}</div>
      <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </div>
      {sub && <div className="mt-1 text-xs text-gray-400">{sub}</div>}
    </div>
  );
}

function YesNoTag({ label, value }: { label: string; value: string | null }) {
  const yes = value === "Yes";
  return (
    <span
      className={`rounded px-2 py-0.5 text-xs font-medium ${
        yes ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"
      }`}
    >
      {label}: {value ?? "--"}
    </span>
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
  const applicantTypeInvited =
    chartSet.applicantTypeInvitedToInterview?.series ?? {};
  const step2Boxplots: {
    series: Record<string, number>;
    parameters: { applicant: string; status: number };
  }[] = chartSet.step2CKScores ?? [];

  const trend: [string, number | null][] = [
    ["2022", detail.apps_2022],
    ["2023", detail.apps_2023],
    ["2024", detail.apps_2024],
    ["2025", detail.apps_2025],
    ["2026", detail.eras_applicants_2026],
  ];
  const trendMax = Math.max(...trend.map(([, n]) => n ?? 0), 1);

  return (
    <main className="w-full px-8 py-6 font-sans">
      <Link
        href="/"
        className="text-[13px] font-medium text-gray-500 hover:text-gray-900"
      >
        ← All programs
      </Link>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {detail.name}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {detail.address}
            {detail.external_id && (
              <>
                {" · "}
                <a
                  className="underline decoration-gray-300 underline-offset-2 hover:text-gray-700"
                  href={`${BASE_URL}/Program/GetByIdWithMedicalSpecialty/${detail.external_id}`}
                  target="_blank"
                >
                  view original source page
                </a>
              </>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <YesNoTag label="J-1" value={detail.visa_j1} />
          <YesNoTag label="H1-B" value={detail.visa_h1b} />
          <YesNoTag label="F-1 OPT" value={detail.visa_f1_opt} />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
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
          value={
            detail.interview_rate_2026 != null
              ? `${detail.interview_rate_2026}%`
              : "--"
          }
          sub={`specialty avg ${detail.specialty_avg_interview_rate ?? "--"}%`}
        />
        <Stat
          label="Positions Offered"
          value={String(detail.positions_offered_2026 ?? "--")}
        />
        <Stat
          label="Positions Filled"
          value={String(detail.positions_filled_2026 ?? "--")}
        />
        <Stat
          label="Training Length"
          value={
            detail.training_length_years != null
              ? `${detail.training_length_years} yrs`
              : "--"
          }
        />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card title="Contact & Accreditation">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <Fact label="Program Director" value={detail.program_director} />
            <Fact
              label="Program Coordinator"
              value={detail.program_coordinator}
            />
            <Fact label="Phone" value={detail.phone} />
            <Fact
              label="Coordinator Phone"
              value={detail.program_coordinator_phone}
            />
            <Fact
              label="Email"
              value={detail.email}
              href={detail.email ? `mailto:${detail.email}` : null}
            />
            <Fact
              label="Website"
              value={
                detail.website
                  ? detail.website.replace(/^https?:\/\/(www\.)?/, "")
                  : null
              }
              href={detail.website}
            />
            <Fact label="ACGME Program Code" value={detail.acgme_program_code} />
            <Fact
              label="Institutional Setting"
              value={detail.institutional_setting}
            />
            <Fact
              label="Accreditation Status"
              value={detail.accreditation_status}
            />
            <Fact
              label="Accreditation Effective"
              value={detail.accreditation_effective_date}
            />
          </div>
        </Card>

        <Card title="Eligibility & Application">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <Fact
              label="Application Service"
              value={detail.application_service}
            />
            <Fact label="Interview Format" value={detail.interview_format} />
            <Fact label="Prior GME Required" value={detail.prior_gme_required} />
            <Fact
              label="Letters of Recommendation"
              value={detail.letters_of_recommendation}
            />
            <Fact label="J-1 (ECFMG)" value={detail.visa_j1} />
            <Fact label="H1-B" value={detail.visa_h1b} />
            <Fact label="F-1 OPT" value={detail.visa_f1_opt} />
            <Fact label="Prior-Year Residents" value={detail.residents_total} />
          </div>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card title="Signal Interview Rates">
          <table className="w-full text-[13px]">
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-1.5">Sent a signal</td>
                <td className="py-1.5 text-right font-medium">
                  {signal["Sent"] != null ? `${signal["Sent"]}%` : "--"}
                </td>
                <td className="py-1.5 text-right text-gray-400">
                  n={signalParams.countSent ?? "--"}
                </td>
              </tr>
              <tr>
                <td className="py-1.5">Did not send</td>
                <td className="py-1.5 text-right font-medium">
                  {signal["Did Not Send"] != null
                    ? `${signal["Did Not Send"]}%`
                    : "--"}
                </td>
                <td className="py-1.5 text-right text-gray-400">
                  n={signalParams.countDidNotSend ?? "--"}
                </td>
              </tr>
            </tbody>
          </table>
        </Card>

        <Card title="Applicant Type: Applied vs Invited">
          <table className="w-full text-[13px]">
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
                  <td className="py-1.5">{t}</td>
                  <td className="py-1.5 text-right">
                    {applicantTypeApp[t] != null
                      ? `${applicantTypeApp[t]}%`
                      : "--"}
                  </td>
                  <td className="py-1.5 text-right">
                    {applicantTypeInvited[t] != null
                      ? `${applicantTypeInvited[t]}%`
                      : "--"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="Step 2 CK Scores of Invited (p10–p90)">
          <table className="w-full text-[13px]">
            <tbody>
              {step2Boxplots.map((b) => (
                <tr
                  key={b.parameters.applicant}
                  className="border-b border-gray-100"
                >
                  <td className="py-1.5">{b.parameters.applicant}</td>
                  <td className="py-1.5 text-right font-medium">
                    {b.series.lower != null
                      ? `${b.series.lower}–${b.series.upper} (median ${b.series.median})`
                      : "insufficient sample"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card title="Salary & Leave">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                <th className="py-1.5 pr-4 font-normal">Year</th>
                <th className="py-1.5 pr-4 font-normal">Salary</th>
                <th className="py-1.5 pr-4 font-normal">Paid Sick Days</th>
                <th className="py-1.5 font-normal">Paid Vacation Days</th>
              </tr>
            </thead>
            <tbody>
              {salary.map((s) => (
                <tr key={s.year} className="border-b border-gray-100">
                  <td className="py-1.5 pr-4">{s.year}</td>
                  <td className="py-1.5 pr-4 font-medium">{s.salary}</td>
                  <td className="py-1.5 pr-4">{s.sick_days}</td>
                  <td className="py-1.5">{s.vacation_days}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="Application Trend (ERAS)">
          <table className="w-full text-left text-[13px]">
            <tbody>
              {trend.map(([year, n]) => (
                <tr key={year} className="border-b border-gray-100">
                  <td className="w-12 py-1.5 pr-3">{year}</td>
                  <td className="py-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-1.5 rounded bg-gray-800"
                        style={{
                          width: `${n != null ? Math.max((n / trendMax) * 100, 2) : 0}%`,
                        }}
                      />
                      <span className="shrink-0 font-medium">{n ?? "--"}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <h2 className="mt-8 text-lg font-semibold text-gray-900">
        Program Characteristics &amp; Offerings ({offerings.length})
      </h2>
      <div className="mt-3 grid gap-5 lg:grid-cols-2">
        {[...groups.entries()].map(([groupName, rows]) => (
          <Card key={groupName} title={groupName}>
            <table className="w-full text-[13px]">
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-b border-gray-100 align-top">
                    <td className="py-1.5 pr-4 text-gray-700">
                      {r.subgroup ? `${r.subgroup}: ` : ""}
                      {r.name}
                    </td>
                    <td className="whitespace-nowrap py-1.5 text-right font-medium">
                      {r.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        ))}
      </div>
    </main>
  );
}
