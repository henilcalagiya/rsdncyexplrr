# Residency Explorer — Local Data

Local mirror of AAMC Residency Explorer data for Neurology programs, with a Next.js
browser UI (program table, per-program detail pages, and a filterable "Key Data View").

## Setup

Rebuild the SQLite database from the captured data:

```sh
python3 load_programs.py   # 204 grid rows from neurology-programs-2026.tsv
python3 load_links.py      # external_id links from program-links.tsv
python3 load_details.py    # program-details/*.json -> detail tables
```

Then run the web app:

```sh
cd web
npm install
npm run dev   # http://localhost:3000
```

## Adding more programs

Save a program's detail page from the browser ("Webpage, Complete") into `data/`,
then:

```sh
python3 parse_saved_pages.py   # data/*.html -> program-details/*.json
python3 load_details.py        # reload the database
```

The app picks up changes automatically (pages are rendered dynamically).

## Layout

- `program-details/` — one JSON per program (contact, quick facts, 2026 interview
  data, salary, offerings, full chartSet)
- `neurology-programs-2026.tsv` / `program-links.tsv` — raw grid captures
- `web/` — Next.js app (better-sqlite3, reads `../residency_explorer.db`)
- `data/` — raw browser-saved pages (git-ignored, ~1.2 GB)
- `residency_explorer.db` — generated locally (git-ignored)
