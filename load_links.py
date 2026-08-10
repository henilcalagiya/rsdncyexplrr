import csv
import re
import sqlite3

BASE = "/Users/henil/Desktop/Personal Projects/Residency Exp"
DB = f"{BASE}/residency_explorer.db"
LINKS = f"{BASE}/program-links.tsv"


def norm(name):
    return re.sub(r"\s+", " ", name).strip().lower()


con = sqlite3.connect(DB)
cur = con.cursor()

by_name = {norm(r[1]): r[0] for r in cur.execute("SELECT id, name FROM programs")}

matched, unmatched = 0, []
with open(LINKS, newline="", encoding="utf-8") as f:
    for row in csv.DictReader(f, delimiter="\t"):
        pid = by_name.get(norm(row["program"]))
        if pid is None:
            unmatched.append(row["program"])
            continue
        cur.execute(
            "UPDATE programs SET external_id = ?, program_id = ? WHERE id = ?",
            (row["external_id"], int(row["program_id"]), pid),
        )
        matched += 1

con.commit()

print(f"matched & updated: {matched}")
print(f"unmatched: {unmatched if unmatched else 'none'}")
total, with_link = cur.execute(
    "SELECT count(*), count(external_id) FROM programs"
).fetchone()
print(f"programs with links: {with_link}/{total}")
for r in cur.execute(
    "SELECT name, program_url FROM programs WHERE external_id IS NOT NULL LIMIT 2"
):
    print("sample:", r)
con.close()
