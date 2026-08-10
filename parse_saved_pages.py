"""Parse saved Residency Explorer program pages (data/*.html) into
program-details/*.json files, then load them into residency_explorer.db
by running the detail loader logic (same schema as the manual capture).

Usage: python3 parse_saved_pages.py
"""

import glob
import json
import os
import re

from bs4 import BeautifulSoup

BASE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(BASE, "data")
OUT = os.path.join(BASE, "program-details")

GROUPS = {
    "1": "Program Characteristics",
    "2": "Educational and Research Opportunities",
    "3": "Employment Benefits",
    "4": "Practice Environment",
    "5": "Resident Demographics and Background, All Training Years",
    "6": "Completed Resident Career Plans",
}


def clean(s):
    if s is None:
        return None
    s = re.sub(r"\s+", " ", s).strip()
    return s if s not in ("", "–", "-", "--") else None


def extract_locals(html):
    """Return the program-detail `const locals` JSON (the one with chartSet)."""
    for m in re.finditer(r"const locals = ", html):
        start = m.end()
        obj, _ = json.JSONDecoder().raw_decode(html[start:])
        if "chartSet" in obj:
            return obj
    raise ValueError("no chartSet locals found")


def labeled_value(soup, label_text):
    """Find <label>label_text</label> and return its sibling span/anchor text."""
    for label in soup.find_all("label"):
        if clean(label.get_text()) == label_text:
            parent = label.parent
            a = parent.find("a")
            if a:
                return clean(a.get_text())
            spans = [clean(s.get_text()) for s in parent.find_all("span")]
            spans = [s for s in spans if s]
            if spans:
                return " ".join(spans)
            return None
    return None


def table_value(soup, header_text):
    """Find a <th> whose text equals header_text and return the adjacent <td>."""
    for th in soup.find_all("th"):
        if clean(th.get_text()) == header_text:
            td = th.find_next_sibling("td")
            if td:
                return clean(td.get_text())
    return None


def parse_page(path):
    html = open(path, encoding="utf-8").read()

    m = re.search(r"saved from url=\(\d+\)(\S+)", html)
    url = m.group(1) if m else None
    external_id = url.rsplit("/", 1)[-1] if url else None

    loc = extract_locals(html)
    soup = BeautifulSoup(html, "html.parser")

    name = clean(soup.find("h1", class_="program-detail-name").get_text())

    # address spans live in the col with the Address label
    address = labeled_value(soup, "Address")

    program_id = None
    m = re.search(r'id="MyCompare_(\d+)"', html)
    if m:
        program_id = int(m.group(1))

    # selectivity: values are in tds following '# of ERAS Applicants:' and
    # '% of Applicants Invited to Interview' (program first, then specialty avg)
    def selectivity_pair(header):
        for th in soup.find_all("th"):
            if clean(th.get_text()) == header:
                tds = th.find_next_siblings("td")
                vals = [clean(td.get_text()) for td in tds[:2]]
                return vals + [None] * (2 - len(vals))
        return [None, None]

    eras_apps, avg_apps = selectivity_pair("# of ERAS Applicants:")
    pct_invited, avg_pct = selectivity_pair("% of Applicants Invited to Interview")

    invited_count = None
    m = re.search(
        r"Invited to Interview Count:</strong></p>\s*<h5[^>]*>\s*([\d,]+)", html
    )
    if m:
        invited_count = int(m.group(1).replace(",", ""))

    # match outcomes: the table headed '# of Positions Offered' lists one row
    # per track type (Categorical, Advanced, Preliminary, ...)
    match_tracks = {}
    for th in soup.find_all("th"):
        if clean(th.get_text()) == "# of Positions Offered":
            table = th.find_parent("table")
            for row_th in table.find("tbody").find_all("th"):
                track = clean(row_th.get_text())
                tds = row_th.find_next_siblings("td")
                if track and len(tds) >= 2:
                    match_tracks[track] = (
                        clean(tds[0].get_text()),
                        clean(tds[1].get_text()),
                    )
            break

    def num(v):
        if v is None:
            return None
        v = v.replace(",", "")
        try:
            return float(v) if "." in v else int(v)
        except ValueError:
            return None

    residents = {
        "total": num(table_value(soup, "Total")),
        "year1": num(table_value(soup, "Year 1")),
        "year2": num(table_value(soup, "Year 2")),
        "year3": num(table_value(soup, "Year 3")),
    }

    detail = {
        "programId": program_id,
        "externalId": external_id,
        "name": name,
        "specialtyId": 49,
        "sourceFile": os.path.basename(path),
        "sourceUrl": url,
        "contact": {
            "phone": labeled_value(soup, "Phone"),
            "website": labeled_value(soup, "Website"),
            "address": address,
            "email": labeled_value(soup, "Email"),
            "region": labeled_value(soup, "Region"),
            "acgmeProgramCode": labeled_value(soup, "ACGME Program Code"),
            "programDirector": labeled_value(soup, "Program Director"),
            "programCoordinator": labeled_value(soup, "Program Coordinator"),
            "programCoordinatorPhone": labeled_value(soup, "Program Coordinator Phone"),
        },
        "quickFacts": {
            "institutionalSetting": table_value(soup, "Institutional Setting"),
            "accreditationStatus": table_value(soup, "Accreditation Status"),
            "accreditationEffectiveDate": table_value(soup, "Accreditation Effective Date"),
            "accreditedTrainingLengthYears": num(
                table_value(soup, "Accredited Length of Training (years)")
            ),
            "priorYearActiveResidents": residents,
        },
        "applicationDetails": {
            "applicationService": table_value(soup, "Application Service"),
            "interviewFormat": table_value(soup, "Interview Format"),
            "priorGmeRequired": table_value(soup, "Prior GME Required"),
            "priorGmeYearsRequired": table_value(soup, "# of Years of Prior GME Required"),
            "visaJ1SponsorshipEcfmg": table_value(soup, "J-1 Sponsorship through ECFMG"),
            "visaH1B": table_value(soup, "H1-B"),
            "visaF1Opt": table_value(soup, "F-1 (OPT 1st year)"),
            "totalLettersOfRecommendation": table_value(soup, "Total Letters of Recommendation"),
        },
        "matchOutcomes2026": {
            track.lower(): {"positionsOffered": num(o), "positionsFilled": num(f)}
            for track, (o, f) in match_tracks.items()
        },
        "selectivity2026": {
            "erasApplicants": num(eras_apps),
            "specialtyAvgErasApplicants": num(avg_apps),
            "pctApplicantsInvitedToInterview": num(pct_invited),
            "specialtyAvgPctInvited": num(avg_pct),
            "applicantsInvitedToInterviewCount": invited_count,
        },
        "applicants": loc.get("applicants"),
        "salaryTable": loc.get("salaryTable"),
        "chartSet": loc.get("chartSet"),
        "alignmentTable": {
            "groups": GROUPS,
            "rows": loc.get("alignmentTable", {}).get("rows", []),
        },
    }
    return detail


def main():
    os.makedirs(OUT, exist_ok=True)
    for path in sorted(glob.glob(os.path.join(DATA, "*.html"))):
        d = parse_page(path)
        slug = re.sub(r"[^a-z0-9]+", "-", d["name"].lower()).strip("-")[:50]
        out_path = os.path.join(OUT, f"{slug}-{d['programId']}.json")
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(d, f, indent=2, ensure_ascii=False)
        print(f"parsed {os.path.basename(path)} -> {os.path.basename(out_path)}")
        print(
            f"  {d['name']} | apps={d['selectivity2026']['erasApplicants']} "
            f"rate={d['selectivity2026']['pctApplicantsInvitedToInterview']}% "
            f"director={d['contact']['programDirector']}"
        )


if __name__ == "__main__":
    main()
