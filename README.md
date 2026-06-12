# Sarath Adukkadukkam — Portfolio

A clean, minimal personal portfolio built with the current modern web stack.

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Build for production

```bash
npm run build
npm run start
```


## Editing content

All text lives in **`lib/data.ts`** — profile, experience, research, projects,
skills, education and contact details. Edit that one file to update the site.

## Documents

The following live in `public/` and are linked from the site:

- `Sarath_Adukkadukkam_Resume.pdf` — résumé (Resume button)
- `ECG_Anaesthesia_Monitoring_Report.pdf` — research report
- `ALIA_Delivery_MQTT_Report.pdf` — research report

## Project structure

```
app/
  layout.tsx      # fonts, metadata
  page.tsx        # section order
  globals.css     # theme tokens & base styles
  icon.png        # favicon
components/        # Navbar, Hero, About, Experience, Research, Projects, Skills, Education, Contact, Footer
lib/data.ts        # all editable content
public/            # photo, résumé, report PDFs
_old_site_backup/  # your previous vanilla HTML/CSS/JS site
```
