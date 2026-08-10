import glob
import json
import sqlite3

BASE = "/Users/henil/Desktop/Personal Projects/Residency Exp"
DB = f"{BASE}/residency_explorer.db"

con = sqlite3.connect(DB)
cur = con.cursor()

cur.executescript(
    """
CREATE TABLE IF NOT EXISTS program_details (
    program_id INTEGER PRIMARY KEY,          -- site ProgramId (e.g. 2357), matches programs.program_id
    external_id TEXT,
    name TEXT,
    phone TEXT, website TEXT, address TEXT, email TEXT,
    acgme_program_code TEXT,
    program_director TEXT, program_coordinator TEXT, program_coordinator_phone TEXT,
    institutional_setting TEXT, accreditation_status TEXT, accreditation_effective_date TEXT,
    training_length_years INTEGER, residents_total INTEGER,
    application_service TEXT, interview_format TEXT,
    prior_gme_required TEXT, visa_j1 TEXT, visa_h1b TEXT, visa_f1_opt TEXT,
    letters_of_recommendation TEXT,
    eras_applicants_2026 INTEGER, invited_to_interview_2026 INTEGER, interview_rate_2026 REAL,
    specialty_avg_applicants INTEGER, specialty_avg_interview_rate REAL,
    positions_offered_2026 INTEGER, positions_filled_2026 INTEGER,
    apps_2022 INTEGER, apps_2023 INTEGER, apps_2024 INTEGER, apps_2025 INTEGER,
    raw_json TEXT                            -- full captured JSON incl. chartSet
);

CREATE TABLE IF NOT EXISTS program_offerings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    program_id INTEGER REFERENCES program_details(program_id),
    group_name TEXT, subgroup TEXT, name TEXT, value TEXT
);

CREATE TABLE IF NOT EXISTS program_salary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    program_id INTEGER REFERENCES program_details(program_id),
    year TEXT, salary TEXT, sick_days TEXT, vacation_days TEXT
);
"""
)

for path in sorted(glob.glob(f"{BASE}/program-details/*.json")):
    d = json.load(open(path, encoding="utf-8"))
    pid = d["programId"]
    c = d.get("contact", {})
    q = d.get("quickFacts", {})
    a = d.get("applicationDetails", {})
    s = d.get("selectivity2026", {})
    # sum positions across all track types (categorical, advanced, ...)
    tracks = [t for t in d.get("matchOutcomes2026", {}).values() if isinstance(t, dict)]
    offered_vals = [t.get("positionsOffered") for t in tracks if t.get("positionsOffered") is not None]
    filled_vals = [t.get("positionsFilled") for t in tracks if t.get("positionsFilled") is not None]
    m = {
        "positionsOffered": sum(offered_vals) if offered_vals else None,
        "positionsFilled": sum(filled_vals) if filled_vals else None,
    }
    apps = d.get("applicants", {})

    cur.execute("DELETE FROM program_details WHERE program_id = ?", (pid,))
    cur.execute("DELETE FROM program_offerings WHERE program_id = ?", (pid,))
    cur.execute("DELETE FROM program_salary WHERE program_id = ?", (pid,))

    cur.execute(
        "INSERT INTO program_details VALUES (" + ",".join(["?"] * 35) + ")",
        (
            pid, d.get("externalId"), d.get("name"),
            c.get("phone"), c.get("website"), c.get("address"), c.get("email"),
            c.get("acgmeProgramCode"),
            c.get("programDirector"), c.get("programCoordinator"), c.get("programCoordinatorPhone"),
            q.get("institutionalSetting"), q.get("accreditationStatus"), q.get("accreditationEffectiveDate"),
            q.get("accreditedTrainingLengthYears"),
            (q.get("priorYearActiveResidents") or {}).get("total"),
            a.get("applicationService"), a.get("interviewFormat"),
            a.get("priorGmeRequired"), a.get("visaJ1SponsorshipEcfmg"), a.get("visaH1B"), a.get("visaF1Opt"),
            a.get("totalLettersOfRecommendation"),
            s.get("erasApplicants"), s.get("applicantsInvitedToInterviewCount"),
            s.get("pctApplicantsInvitedToInterview"),
            s.get("specialtyAvgErasApplicants"), s.get("specialtyAvgPctInvited"),
            m.get("positionsOffered"), m.get("positionsFilled"),
            apps.get("n_APPS2022"), apps.get("n_APPS2023"), apps.get("n_APPS2024"), apps.get("n_APPS2025"),
            json.dumps(d),
        ),
    )

    groups = d.get("alignmentTable", {}).get("groups", {})
    for row in d.get("alignmentTable", {}).get("rows", []):
        cur.execute(
            "INSERT INTO program_offerings (program_id, group_name, subgroup, name, value) VALUES (?,?,?,?,?)",
            (pid, groups.get(str(row["groupId"])), row.get("subGroup"), row["name"], row["programOffering"]),
        )

    for row in d.get("salaryTable", {}).get("rows", []):
        cur.execute(
            "INSERT INTO program_salary (program_id, year, salary, sick_days, vacation_days) VALUES (?,?,?,?,?)",
            (pid, row["year"], row["salary"], row["sickDays"], row["vacationDays"]),
        )

    print(f"loaded {path.split('/')[-1]}: {d.get('name')}")

con.commit()

# backfill programs.program_id/external_id from loaded details (match by
# whitespace-normalized name) so grid rows link up without the tbody paste
import re


def norm(name):
    return re.sub(r"\s+", " ", name).strip().lower()


detail_by_name = {
    norm(name): (pid, ext)
    for pid, ext, name in cur.execute(
        "SELECT program_id, external_id, name FROM program_details"
    )
}
synced = 0
for row_id, name in cur.execute("SELECT id, name FROM programs").fetchall():
    hit = detail_by_name.get(norm(name))
    if hit:
        cur.execute(
            "UPDATE programs SET program_id = ?, external_id = ? WHERE id = ?",
            (hit[0], hit[1], row_id),
        )
        synced += 1
con.commit()
print("programs synced with details:", synced)

print("details:", cur.execute("SELECT count(*) FROM program_details").fetchone()[0])
print("offerings:", cur.execute("SELECT count(*) FROM program_offerings").fetchone()[0])
print("salary rows:", cur.execute("SELECT count(*) FROM program_salary").fetchone()[0])
print(cur.execute(
    "SELECT name, program_director, eras_applicants_2026, interview_rate_2026, positions_filled_2026 FROM program_details"
).fetchall())
con.close()

# refresh the committed copy that Vercel deploys
import shutil

shutil.copyfile(DB, f"{BASE}/web/residency_explorer.db")
print("copied db to web/residency_explorer.db")
