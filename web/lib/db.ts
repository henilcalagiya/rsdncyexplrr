import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

// deployed (Vercel): the db is bundled inside web/; local dev: the canonical
// copy lives one level above the web/ app folder
const candidates = [
  path.join(process.cwd(), "residency_explorer.db"),
  path.join(process.cwd(), "..", "residency_explorer.db"),
];
const dbPath = candidates.find((p) => fs.existsSync(p)) ?? candidates[0];

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(dbPath, { readonly: true, fileMustExist: true });
  }
  return db;
}

export type Specialty = { id: number; name: string };
export type SiteLink = { id: number; label: string; path: string; kind: string };
export type ApiEndpoint = { id: number; path: string; method: string; purpose: string };
export type Program = {
  id: number;
  name: string;
  external_id: string | null;
  city: string | null;
  state: string | null;
  region: string | null;
  program_url: string | null;
  invited_md_pct: number | null;
  invited_do_pct: number | null;
  invited_us_img_pct: number | null;
  invited_non_us_img_pct: number | null;
  step2ck_p10: number | null;
  step2ck_p90: number | null;
};

export function getSpecialties(): Specialty[] {
  return getDb().prepare("SELECT id, name FROM specialties ORDER BY name").all() as Specialty[];
}

export function getSiteLinks(): SiteLink[] {
  return getDb().prepare("SELECT * FROM site_links ORDER BY kind, label").all() as SiteLink[];
}

export function getApiEndpoints(): ApiEndpoint[] {
  return getDb().prepare("SELECT * FROM api_endpoints ORDER BY id").all() as ApiEndpoint[];
}

// Raw display strings as captured from the site ('--' = not available, '!' = insufficient sample)
export type ProgramRaw = {
  id: number;
  program: string;
  step2ck: string;
  level2ce: string;
  signal: string;
  no_signal: string;
  in_state: string;
  out_of_state: string;
  md: string;
  do_: string;
  us_img: string;
  non_us_img: string;
  city: string;
  state: string;
  region: string;
  program_url: string | null;
  detail_id: number | null;
};

export function getProgramsRaw(): ProgramRaw[] {
  return getDb()
    .prepare(
      `SELECT pr.*, p.program_url, d.program_id AS detail_id
       FROM programs_raw pr
       LEFT JOIN programs p ON p.name = pr.program
       LEFT JOIN program_details d ON d.program_id = p.program_id
       ORDER BY pr.program`
    )
    .all() as ProgramRaw[];
}

export type ProgramDetail = {
  program_id: number;
  external_id: string | null;
  name: string;
  phone: string | null;
  website: string | null;
  address: string | null;
  email: string | null;
  acgme_program_code: string | null;
  program_director: string | null;
  program_coordinator: string | null;
  program_coordinator_phone: string | null;
  institutional_setting: string | null;
  accreditation_status: string | null;
  accreditation_effective_date: string | null;
  training_length_years: number | null;
  residents_total: number | null;
  application_service: string | null;
  interview_format: string | null;
  prior_gme_required: string | null;
  visa_j1: string | null;
  visa_h1b: string | null;
  visa_f1_opt: string | null;
  letters_of_recommendation: string | null;
  eras_applicants_2026: number | null;
  invited_to_interview_2026: number | null;
  interview_rate_2026: number | null;
  specialty_avg_applicants: number | null;
  specialty_avg_interview_rate: number | null;
  positions_offered_2026: number | null;
  positions_filled_2026: number | null;
  apps_2022: number | null;
  apps_2023: number | null;
  apps_2024: number | null;
  apps_2025: number | null;
  raw_json: string;
};

export type ProgramOffering = {
  group_name: string;
  subgroup: string | null;
  name: string;
  value: string;
};

export type ProgramSalaryRow = {
  year: string;
  salary: string;
  sick_days: string;
  vacation_days: string;
};

export function getProgramDetail(programId: number): ProgramDetail | undefined {
  return getDb()
    .prepare("SELECT * FROM program_details WHERE program_id = ?")
    .get(programId) as ProgramDetail | undefined;
}

export function getProgramOfferings(programId: number): ProgramOffering[] {
  return getDb()
    .prepare(
      "SELECT group_name, subgroup, name, value FROM program_offerings WHERE program_id = ? ORDER BY id"
    )
    .all(programId) as ProgramOffering[];
}

export function getProgramSalary(programId: number): ProgramSalaryRow[] {
  return getDb()
    .prepare(
      "SELECT year, salary, sick_days, vacation_days FROM program_salary WHERE program_id = ? ORDER BY id"
    )
    .all(programId) as ProgramSalaryRow[];
}

export function getPrograms(): Program[] {
  return getDb()
    .prepare(
      `SELECT id, name, external_id, city, state, region, program_url,
              invited_md_pct, invited_do_pct, invited_us_img_pct, invited_non_us_img_pct,
              step2ck_p10, step2ck_p90
       FROM programs ORDER BY name`
    )
    .all() as Program[];
}

// Flattened row for the custom "key data" view — one row per program detail,
// with chart-derived fields pulled out of raw_json
export type CustomRow = {
  program_id: number;
  name: string;
  website: string | null;
  phone: string | null;
  address: string | null;
  email: string | null;
  region: string | null;
  state: string | null;
  city: string | null;
  acgme_program_code: string | null;
  program_director: string | null;
  program_coordinator: string | null;
  program_coordinator_phone: string | null;
  training_length_years: number | null;
  residents_total: number | null;
  residents_year1: number | null;
  interview_format: string | null;
  visa_j1: string | null;
  visa_h1b: string | null;
  visa_f1_opt: string | null;
  osteopathic_recognition: string | null;
  research_track: string | null;
  pct_residents_non_us_img: string | null;
  applicants_2026: number | null;
  invited_2026: number | null;
  interview_rate_2026: number | null;
  signal_app_sent: number | null;
  signal_app_not_sent: number | null;
  signal_inv_sent: number | null;
  signal_inv_not_sent: number | null;
  applicant_non_us_img_pct: number | null;
  invited_non_us_img_pct: number | null;
  step2_all_low: number | null;
  step2_all_high: number | null;
};

export function getCustomRows(): CustomRow[] {
  const rows = getDb()
    .prepare(
      `SELECT d.program_id, d.name, d.website, d.phone, d.address, d.email,
              d.acgme_program_code, d.program_director, d.program_coordinator,
              d.program_coordinator_phone, d.training_length_years, d.residents_total,
              d.interview_format, d.visa_j1, d.visa_h1b, d.visa_f1_opt,
              (SELECT o.value FROM program_offerings o
                WHERE o.program_id = d.program_id AND o.name = 'Osteopathic Recognition'
                LIMIT 1) AS osteopathic_recognition,
              (SELECT o.value FROM program_offerings o
                WHERE o.program_id = d.program_id AND o.name = 'Research track/fellowship'
                LIMIT 1) AS research_track,
              d.eras_applicants_2026 AS applicants_2026,
              d.invited_to_interview_2026 AS invited_2026,
              d.interview_rate_2026, d.raw_json,
              MIN(p.city) AS city, MIN(p.state) AS state, MIN(p.region) AS region,
              (SELECT o.value FROM program_offerings o
                WHERE o.program_id = d.program_id
                  AND o.name = 'Percentage of current residents who are Non-US IMG'
                LIMIT 1) AS pct_residents_non_us_img
       FROM program_details d
       LEFT JOIN programs p ON p.program_id = d.program_id
       GROUP BY d.program_id
       ORDER BY d.name`
    )
    .all() as (Record<string, unknown> & { raw_json: string })[];

  return rows.map((r) => {
    const raw = JSON.parse(r.raw_json);
    const cs = raw.chartSet ?? {};
    const sigApp = cs.signalCompositionOfApplicants?.series ?? {};
    const sigInv = cs.signalCompositionOfInvitedToInterview?.series ?? {};
    const typeApp = cs.applicantTypeApp?.series ?? {};
    const typeInv = cs.applicantTypeInvitedToInterview?.series ?? {};
    const step2All = (cs.step2CKScores ?? []).find(
      (b: { parameters?: { applicant?: string } }) =>
        b.parameters?.applicant === "All Applicants Invited"
    );
    const { raw_json: _raw, ...rest } = r;
    return {
      ...(rest as unknown as CustomRow),
      residents_year1:
        raw.quickFacts?.priorYearActiveResidents?.year1 ?? null,
      signal_app_sent: sigApp["Sent"] ?? null,
      signal_app_not_sent: sigApp["Did Not Send"] ?? null,
      signal_inv_sent: sigInv["Sent"] ?? null,
      signal_inv_not_sent: sigInv["Did Not Send"] ?? null,
      applicant_non_us_img_pct: typeApp["Non-US IMG"] ?? null,
      invited_non_us_img_pct: typeInv["Non-US IMG"] ?? null,
      step2_all_low: step2All?.series?.lower ?? null,
      step2_all_high: step2All?.series?.upper ?? null,
    };
  });
}

export function getCounts() {
  const d = getDb();
  const count = (table: string) =>
    (d.prepare(`SELECT count(*) AS n FROM ${table}`).get() as { n: number }).n;
  return {
    specialties: count("specialties"),
    siteLinks: count("site_links"),
    apiEndpoints: count("api_endpoints"),
    states: count("states"),
    regions: count("regions"),
    programs: count("programs"),
  };
}
