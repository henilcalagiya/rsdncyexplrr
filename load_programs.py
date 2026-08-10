import csv
import sqlite3

BASE = "/Users/henil/Desktop/Personal Projects/Residency Exp"
TSV = f"{BASE}/neurology-programs-2026.tsv"
DB = f"{BASE}/residency_explorer.db"

NEUROLOGY_ID = 49


def parse_range(v):
    if "-" in v and v not in ("--",):
        lo, hi = v.split("-", 1)
        return int(lo), int(hi)
    return None, None


def parse_pct(v):
    if v.endswith("%"):
        return float(v[:-1])
    return None


con = sqlite3.connect(DB)
cur = con.cursor()

# raw table preserves the exact display strings ('--' = not available, '!' = insufficient sample)
cur.execute("DROP TABLE IF EXISTS programs_raw")
cur.execute(
    """CREATE TABLE programs_raw (
        id INTEGER PRIMARY KEY,
        program TEXT NOT NULL,
        step2ck TEXT, level2ce TEXT,
        signal TEXT, no_signal TEXT,
        in_state TEXT, out_of_state TEXT,
        md TEXT, do_ TEXT, us_img TEXT, non_us_img TEXT,
        city TEXT, state TEXT, region TEXT,
        specialty_id INTEGER REFERENCES specialties(id)
    )"""
)

cur.execute("DELETE FROM programs")

metric_cols = [
    "step2ck", "level2ce", "signal", "no_signal", "in_state",
    "out_of_state", "md", "do", "us_img", "non_us_img",
]

n = 0
with open(TSV, newline="", encoding="utf-8") as f:
    for row in csv.DictReader(f, delimiter="\t"):
        n += 1
        s2_lo, s2_hi = parse_range(row["step2ck"])
        l2_lo, l2_hi = parse_range(row["level2ce"])
        has_data = 0 if all(row[c] == "--" for c in metric_cols) else 1

        cur.execute(
            """INSERT INTO programs (
                name, specialty_id, city, state, region, has_interview_data,
                signal_pct, no_signal_pct, in_state_school_pct, out_of_state_school_pct,
                invited_md_pct, invited_do_pct, invited_us_img_pct, invited_non_us_img_pct,
                step2ck_p10, step2ck_p90, level2ce_p10, level2ce_p90
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (
                row["program"], NEUROLOGY_ID, row["city"], row["state"], row["region"], has_data,
                parse_pct(row["signal"]), parse_pct(row["no_signal"]),
                parse_pct(row["in_state"]), parse_pct(row["out_of_state"]),
                parse_pct(row["md"]), parse_pct(row["do"]),
                parse_pct(row["us_img"]), parse_pct(row["non_us_img"]),
                s2_lo, s2_hi, l2_lo, l2_hi,
            ),
        )
        cur.execute(
            """INSERT INTO programs_raw (
                program, step2ck, level2ce, signal, no_signal, in_state,
                out_of_state, md, do_, us_img, non_us_img, city, state, region, specialty_id
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (
                row["program"], row["step2ck"], row["level2ce"], row["signal"],
                row["no_signal"], row["in_state"], row["out_of_state"], row["md"],
                row["do"], row["us_img"], row["non_us_img"],
                row["city"], row["state"], row["region"], NEUROLOGY_ID,
            ),
        )

con.commit()

print(f"parsed rows: {n}")
print("programs:", cur.execute("SELECT count(*) FROM programs").fetchone()[0])
print("with interview data:", cur.execute("SELECT count(*) FROM programs WHERE has_interview_data=1").fetchone()[0])
print("no data (--):", cur.execute("SELECT count(*) FROM programs WHERE has_interview_data=0").fetchone()[0])
print("states:", cur.execute("SELECT count(DISTINCT state) FROM programs").fetchone()[0])
for r in cur.execute("SELECT name, city, state, step2ck_p10, step2ck_p90, signal_pct FROM programs LIMIT 3"):
    print("sample:", r)
con.close()
